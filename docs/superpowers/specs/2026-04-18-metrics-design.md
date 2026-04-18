# Metrics & Product Analytics — Design

**Date:** 2026-04-18
**Status:** Approved (pending user review of this spec)
**Scope:** Replace the existing Prometheus-based ops metrics with a single event-sourced analytics pipeline backed by Postgres, queried via Metabase.

## Goals

Provide a unified answer to three classes of questions:

1. **Product usage** — who uses which commands/features, at what frequency, in which guilds.
2. **Ops health** — command success rates, error trends, guild count, WOTD delivery health.
3. **Monetization funnel** — premium entitlement checks, who hits premium gates, conversion from free→paid behaviors.

One pipeline. Postgres is the source of truth. Metabase is the view layer. No Prometheus.

## Non-Goals

- No real-time ops dashboards with <10s freshness. Metabase refreshes on its own cadence; that is sufficient.
- No session reconstruction, funnels, or cohorts at the data model level — those are derived in Metabase.
- No event schema versioning. Breaking payload changes = new event name.
- No sampling.
- No self-service data deletion UI. Manual `DELETE FROM events WHERE user_id = $1` is sufficient for now.

## Current State

- `prom-client` is wired up in `apps/bot/src/index.ts` with `/metrics` exposed on port 2399.
- Metrics currently emitted: `thoth_*` default node metrics, `thoth_metrics_guilds` (gauge), `thoth_wotd_subscribers` (gauge), `thoth_commands{command,success}` (counter).
- `docker-compose.prod.yml` has fully scaffolded but commented-out services for prometheus, grafana, loki, promtail, cadvisor. The `docker/prometheus/`, `docker/grafana/`, `docker/promtail/` directories exist and will be deleted.
- Button and modal interactions are NOT tracked by the existing counter — a real gap.
- Command invocations also log to a Discord webhook (`COMMAND_LOG_WEBHOOK_URL`). That webhook continues to work unchanged; it is orthogonal to this pipeline.

## Architecture

### Data Model

One table, appended to `docker/postgres/init.sql`:

```sql
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id text,
  guild_id text,
  props jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);
create index idx_events_name_time on events (name, occurred_at desc);
create index idx_events_user_time on events (user_id, occurred_at desc) where user_id is not null;
create index idx_events_guild_time on events (guild_id, occurred_at desc) where guild_id is not null;
```

Naming convention: dot-namespaced (`command.invoked`, `wotd.delivered`, `entitlement.checked`). Payload in `props` jsonb.

### Event Registry

Central file `apps/bot/src/metrics/events.ts`:

- One zod schema per event name.
- TS union derived from the schema map.
- Adding a new event = adding one entry to this file.

Initial event catalog:

| Name                  | Props                                                       | Notes                                                      |
| --------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| `command.invoked`     | `{ command: string, success: boolean, durationMs: number }` | Replaces `thoth_commands` counter.                         |
| `button.clicked`      | `{ customId: string }`                                      | New. Closes a gap.                                         |
| `modal.submitted`     | `{ customId: string }`                                      | New. Closes a gap.                                         |
| `guild.joined`        | `{ memberCount: number }`                                   | Replaces gauge inc.                                        |
| `guild.left`          | `{}`                                                        | Replaces gauge dec.                                        |
| `wotd.delivered`      | `{ word: string, tier: 'free' \| 'premium' }`               | Emitted from jobs.ts per successful delivery.              |
| `wotd.quiz_attempted` | `{ word: string, correct: boolean }`                        | Double-written alongside `wotd_quiz_attempt` table insert. |
| `entitlement.checked` | `{ kind: 'premium', granted: boolean }`                     | New. Enables conversion-funnel queries.                    |
| `feedback.submitted`  | `{ type: 'bug' \| 'feature' \| 'general' }`                 | New.                                                       |

### Typed Wrapper

`apps/bot/src/metrics/track.ts` exposes a `track` object with one method per event name:

```ts
track.commandInvoked(userId, guildId, { command, success, durationMs });
track.buttonClicked(userId, guildId, { customId });
// ...
```

Internally each method:

1. Validates the payload against its zod schema.
    - In `NODE_ENV === 'development'`: throws on failure.
    - In production: logs a warning and drops the event. Never propagates an error to the caller.
2. Enqueues the event to the BullMQ `events` queue.
3. Returns `void`. Caller does not `await`.

### Queue + Worker

- **Queue**: new BullMQ queue `events`, separate from the existing `jobs` queue so analytics traffic cannot starve WOTD delivery.
- **Worker** (`apps/bot/src/metrics/worker.ts`): drains the queue, batches up to 100 events or a 1s window (whichever fires first), then performs a single multi-values `INSERT INTO events (...) VALUES (...), (...), ...`. BullMQ handles retries with exponential backoff on failure.
- **Fallback**: if enqueue itself fails (redis unreachable), events go into a per-process in-memory ring buffer (capacity 500). On next successful enqueue, buffer is drained. If the process restarts with a non-empty buffer, those events are lost. Acceptable for analytics.

### Retention

One repeating BullMQ job in the `jobs` queue: `events-retention`, cron `0 3 * * *` (03:00 daily). Runs:

```sql
delete from events where occurred_at < now() - interval '180 days';
```

180 days chosen so that premium→free churn cycles (monthly) have a 6x window for funnel analysis. Configurable via env later if needed.

### Metabase

Added to `docker-compose.prod.yml` as a new service:

- Image: `metabase/metabase:latest`
- Backend: **Postgres**, using the same Postgres instance, in a separate schema (`metabase`). Env vars: `MB_DB_TYPE=postgres`, `MB_DB_DBNAME=thoth`, `MB_DB_PORT=5432`, `MB_DB_USER=metabase_app`, `MB_DB_PASS=...`, `MB_DB_HOST=postgres`. No separate volume for metadata.
- Exposed internally only. External access via existing reverse proxy (user's decision — outside spec scope).

Two new postgres roles created in init.sql:

- `metabase_app` — owns `metabase` schema, used for Metabase's internal metadata.
- `metabase_reader` — readonly, `SELECT` on `public.events` and other `public.*` tables relevant to analytics (wotd\_\*, feedback_submission). This is the role configured inside Metabase for querying thoth data.

## Module Layout

```
apps/bot/src/metrics/
  events.ts       # zod registry + TS event union
  track.ts        # typed track.*() API
  queue.ts        # bullmq queue factory + DI registration
  worker.ts       # drains queue, batches inserts
  retention.ts    # registers the daily delete job
  index.ts        # public exports: { track, setupMetrics }
```

Dependencies:

- `events.ts` → zod only.
- `track.ts` → `events.ts`, bullmq queue (via DI).
- `worker.ts` → postgres (via DI), bullmq.
- `queue.ts` → bullmq, tsyringe.
- `retention.ts` → postgres (via DI), bullmq.
- `index.ts` → re-exports.

Boundaries:

- Call sites depend on `track` only. They never see bullmq, the queue, or postgres.
- The worker is the only component that writes to the `events` table.
- Adding a new event = touch `events.ts` + one call site. No other file changes.

## Call-Site Changes

| Site                                                                           | Change                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/bot/src/events/interactionCreate.ts`                                     | Replace `commandsMetrics.inc(...)` with `track.commandInvoked(...)`. Add `track.buttonClicked` in `handleButton`, `track.modalSubmitted` in `handleModalSubmit`. Add `track.wotdQuizAttempted` next to the `INSERT INTO wotd_quiz_attempt`. |
| `apps/bot/src/events/guildCreate.ts`                                           | Replace `guildCount.inc()` with `track.guildJoined`.                                                                                                                                                                                        |
| `apps/bot/src/events/guildDelete.ts`                                           | Replace `guildCount.dec()` with `track.guildLeft`.                                                                                                                                                                                          |
| `apps/bot/src/events/ready.ts`                                                 | Remove `guildCount.set(...)` gauge initialization. Metabase computes current guild count from `guild.joined` − `guild.left` or from the live discord.js cache via a small endpoint if needed.                                               |
| `apps/bot/src/jobs.ts`                                                         | After each successful `deliverToGuild`, emit `track.wotdDelivered` with tier derived from whether `post_time` was set.                                                                                                                      |
| `apps/bot/src/structures/EntitlementCache.ts` (call sites of `isGuildPremium`) | Emit `track.entitlementChecked` with `granted` reflecting the return value.                                                                                                                                                                 |
| `apps/bot/src/events/interactionCreate.ts` (feedback flow)                     | After the feedback row is inserted, emit `track.feedbackSubmitted`.                                                                                                                                                                         |

## Prometheus Teardown

- Remove `prom-client` from `apps/bot/package.json` dependencies.
- `apps/bot/src/index.ts`: delete `Registry`, `collectDefaultMetrics`, `guildCount`, `thoth_wotd_subscribers` gauge, the `/metrics` route, the `Registry` DI binding, the `kGuildCountGuage` binding.
- `apps/bot/src/util/symbols.ts`: remove `kGuildCountGuage`.
- `apps/bot/src/events/interactionCreate.ts`: remove the file-scoped `registry` / `commandsMetrics`.
- `apps/bot/src/events/guildCreate.ts`, `guildDelete.ts`, `ready.ts`: remove `Gauge` imports and gauge parameters from constructors.
- Delete directories: `docker/prometheus/`, `docker/grafana/`, `docker/promtail/`.
- `docker-compose.prod.yml`: delete the commented-out prometheus, grafana, loki, promtail, cadvisor service blocks and the `prometheus-storage`, `grafana-storage`, `loki-storage` volumes. Keep `postgres-storage`.

## Failure Semantics

| Failure                            | Behavior                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Redis (BullMQ) unreachable         | `track.*` catches enqueue error, buffers event in-process ring (cap 500). Oldest dropped at overflow. On next success, buffer drains. |
| Zod validation fails               | Dev: throws. Prod: `logger.warn`, drop event. Never propagated to the caller.                                                         |
| Postgres insert fails in worker    | BullMQ retries with default exponential backoff. After max retries, event lands in failed-job list for manual inspection.             |
| Process crash with buffered events | Buffered events are lost. Acceptable.                                                                                                 |
| Metabase down                      | No impact on the bot.                                                                                                                 |

## Privacy Posture

- `user_id` and `guild_id` are stored as raw Discord snowflakes (text). Consistent with existing `wotd_quiz_attempt`, `feedback_submission`, and pino logs.
- Props must not contain raw message content, DM text, or other user-authored free-form text. Props are limited to enums, IDs, counts, and booleans per the schemas in `events.ts`. Reviewer responsibility on PRs.
- A future `DELETE FROM events WHERE user_id = $1` is trivially supported.

## Testing

No test framework is currently configured in the repo. This spec does not add one. The implementation plan may introduce a minimal test harness (vitest) for the worker's batching + the zod schema validation, since those are the two components with non-trivial logic that isn't immediately visible at runtime. Decision deferred to the implementation plan.

## Migration / Rollout

1. Ship the new `events` table (additive init.sql change; safe).
2. Ship the metrics module and worker in the same bot release; no call sites are changed yet — worker drains nothing, does nothing.
3. Ship call-site changes + prom teardown in a second bot release. This is the breakover.
4. Ship the `docker-compose.prod.yml` metabase service as a separate infra change.
5. Configure metabase (admin account, data source, initial dashboards) manually.

Each step is independently revertible. Steps 2 and 3 can be combined if we're feeling frisky.

## Open Questions Resolved

- **Metabase backend**: Postgres, separate `metabase` schema.
- **Readonly role**: Yes, `metabase_reader` created at init.
- **wotd_quiz_attempt double-write**: Yes, events are the unified analytics query surface; the existing table remains the canonical quiz record.

## Implementation Plan

To be generated via `superpowers:writing-plans` after user approves this spec.
