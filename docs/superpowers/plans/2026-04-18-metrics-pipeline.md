# Metrics Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Prometheus-based metrics system with a Postgres-backed, event-sourced analytics pipeline ingested via BullMQ, viewed via Metabase.

**Architecture:** Call sites fire typed `track.*()` calls that zod-validate their payload, enqueue to a dedicated BullMQ `events` queue, and are batched into a single wide Postgres `events` table by a worker. Retention enforced by a daily BullMQ cron. Metabase runs in the same compose stack with its own Postgres schema.

**Tech Stack:** TypeScript (ESM, tsc), discord.js, tsyringe (DI), BullMQ, `postgres` npm pkg, zod, `bun test` (added here — no test framework currently installed), Metabase, Docker Compose.

**Spec:** `docs/superpowers/specs/2026-04-18-metrics-design.md`

---

## File Structure

**Create:**

- `apps/bot/src/metrics/events.ts` — zod registry, TS union
- `apps/bot/src/metrics/ring-buffer.ts` — fixed-capacity ring buffer for queue-failure fallback
- `apps/bot/src/metrics/queue.ts` — BullMQ `events` queue factory
- `apps/bot/src/metrics/track.ts` — typed `track.*` API
- `apps/bot/src/metrics/worker.ts` — batching consumer
- `apps/bot/src/metrics/retention.ts` — daily cleanup cron job
- `apps/bot/src/metrics/index.ts` — public exports + `setupMetrics`
- `apps/bot/__tests__/metrics/events.test.ts`
- `apps/bot/__tests__/metrics/ring-buffer.test.ts`
- `apps/bot/__tests__/metrics/track.test.ts`
- `apps/bot/__tests__/metrics/worker.test.ts`
- `docker/postgres/02-metabase-roles.sh` — role creation w/ env-provided passwords

**Modify:**

- `docker/postgres/init.sql` — append `events` table + indexes + metabase schema + grants
- `apps/bot/package.json` — remove `prom-client`, add `test` script (no deps needed — uses `bun`)
- `apps/bot/src/util/symbols.ts` — remove `kGuildCountGuage`, add `kEventsQueue`, `kMetricsRingBuffer`
- `apps/bot/src/index.ts` — tear down prom, call `setupMetrics`
- `apps/bot/src/events/interactionCreate.ts` — `track.commandInvoked` / `buttonClicked` / `modalSubmitted` / `wotdQuizAttempted` / `feedbackSubmitted`
- `apps/bot/src/events/guildCreate.ts` — `track.guildJoined`
- `apps/bot/src/events/guildDelete.ts` — `track.guildLeft`
- `apps/bot/src/events/ready.ts` — remove gauge init
- `apps/bot/src/events/entitlementCreate.ts` — `track.entitlementGranted`
- `apps/bot/src/events/entitlementUpdate.ts` — `track.entitlementGranted`
- `apps/bot/src/events/entitlementDelete.ts` — `track.entitlementRevoked`
- `apps/bot/src/jobs.ts` — `track.wotdDelivered`, `track.entitlementChecked` (wotd_delivery), register `events-retention` job
- `apps/bot/src/commands/setup/sub/wotd.ts` — `track.entitlementChecked` (wotd_setup)
- `docker-compose.prod.yml` — remove commented-out prom/grafana/loki/promtail/cadvisor blocks, remove orphan volumes, add Metabase service, pass role passwords to postgres

**Delete:**

- `docker/prometheus/`
- `docker/grafana/`
- `docker/promtail/`

---

## Task 1: Schema — events table + indexes + metabase schema/roles

**Files:**

- Modify: `docker/postgres/init.sql` (append)
- Create: `docker/postgres/02-metabase-roles.sh`
- Modify: `docker/postgres/Dockerfile`

Postgres runs files in `/docker-entrypoint-initdb.d/` in sorted filename order. We need the schema to be created BEFORE the metabase role script grants `select on all tables in schema public`, so rename `init.sql` → `01-init.sql` and name the roles script `02-metabase-roles.sh`.

- [ ] **Step 1: Rename `docker/postgres/init.sql` → `docker/postgres/01-init.sql`**

```bash
git mv docker/postgres/init.sql docker/postgres/01-init.sql
```

- [ ] **Step 2: Append the events table + indexes to `docker/postgres/01-init.sql`**

Append to the end of the file:

```sql
-- product analytics / ops events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id text,
  guild_id text,
  props jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);
create index if not exists idx_events_name_time on events (name, occurred_at desc);
create index if not exists idx_events_user_time on events (user_id, occurred_at desc) where user_id is not null;
create index if not exists idx_events_guild_time on events (guild_id, occurred_at desc) where guild_id is not null;
```

The `metabase` schema and roles are created separately in Step 3 so grants can run against the fully-populated `public` schema.

- [ ] **Step 3: Create `docker/postgres/02-metabase-roles.sh`**

```bash
#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  do \$\$
  begin
    if not exists (select from pg_roles where rolname = 'metabase_app') then
      create role metabase_app login password '${METABASE_APP_PASSWORD:-metabase_app}';
    end if;
    if not exists (select from pg_roles where rolname = 'metabase_reader') then
      create role metabase_reader login password '${METABASE_READER_PASSWORD:-metabase_reader}';
    end if;
  end
  \$\$;

  create schema if not exists metabase authorization metabase_app;

  grant connect on database "$POSTGRES_DB" to metabase_reader;
  grant usage on schema public to metabase_reader;
  grant select on all tables in schema public to metabase_reader;
  alter default privileges in schema public grant select on tables to metabase_reader;
EOSQL
```

Make it executable:

```bash
chmod +x docker/postgres/02-metabase-roles.sh
```

- [ ] **Step 4: Update `docker/postgres/Dockerfile` to copy both init files**

Replace its contents with:

```dockerfile
FROM postgres:17-alpine

COPY 01-init.sql /docker-entrypoint-initdb.d/
COPY 02-metabase-roles.sh /docker-entrypoint-initdb.d/
```

- [ ] **Step 5: Verify schema locally**

Run:

```bash
mise exec -- docker compose -f docker-compose.prod.yml up -d postgres
mise exec -- docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d thoth -c "\dt events"
mise exec -- docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d thoth -c "\du metabase_app metabase_reader"
mise exec -- docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d thoth -c "\dn metabase"
```

Expected: `events` table listed, both roles listed, `metabase` schema listed.

Note: if postgres was already initialized (existing volume), `docker-entrypoint-initdb.d` scripts won't re-run. Either wipe the volume for dev (`docker compose down -v`) or run the SQL manually.

- [ ] **Step 6: Commit**

```bash
mise exec -- git add docker/postgres/
mise exec -- git commit -m "feat(db): events table + metabase roles and schema"
```

---

## Task 2: Test scaffolding — add `bun test` and vitest-shaped harness

**Files:**

- Modify: `apps/bot/package.json`
- Create: `apps/bot/__tests__/.gitkeep` (placeholder; real tests follow)

- [ ] **Step 1: Add test script to `apps/bot/package.json`**

In the `"scripts"` object, add:

```json
"test": "bun test __tests__"
```

Keep alphabetical order; insert after `"start"`.

- [ ] **Step 2: Verify bun is available**

Run: `mise exec -- bun --version`
Expected: prints a version like `1.3.12`

- [ ] **Step 3: Create `apps/bot/__tests__/.gitkeep`**

Empty file. Ensures the directory is tracked.

- [ ] **Step 4: Verify the script exists and runs (empty)**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__' || true`
Expected: bun exits with "0 tests across 0 files" or similar. Not an error.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/package.json apps/bot/__tests__/.gitkeep
mise exec -- git commit -m "test: add bun test runner to bot app"
```

---

## Task 3: Event registry — zod schemas + TS union

**Files:**

- Create: `apps/bot/src/metrics/events.ts`
- Create: `apps/bot/__tests__/metrics/events.test.ts`

- [ ] **Step 1: Write failing test `apps/bot/__tests__/metrics/events.test.ts`**

```ts
import { describe, expect, test } from 'bun:test';
import { EventSchemas, validateEvent } from '../../src/metrics/events.js';

describe('EventSchemas', () => {
	test('command.invoked accepts valid payload', () => {
		const result = validateEvent('command.invoked', { command: 'define', success: true, durationMs: 42 });
		expect(result.success).toBe(true);
	});

	test('command.invoked rejects missing field', () => {
		const result = validateEvent('command.invoked', { command: 'define', success: true });
		expect(result.success).toBe(false);
	});

	test('guild.left accepts empty object', () => {
		const result = validateEvent('guild.left', {});
		expect(result.success).toBe(true);
	});

	test('unknown event name returns failure', () => {
		// @ts-expect-error — intentional bad name
		const result = validateEvent('does.not.exist', {});
		expect(result.success).toBe(false);
	});

	test('entitlement.checked enforces site enum', () => {
		const ok = validateEvent('entitlement.checked', { kind: 'premium', granted: true, site: 'wotd_setup' });
		const bad = validateEvent('entitlement.checked', { kind: 'premium', granted: true, site: 'not_a_site' });
		expect(ok.success).toBe(true);
		expect(bad.success).toBe(false);
	});

	test('EventSchemas contains all 11 catalog entries', () => {
		expect(Object.keys(EventSchemas).sort()).toEqual([
			'button.clicked',
			'command.invoked',
			'entitlement.checked',
			'entitlement.granted',
			'entitlement.revoked',
			'feedback.submitted',
			'guild.joined',
			'guild.left',
			'modal.submitted',
			'wotd.delivered',
			'wotd.quiz_attempted',
		]);
	});
});
```

- [ ] **Step 2: Run test, verify failure**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/events.test.ts'`
Expected: FAIL with module-not-found for `../../src/metrics/events.js`.

- [ ] **Step 3: Implement `apps/bot/src/metrics/events.ts`**

```ts
import { z } from 'zod';

export const EventSchemas = {
	'command.invoked': z.object({
		command: z.string(),
		success: z.boolean(),
		durationMs: z.number(),
	}),
	'button.clicked': z.object({ customId: z.string() }),
	'modal.submitted': z.object({ customId: z.string() }),
	'guild.joined': z.object({ memberCount: z.number() }),
	'guild.left': z.object({}),
	'wotd.delivered': z.object({
		word: z.string(),
		tier: z.enum(['free', 'premium']),
	}),
	'wotd.quiz_attempted': z.object({
		word: z.string(),
		correct: z.boolean(),
	}),
	'entitlement.checked': z.object({
		kind: z.enum(['premium']),
		granted: z.boolean(),
		site: z.enum(['wotd_setup', 'wotd_delivery']),
	}),
	'entitlement.granted': z.object({ skuId: z.string() }),
	'entitlement.revoked': z.object({ skuId: z.string() }),
	'feedback.submitted': z.object({
		type: z.enum(['bug', 'feature', 'general']),
	}),
} as const satisfies Record<string, z.ZodType>;

export type EventName = keyof typeof EventSchemas;
export type EventProps<N extends EventName> = z.infer<(typeof EventSchemas)[N]>;

export interface EventEnvelope<N extends EventName = EventName> {
	name: N;
	userId: string | null;
	guildId: string | null;
	props: EventProps<N>;
	occurredAt: string; // ISO
}

export type ValidateResult = { success: true; data: unknown } | { success: false; error: string };

export function validateEvent(name: string, props: unknown): ValidateResult {
	const schema = (EventSchemas as Record<string, z.ZodType>)[name];
	if (!schema) return { success: false, error: `unknown event name: ${name}` };
	const parsed = schema.safeParse(props);
	if (parsed.success) return { success: true, data: parsed.data };
	return { success: false, error: parsed.error.message };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/events.test.ts'`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/src/metrics/events.ts apps/bot/__tests__/metrics/events.test.ts
mise exec -- git commit -m "feat(metrics): event registry with zod validation"
```

---

## Task 4: Ring buffer (queue-failure fallback)

**Files:**

- Create: `apps/bot/src/metrics/ring-buffer.ts`
- Create: `apps/bot/__tests__/metrics/ring-buffer.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, test } from 'bun:test';
import { RingBuffer } from '../../src/metrics/ring-buffer.js';

describe('RingBuffer', () => {
	test('push/drain round-trips items', () => {
		const b = new RingBuffer<number>(3);
		b.push(1);
		b.push(2);
		b.push(3);
		expect(b.drain()).toEqual([1, 2, 3]);
		expect(b.drain()).toEqual([]);
	});

	test('overflow drops oldest, keeps newest', () => {
		const b = new RingBuffer<number>(3);
		b.push(1);
		b.push(2);
		b.push(3);
		b.push(4);
		expect(b.drain()).toEqual([2, 3, 4]);
	});

	test('size reports current count', () => {
		const b = new RingBuffer<number>(5);
		expect(b.size()).toBe(0);
		b.push(1);
		b.push(2);
		expect(b.size()).toBe(2);
	});
});
```

- [ ] **Step 2: Run, verify failure**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/ring-buffer.test.ts'`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `apps/bot/src/metrics/ring-buffer.ts`**

```ts
export class RingBuffer<T> {
	private readonly buf: (T | undefined)[];
	private head = 0;
	private count = 0;

	constructor(private readonly capacity: number) {
		if (capacity <= 0) throw new Error('capacity must be positive');
		this.buf = new Array(capacity);
	}

	push(item: T): void {
		const tail = (this.head + this.count) % this.capacity;
		this.buf[tail] = item;
		if (this.count < this.capacity) {
			this.count++;
		} else {
			this.head = (this.head + 1) % this.capacity;
		}
	}

	drain(): T[] {
		const out: T[] = new Array(this.count);
		for (let i = 0; i < this.count; i++) {
			out[i] = this.buf[(this.head + i) % this.capacity] as T;
			this.buf[(this.head + i) % this.capacity] = undefined;
		}
		this.head = 0;
		this.count = 0;
		return out;
	}

	size(): number {
		return this.count;
	}
}
```

- [ ] **Step 4: Run, verify pass**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/ring-buffer.test.ts'`
Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/src/metrics/ring-buffer.ts apps/bot/__tests__/metrics/ring-buffer.test.ts
mise exec -- git commit -m "feat(metrics): ring buffer for enqueue fallback"
```

---

## Task 5: Queue factory + DI symbols

**Files:**

- Modify: `apps/bot/src/util/symbols.ts`
- Create: `apps/bot/src/metrics/queue.ts`

- [ ] **Step 1: Add new DI symbols to `apps/bot/src/util/symbols.ts`**

Read the current file first (it is short). Add these exports at the end (do not remove `kGuildCountGuage` yet — removal happens in Task 16):

```ts
export const kEventsQueue = Symbol('events-queue');
export const kMetricsRingBuffer = Symbol('metrics-ring-buffer');
```

- [ ] **Step 2: Implement `apps/bot/src/metrics/queue.ts`**

```ts
import { Queue } from 'bullmq';
import type { EventEnvelope } from './events.js';

export type EventsQueue = Queue<EventEnvelope, void, 'event'>;

export function createEventsQueue(connection: { host: string; port: number }): EventsQueue {
	return new Queue<EventEnvelope, void, 'event'>('events', {
		connection,
		defaultJobOptions: {
			removeOnComplete: { count: 100 },
			removeOnFail: { count: 1000 },
			attempts: 5,
			backoff: { type: 'exponential', delay: 1_000 },
		},
	});
}
```

- [ ] **Step 3: Verify it type-checks**

Run: `mise exec -- bash -c 'cd apps/bot && yarn watch --noEmit --incremental false' &`

Then: `sleep 3 && kill %1`

Expected: no type errors referencing `queue.ts` or `symbols.ts`.

Quicker alternative: `mise exec -- bash -c 'cd apps/bot && yarn build'` — should succeed.

- [ ] **Step 4: Commit**

```bash
mise exec -- git add apps/bot/src/metrics/queue.ts apps/bot/src/util/symbols.ts
mise exec -- git commit -m "feat(metrics): bullmq events queue + DI symbols"
```

---

## Task 6: Track wrapper (typed API, validates, enqueues, falls back)

**Files:**

- Create: `apps/bot/src/metrics/track.ts`
- Create: `apps/bot/__tests__/metrics/track.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { RingBuffer } from '../../src/metrics/ring-buffer.js';
import { createTrack } from '../../src/metrics/track.js';
import type { EventEnvelope } from '../../src/metrics/events.js';

function makeMockQueue() {
	const adds: { name: string; data: EventEnvelope }[] = [];
	let shouldFail = false;
	return {
		add: mock(async (name: string, data: EventEnvelope) => {
			if (shouldFail) throw new Error('redis down');
			adds.push({ name, data });
		}),
		get adds() {
			return adds;
		},
		set shouldFail(v: boolean) {
			shouldFail = v;
		},
	};
}

describe('track', () => {
	let mockQueue: ReturnType<typeof makeMockQueue>;
	let buffer: RingBuffer<EventEnvelope>;
	let warnings: string[];
	let track: ReturnType<typeof createTrack>;

	beforeEach(() => {
		mockQueue = makeMockQueue();
		buffer = new RingBuffer<EventEnvelope>(500);
		warnings = [];
		track = createTrack({
			queue: mockQueue as any,
			buffer,
			logger: { warn: (msg: unknown) => warnings.push(String(msg)) } as any,
			isDev: false,
		});
	});

	test('commandInvoked enqueues a validated envelope', async () => {
		track.commandInvoked('u1', 'g1', { command: 'define', success: true, durationMs: 12 });
		await new Promise((r) => setImmediate(r));
		expect(mockQueue.adds).toHaveLength(1);
		expect(mockQueue.adds[0]!.data.name).toBe('command.invoked');
		expect(mockQueue.adds[0]!.data.userId).toBe('u1');
		expect(mockQueue.adds[0]!.data.guildId).toBe('g1');
	});

	test('validation failure drops event in prod and logs warn', async () => {
		// @ts-expect-error — deliberately invalid payload
		track.commandInvoked('u1', 'g1', { command: 'define' });
		await new Promise((r) => setImmediate(r));
		expect(mockQueue.adds).toHaveLength(0);
		expect(warnings.some((w) => w.includes('command.invoked'))).toBe(true);
	});

	test('validation failure throws in dev', () => {
		track = createTrack({
			queue: mockQueue as any,
			buffer,
			logger: { warn: () => {} } as any,
			isDev: true,
		});
		expect(() =>
			// @ts-expect-error — deliberately invalid payload
			track.commandInvoked('u1', 'g1', { command: 'define' }),
		).toThrow();
	});

	test('enqueue failure pushes to ring buffer', async () => {
		mockQueue.shouldFail = true;
		track.guildLeft(null, 'g1', {});
		await new Promise((r) => setImmediate(r));
		expect(buffer.size()).toBe(1);
	});

	test('ring buffer drains on next successful enqueue', async () => {
		mockQueue.shouldFail = true;
		track.guildLeft(null, 'g1', {});
		await new Promise((r) => setImmediate(r));
		expect(buffer.size()).toBe(1);

		mockQueue.shouldFail = false;
		track.commandInvoked('u2', 'g2', { command: 'x', success: true, durationMs: 1 });
		await new Promise((r) => setImmediate(r));
		expect(buffer.size()).toBe(0);
		expect(mockQueue.adds.length).toBeGreaterThanOrEqual(2);
	});
});
```

- [ ] **Step 2: Run, verify failure**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/track.test.ts'`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `apps/bot/src/metrics/track.ts`**

```ts
import type { Logger } from 'pino';
import type { EventEnvelope, EventName, EventProps } from './events.js';
import { validateEvent } from './events.js';
import type { EventsQueue } from './queue.js';
import type { RingBuffer } from './ring-buffer.js';

export interface TrackDeps {
	queue: EventsQueue;
	buffer: RingBuffer<EventEnvelope>;
	logger: Pick<Logger, 'warn'>;
	isDev: boolean;
}

type TrackFn<N extends EventName> = (userId: string | null, guildId: string | null, props: EventProps<N>) => void;

export type Track = {
	commandInvoked: TrackFn<'command.invoked'>;
	buttonClicked: TrackFn<'button.clicked'>;
	modalSubmitted: TrackFn<'modal.submitted'>;
	guildJoined: TrackFn<'guild.joined'>;
	guildLeft: TrackFn<'guild.left'>;
	wotdDelivered: TrackFn<'wotd.delivered'>;
	wotdQuizAttempted: TrackFn<'wotd.quiz_attempted'>;
	entitlementChecked: TrackFn<'entitlement.checked'>;
	entitlementGranted: TrackFn<'entitlement.granted'>;
	entitlementRevoked: TrackFn<'entitlement.revoked'>;
	feedbackSubmitted: TrackFn<'feedback.submitted'>;
};

const METHOD_TO_EVENT: Record<keyof Track, EventName> = {
	commandInvoked: 'command.invoked',
	buttonClicked: 'button.clicked',
	modalSubmitted: 'modal.submitted',
	guildJoined: 'guild.joined',
	guildLeft: 'guild.left',
	wotdDelivered: 'wotd.delivered',
	wotdQuizAttempted: 'wotd.quiz_attempted',
	entitlementChecked: 'entitlement.checked',
	entitlementGranted: 'entitlement.granted',
	entitlementRevoked: 'entitlement.revoked',
	feedbackSubmitted: 'feedback.submitted',
};

export function createTrack(deps: TrackDeps): Track {
	const emit = <N extends EventName>(
		name: N,
		userId: string | null,
		guildId: string | null,
		props: EventProps<N>,
	) => {
		const result = validateEvent(name, props);
		if (!result.success) {
			if (deps.isDev) {
				throw new Error(`[metrics] invalid props for ${name}: ${result.error}`);
			}
			deps.logger.warn({ name, error: result.error }, `[metrics] invalid props for ${name}`);
			return;
		}

		const envelope: EventEnvelope<N> = {
			name,
			userId,
			guildId,
			props,
			occurredAt: new Date().toISOString(),
		};

		void enqueue(deps, envelope);
	};

	const track = {} as Track;
	for (const [method, eventName] of Object.entries(METHOD_TO_EVENT) as [keyof Track, EventName][]) {
		(track as any)[method] = (userId: string | null, guildId: string | null, props: unknown) =>
			emit(eventName, userId, guildId, props as any);
	}
	return track;
}

async function enqueue(deps: TrackDeps, envelope: EventEnvelope): Promise<void> {
	try {
		await deps.queue.add('event', envelope);
		// drain any previously-buffered events now that the queue is up
		const buffered = deps.buffer.drain();
		for (const buf of buffered) {
			try {
				await deps.queue.add('event', buf);
			} catch {
				// requeue on failure; we tried our best
				deps.buffer.push(buf);
			}
		}
	} catch (error) {
		deps.buffer.push(envelope);
		deps.logger.warn({ err: error, bufferSize: deps.buffer.size() }, '[metrics] enqueue failed, buffered');
	}
}
```

- [ ] **Step 4: Run, verify pass**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/track.test.ts'`
Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/src/metrics/track.ts apps/bot/__tests__/metrics/track.test.ts
mise exec -- git commit -m "feat(metrics): typed track() API with fallback buffer"
```

---

## Task 7: Worker (batching consumer)

**Files:**

- Create: `apps/bot/src/metrics/worker.ts`
- Create: `apps/bot/__tests__/metrics/worker.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, expect, test } from 'bun:test';
import { Batcher } from '../../src/metrics/worker.js';
import type { EventEnvelope } from '../../src/metrics/events.js';

function env(name: any, props: any = {}): EventEnvelope {
	return { name, userId: 'u', guildId: 'g', props, occurredAt: new Date().toISOString() };
}

describe('Batcher', () => {
	test('flushes when batch size reached', async () => {
		const flushed: EventEnvelope[][] = [];
		const b = new Batcher({
			maxBatch: 3,
			maxWaitMs: 10_000,
			flush: async (batch) => {
				flushed.push(batch);
			},
		});
		b.add(env('guild.left'));
		b.add(env('guild.left'));
		b.add(env('guild.left'));
		await new Promise((r) => setImmediate(r));
		expect(flushed).toHaveLength(1);
		expect(flushed[0]).toHaveLength(3);
		await b.stop();
	});

	test('flushes when wait window elapses', async () => {
		const flushed: EventEnvelope[][] = [];
		const b = new Batcher({
			maxBatch: 100,
			maxWaitMs: 50,
			flush: async (batch) => {
				flushed.push(batch);
			},
		});
		b.add(env('guild.left'));
		await new Promise((r) => setTimeout(r, 100));
		expect(flushed).toHaveLength(1);
		expect(flushed[0]).toHaveLength(1);
		await b.stop();
	});

	test('stop() flushes pending', async () => {
		const flushed: EventEnvelope[][] = [];
		const b = new Batcher({
			maxBatch: 100,
			maxWaitMs: 10_000,
			flush: async (batch) => {
				flushed.push(batch);
			},
		});
		b.add(env('guild.left'));
		b.add(env('guild.left'));
		await b.stop();
		expect(flushed).toHaveLength(1);
		expect(flushed[0]).toHaveLength(2);
	});
});
```

- [ ] **Step 2: Run, verify failure**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/worker.test.ts'`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `apps/bot/src/metrics/worker.ts`**

```ts
import type { Job } from 'bullmq';
import { Worker } from 'bullmq';
import type { Sql } from 'postgres';
import type { Logger } from 'pino';
import type { EventEnvelope } from './events.js';

export interface BatcherOptions {
	maxBatch: number;
	maxWaitMs: number;
	flush: (batch: EventEnvelope[]) => Promise<void>;
}

export class Batcher {
	private buf: EventEnvelope[] = [];
	private timer: NodeJS.Timeout | null = null;
	private flushing: Promise<void> = Promise.resolve();

	constructor(private readonly opts: BatcherOptions) {}

	add(e: EventEnvelope): void {
		this.buf.push(e);
		if (this.buf.length >= this.opts.maxBatch) {
			this.flushing = this.flushing.then(() => this.flushNow());
		} else if (!this.timer) {
			this.timer = setTimeout(() => {
				this.flushing = this.flushing.then(() => this.flushNow());
			}, this.opts.maxWaitMs);
		}
	}

	async stop(): Promise<void> {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.flushing = this.flushing.then(() => this.flushNow());
		await this.flushing;
	}

	private async flushNow(): Promise<void> {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (this.buf.length === 0) return;
		const batch = this.buf;
		this.buf = [];
		await this.opts.flush(batch);
	}
}

export interface EventsWorkerDeps {
	connection: { host: string; port: number };
	sql: Sql<any>;
	logger: Logger;
}

export function startEventsWorker(deps: EventsWorkerDeps): Worker<EventEnvelope, void, 'event'> {
	const batcher = new Batcher({
		maxBatch: 100,
		maxWaitMs: 1_000,
		flush: async (batch) => {
			try {
				await deps.sql`
          insert into events ${deps.sql(
				batch.map((e) => ({
					name: e.name,
					user_id: e.userId,
					guild_id: e.guildId,
					props: e.props,
					occurred_at: e.occurredAt,
				})),
			)}
        `;
			} catch (err) {
				deps.logger.error({ err, batchSize: batch.length }, '[metrics] batch insert failed');
				throw err;
			}
		},
	});

	const worker = new Worker<EventEnvelope, void, 'event'>(
		'events',
		async (job: Job<EventEnvelope>) => {
			batcher.add(job.data);
		},
		{ connection: deps.connection, concurrency: 10 },
	);

	worker.on('closing', () => {
		void batcher.stop();
	});

	return worker;
}
```

- [ ] **Step 4: Run, verify pass**

Run: `mise exec -- bash -c 'cd apps/bot && bun test __tests__/metrics/worker.test.ts'`
Expected: all 3 tests pass.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/src/metrics/worker.ts apps/bot/__tests__/metrics/worker.test.ts
mise exec -- git commit -m "feat(metrics): batching worker for events queue"
```

---

## Task 8: Retention job

**Files:**

- Create: `apps/bot/src/metrics/retention.ts`

- [ ] **Step 1: Implement `apps/bot/src/metrics/retention.ts`**

```ts
import type { Queue } from 'bullmq';
import type { Logger } from 'pino';
import type { Sql } from 'postgres';

export async function registerRetentionJob(queue: Queue<any, any, string>): Promise<void> {
	await queue.add('events-retention', {}, { repeat: { pattern: '0 3 * * *' }, removeOnComplete: { count: 30 } });
}

export async function runRetention(sql: Sql<any>, logger: Logger): Promise<number> {
	const res = await sql`
    delete from events where occurred_at < now() - interval '180 days'
  `;
	const deleted = res.count ?? 0;
	logger.info({ deleted }, '[metrics] retention sweep complete');
	return deleted;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
mise exec -- git add apps/bot/src/metrics/retention.ts
mise exec -- git commit -m "feat(metrics): retention job + repeatable scheduler"
```

---

## Task 9: Public exports + `setupMetrics`

**Files:**

- Create: `apps/bot/src/metrics/index.ts`

- [ ] **Step 1: Implement `apps/bot/src/metrics/index.ts`**

```ts
import process from 'node:process';
import type { Logger } from 'pino';
import type { Sql } from 'postgres';
import { container } from 'tsyringe';
import { logger as defaultLogger } from '#logger';
import { kEventsQueue, kMetricsRingBuffer } from '#util/symbols';
import type { EventEnvelope } from './events.js';
import { createEventsQueue, type EventsQueue } from './queue.js';
import { RingBuffer } from './ring-buffer.js';
import { createTrack, type Track } from './track.js';
import { startEventsWorker } from './worker.js';

export type { Track } from './track.js';
export { EventSchemas, type EventName, type EventProps } from './events.js';

let singletonTrack: Track | null = null;

export function track(): Track {
	if (!singletonTrack) throw new Error('metrics not initialized — call setupMetrics() first');
	return singletonTrack;
}

export interface SetupMetricsDeps {
	sql: Sql<any>;
	connection: { host: string; port: number };
	logger?: Logger;
}

export function setupMetrics(deps: SetupMetricsDeps): { queue: EventsQueue } {
	const logger = deps.logger ?? defaultLogger;
	const buffer = new RingBuffer<EventEnvelope>(500);
	const queue = createEventsQueue(deps.connection);

	container.register(kEventsQueue, { useValue: queue });
	container.register(kMetricsRingBuffer, { useValue: buffer });

	singletonTrack = createTrack({
		queue,
		buffer,
		logger,
		isDev: (process.env.NODE_ENV ?? 'development') !== 'production',
	});

	startEventsWorker({ connection: deps.connection, sql: deps.sql, logger });

	return { queue };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
mise exec -- git add apps/bot/src/metrics/index.ts
mise exec -- git commit -m "feat(metrics): setupMetrics bootstrap + track() accessor"
```

---

## Task 10: Wire `setupMetrics` into bot entry; register retention job

**Files:**

- Modify: `apps/bot/src/index.ts`
- Modify: `apps/bot/src/jobs.ts`

- [ ] **Step 1: Import and call `setupMetrics` in `apps/bot/src/index.ts`**

In `apps/bot/src/index.ts`, add this import near the top (alongside other `#` imports):

```ts
import { setupMetrics } from './metrics/index.js';
```

After the `container.register(kSQL, { useValue: sql });` line, add:

```ts
setupMetrics({
	sql,
	connection: {
		host: process.env.REDIS_HOST,
		port: Number.parseInt(process.env.REDIS_PORT, 10),
	},
});
```

Important: do NOT remove prom-client setup yet. That happens in Task 16.

- [ ] **Step 2: Register retention job in `apps/bot/src/jobs.ts`**

In `setupJobs`, after the two existing `queue.add(...)` calls, add:

```ts
await queue.add('events-retention', {}, { repeat: { pattern: '0 3 * * *' } });
```

And update the queue's type union to include it — change the type from:

```ts
const queue = new Queue<{}, {}, 'wotd-deliver' | 'wotd-ingest'>('jobs', { connection });
```

to:

```ts
const queue = new Queue<{}, {}, 'wotd-deliver' | 'wotd-ingest' | 'events-retention'>('jobs', { connection });
```

Add this import at the top of `apps/bot/src/jobs.ts` alongside the other local imports:

```ts
import { runRetention } from './metrics/retention.js';
```

Add a new `case` inside the Worker switch statement (keep the existing cases intact):

```ts
case 'events-retention': {
  await runRetention(sql, logger);
  break;
}
```

- [ ] **Step 3: Build and verify**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: no type errors.

- [ ] **Step 4: Smoke-test startup locally**

Run: `mise exec -- docker compose -f docker-compose.dev.yml up -d postgres redis`
Run: `mise exec -- bash -c 'cd apps/bot && yarn dev'` (background — let it run ~5s then Ctrl-C)
Expected: startup logs include no errors related to metrics; redis shows an `events` queue registered (you can skip this verification if you don't have a local bot token).

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/src/index.ts apps/bot/src/jobs.ts
mise exec -- git commit -m "feat(metrics): wire setupMetrics + events-retention cron"
```

---

## Task 11: Migrate `interactionCreate` call sites

**Files:**

- Modify: `apps/bot/src/events/interactionCreate.ts`

- [ ] **Step 1: Import `track`**

Add alongside existing `#` imports:

```ts
import { track } from '../metrics/index.js';
```

- [ ] **Step 2: Replace `commandsMetrics.inc` with `track().commandInvoked`**

Find the two `commandsMetrics.inc(...)` calls (one in the success path, one in the catch block). Replace:

```ts
commandsMetrics.inc({
	success: 'true',
	command: interaction.commandName,
});
```

with:

```ts
track().commandInvoked(interaction.user.id, interaction.guildId, {
	command: interaction.commandName,
	success: true,
	durationMs: 0, // measured below if we capture start
});
```

For real duration measurement: capture `const startedAt = performance.now();` right before `command.chatInput(...)` and pass `durationMs: Math.round(performance.now() - startedAt)` in both paths. Import `performance` from `node:perf_hooks`:

```ts
import { performance } from 'node:perf_hooks';
```

Replace the catch-block call analogously (pass `success: false`).

- [ ] **Step 3: Add `track().buttonClicked` in `handleButton`**

At the very top of `handleButton` (before any regex checks), add:

```ts
track().buttonClicked(interaction.user.id, interaction.guildId, {
	customId: interaction.customId,
});
```

- [ ] **Step 4: Add `track().modalSubmitted` in `handleModalSubmit`**

Near the top of `handleModalSubmit` (after the `deferReply`):

```ts
track().modalSubmitted(interaction.user.id, interaction.guildId, {
	customId: interaction.customId,
});
```

- [ ] **Step 5: Add `track().wotdQuizAttempted` next to `INSERT INTO wotd_quiz_attempt`**

In the `wotdAnswerRes` handler, immediately after the `await this.sql` INSERT statement, add:

```ts
const [hist] = await this.sql<[{ word: string }]>`
  SELECT wh.word FROM wotd_quiz_option qo
  JOIN wotd_history wh ON wh.id = qo.wotd_history_id
  WHERE qo.id = ${optionId}
`;
track().wotdQuizAttempted(interaction.user.id, interaction.guildId, {
	word: hist?.word ?? 'unknown',
	correct: chosenOption.correct,
});
```

- [ ] **Step 6: Add `track().feedbackSubmitted` in the feedback flow**

In `handleModalSubmit`, inside the `feedbackSubmitRes` block, immediately after the `insert into feedback_submission ... returning id` SQL, add:

```ts
track().feedbackSubmitted(interaction.user.id, interaction.guildId, {
	type: type as 'bug' | 'feature' | 'general',
});
```

- [ ] **Step 7: Build and verify no type errors**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: success.

- [ ] **Step 8: Commit**

```bash
mise exec -- git add apps/bot/src/events/interactionCreate.ts
mise exec -- git commit -m "feat(metrics): emit events for commands, buttons, modals, quiz, feedback"
```

---

## Task 12: Migrate guild lifecycle + ready.ts

**Files:**

- Modify: `apps/bot/src/events/guildCreate.ts`
- Modify: `apps/bot/src/events/guildDelete.ts`
- Modify: `apps/bot/src/events/ready.ts`

- [ ] **Step 1: `guildCreate.ts` — emit `track().guildJoined`**

Replace the existing `guildCount.inc()` call with:

```ts
track().guildJoined(null, guild.id, { memberCount: guild.memberCount });
```

Leave the `guildCount` param in the constructor and `Gauge` import untouched; they will be removed in Task 16.

Add import:

```ts
import { track } from '../metrics/index.js';
```

- [ ] **Step 2: `guildDelete.ts` — emit `track().guildLeft`**

Replace `guildCount.dec()` with:

```ts
track().guildLeft(null, guild.id, {});
```

Add import:

```ts
import { track } from '../metrics/index.js';
```

- [ ] **Step 3: `ready.ts` — delete the gauge initialization**

Remove the line `this.guildCount.set(guilds);`. Leave `const guilds = this.client.guilds.cache.size;` (or delete it if now unused — likely unused after this change). Leave the gauge DI parameter; Task 16 removes it.

- [ ] **Step 4: Build and verify**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: success.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/src/events/guildCreate.ts apps/bot/src/events/guildDelete.ts apps/bot/src/events/ready.ts
mise exec -- git commit -m "feat(metrics): emit guild.joined / guild.left, drop gauge init"
```

---

## Task 13: Migrate entitlement lifecycle events

**Files:**

- Modify: `apps/bot/src/events/entitlementCreate.ts`
- Modify: `apps/bot/src/events/entitlementUpdate.ts`
- Modify: `apps/bot/src/events/entitlementDelete.ts`

The discord.js `Entitlement` type exposes `skuId: Snowflake`, `userId: Snowflake`, `guildId: Snowflake | null` — these are directly available on the `entitlement` arg each handler already receives in its `this.client.on(this.event, async (entitlement) => { ... })` callback.

- [ ] **Step 1: In `entitlementCreate.ts`, emit `track().entitlementGranted`**

Inside the `this.client.on` handler body, after the existing cache logic, add:

```ts
track().entitlementGranted(entitlement.userId, entitlement.guildId, {
	skuId: entitlement.skuId,
});
```

Add import:

```ts
import { track } from '../metrics/index.js';
```

- [ ] **Step 2: In `entitlementUpdate.ts`, emit `track().entitlementGranted`**

Same treatment — a discord `ENTITLEMENT_UPDATE` signals activation/renewal. Use identical payload to Step 1. Add the import.

- [ ] **Step 3: In `entitlementDelete.ts`, emit `track().entitlementRevoked`**

```ts
track().entitlementRevoked(entitlement.userId, entitlement.guildId, {
	skuId: entitlement.skuId,
});
```

Add import:

```ts
import { track } from '../metrics/index.js';
```

- [ ] **Step 5: Build and verify**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: success.

- [ ] **Step 6: Commit**

```bash
mise exec -- git add apps/bot/src/events/entitlementCreate.ts apps/bot/src/events/entitlementUpdate.ts apps/bot/src/events/entitlementDelete.ts
mise exec -- git commit -m "feat(metrics): emit entitlement.granted / revoked from webhook handlers"
```

---

## Task 14: Migrate `jobs.ts` — wotd.delivered + entitlement.checked (wotd_delivery)

**Files:**

- Modify: `apps/bot/src/jobs.ts`

- [ ] **Step 1: Import `track`**

```ts
import { track } from './metrics/index.js';
```

- [ ] **Step 2: Emit `track().wotdDelivered` after each successful delivery**

Modify `deliverToGuild`'s success return branch. In the existing `try { await client.send(...); await sql`INSERT INTO wotd_delivery_log...`; return { ... }; }`, before the `return`, add:

```ts
track().wotdDelivered(null, server.guild_id.toString(), {
	word: pendingWord ?? 'unknown',
	tier: server.post_time ? 'premium' : 'free',
});
```

This requires `pendingWord` as a new parameter on `deliverToGuild`. Update the signature:

```ts
async function deliverToGuild(
  sql: Sql<any>,
  server: WOTDConfig,
  content: string,
  components: ActionRowBuilder<ButtonBuilder>[],
  pendingId: string,
  pendingWord: string,
): Promise<Status> {
```

Update all three call sites (search for `deliverToGuild(`). The word is available as `result.word` in `triggerWOTD` and the `'wotd-ingest'` case. For the `'wotd-deliver'` case, fetch the word alongside `pending_content` by updating the SELECT:

```ts
const due = await sql<
  (WOTDConfig & { components: string; pending_content: string; pending_id: string; pending_word: string })[]
>`
  SELECT w.*, p.id as pending_id, p.content as pending_content, p.components,
         wh.word as pending_word
  FROM wotd w
  CROSS JOIN wotd_pending p
  JOIN wotd_history wh ON wh.id = p.wotd_history_id
  WHERE w.post_time IS NOT NULL
    ...
```

Pass `row.pending_word` to `deliverToGuild` in the `wotd-deliver` loop.

- [ ] **Step 3: Emit `track().entitlementChecked` after `isGuildPremium`**

In the `wotd-deliver` case, immediately after the `isPremium` assignment, add:

```ts
track().entitlementChecked(null, row.guild_id.toString(), {
	kind: 'premium',
	granted: isPremium,
	site: 'wotd_delivery',
});
```

- [ ] **Step 4: Build and verify**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: success.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add apps/bot/src/jobs.ts
mise exec -- git commit -m "feat(metrics): emit wotd.delivered + entitlement.checked from jobs"
```

---

## Task 15: Migrate `commands/setup/sub/wotd.ts` — entitlement.checked (wotd_setup)

**Files:**

- Modify: `apps/bot/src/commands/setup/sub/wotd.ts`

- [ ] **Step 1: Import `track`**

```ts
import { track } from '../../../metrics/index.js';
```

- [ ] **Step 2: Emit `track().entitlementChecked` at the premium-gate site**

Find the existing premium gate around line 64 (`if (timeArg || timezoneArg) { const hasEntitlement = ...`). Immediately after the `hasEntitlement` assignment, add:

```ts
track().entitlementChecked(interaction.user.id, interaction.guildId, {
	kind: 'premium',
	granted: hasEntitlement,
	site: 'wotd_setup',
});
```

- [ ] **Step 3: Build and verify**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: success.

- [ ] **Step 4: Commit**

```bash
mise exec -- git add apps/bot/src/commands/setup/sub/wotd.ts
mise exec -- git commit -m "feat(metrics): emit entitlement.checked at wotd setup gate"
```

---

## Task 16: Prometheus teardown — code + deps + symbols

**Files:**

- Modify: `apps/bot/package.json`
- Modify: `apps/bot/src/index.ts`
- Modify: `apps/bot/src/util/symbols.ts`
- Modify: `apps/bot/src/events/interactionCreate.ts`
- Modify: `apps/bot/src/events/guildCreate.ts`
- Modify: `apps/bot/src/events/guildDelete.ts`
- Modify: `apps/bot/src/events/ready.ts`
- Delete: `docker/prometheus/`, `docker/grafana/`, `docker/promtail/`

- [ ] **Step 1: Remove `prom-client` from `apps/bot/package.json`**

Delete the `"prom-client": "^15.1.3"` line from `dependencies`.

- [ ] **Step 2: Strip prom setup from `apps/bot/src/index.ts`**

Remove:

- `import { Gauge, Registry, collectDefaultMetrics } from 'prom-client';`
- `const register = new Registry();` + `collectDefaultMetrics({ register, prefix: 'thoth_' });`
- `const guildCount = new Gauge({ ... });`
- `container.register(kGuildCountGuage, { useValue: guildCount });`
- `container.register(Registry, { useValue: register });`
- `new Gauge({ name: 'thoth_wotd_subscribers', ... });`
- The `kGuildCountGuage` import
- `server.get('/metrics', async (_req, res) => { ... });` — delete entire handler block
- Keep `server.get('/health', ...)` intact.

- [ ] **Step 3: Remove `kGuildCountGuage` from `apps/bot/src/util/symbols.ts`**

Delete the line exporting `kGuildCountGuage`.

- [ ] **Step 4: Clean up `interactionCreate.ts`**

Remove:

- `import { Counter, Registry } from 'prom-client';`
- `const registry = container.resolve<Registry<...>>(Registry);`
- `const commandsMetrics = new Counter({ ... });`

- [ ] **Step 5: Clean up `guildCreate.ts` / `guildDelete.ts` / `ready.ts`**

In each:

- Remove `import { Gauge } from 'prom-client';`
- Remove `import { kGuildCountGuage } from '#util/symbols.js';` (note: use existing import path style)
- Remove `@inject(kGuildCountGuage) private readonly guildCount: Gauge<string>,` from constructor

- [ ] **Step 6: Delete unused directories**

```bash
rm -rf docker/prometheus docker/grafana docker/promtail
```

- [ ] **Step 7: Reinstall to drop prom-client from lockfile**

Run: `mise exec -- bash -c 'cd apps/bot && yarn install'`
Expected: lockfile updates, no errors.

- [ ] **Step 8: Build and verify**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build'`
Expected: no type errors, no dangling references to Registry/Gauge/Counter/kGuildCountGuage.

- [ ] **Step 9: Commit**

```bash
mise exec -- git add apps/bot/package.json apps/bot/src/ docker/ yarn.lock
mise exec -- git commit -m "refactor(metrics): remove prom-client and /metrics endpoint"
```

---

## Task 17: docker-compose cleanup — remove dead observability blocks

**Files:**

- Modify: `docker-compose.prod.yml`
- Modify: `docker-compose.dev.yml`

- [ ] **Step 1: In `docker-compose.prod.yml`, delete the commented-out service blocks**

Delete the entire commented blocks for `prometheus:`, `grafana:`, `loki:`, `promtail:`, `cadvisor:` (lines ~48–129 in the current file).

In the `volumes:` block at the bottom, remove:

- `prometheus-storage:`
- `grafana-storage:`
- `loki-storage:`

Keep `postgres-storage:`.

- [ ] **Step 2: Check `docker-compose.dev.yml` for the same**

Read the file. If it has any of those commented or active blocks, delete them too. Same rules.

- [ ] **Step 3: Validate compose**

Run: `mise exec -- docker compose -f docker-compose.prod.yml config > /dev/null`
Expected: no errors.

Run: `mise exec -- docker compose -f docker-compose.dev.yml config > /dev/null`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
mise exec -- git add docker-compose.prod.yml docker-compose.dev.yml
mise exec -- git commit -m "chore(infra): remove dead prometheus/grafana/loki compose blocks"
```

---

## Task 18: Add Metabase service to `docker-compose.prod.yml`

**Files:**

- Modify: `docker-compose.prod.yml`
- Modify: `.env.example`

- [ ] **Step 1: Add the Metabase service**

In `docker-compose.prod.yml`, add a new service after `redis:`:

```yaml
metabase:
    image: metabase/metabase:latest
    restart: unless-stopped
    environment:
        MB_DB_TYPE: postgres
        MB_DB_DBNAME: thoth
        MB_DB_PORT: 5432
        MB_DB_USER: metabase_app
        MB_DB_PASS: ${METABASE_APP_PASSWORD}
        MB_DB_HOST: postgres
        MB_SITE_URL: ${METABASE_SITE_URL:-http://localhost:3000}
    expose:
        - '3000'
    depends_on:
        postgres:
            condition: service_healthy
    healthcheck:
        test: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1']
        interval: 30s
        timeout: 10s
        retries: 5
        start_period: 60s
```

- [ ] **Step 2: Pass role passwords into the postgres service**

In the existing `postgres:` service, add to the `environment:` block:

```yaml
METABASE_APP_PASSWORD: ${METABASE_APP_PASSWORD}
METABASE_READER_PASSWORD: ${METABASE_READER_PASSWORD}
```

- [ ] **Step 3: Document env vars in `.env.example`**

Append:

```
# Metabase (analytics)
METABASE_APP_PASSWORD=change_me
METABASE_READER_PASSWORD=change_me
METABASE_SITE_URL=https://metabase.example.com
```

- [ ] **Step 4: Validate compose**

Run: `mise exec -- docker compose -f docker-compose.prod.yml config > /dev/null`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
mise exec -- git add docker-compose.prod.yml .env.example
mise exec -- git commit -m "feat(infra): add metabase service on shared postgres"
```

---

## Task 19: End-to-end smoke test + PR

**Files:** (no code; manual verification)

- [ ] **Step 1: Bring the stack up locally**

```bash
mise exec -- docker compose -f docker-compose.prod.yml up -d --build postgres redis
mise exec -- docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d thoth -c "SELECT COUNT(*) FROM events;"
```

Expected: `0` rows.

- [ ] **Step 2: Fire a test event via psql directly**

```bash
mise exec -- docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d thoth -c "INSERT INTO events (name, user_id, guild_id, props) VALUES ('command.invoked', '1', '1', '{\"command\":\"ping\",\"success\":true,\"durationMs\":5}');"
mise exec -- docker compose -f docker-compose.prod.yml exec postgres psql -U admin -d thoth -c "SELECT name, props FROM events;"
```

Expected: one row returned.

- [ ] **Step 3: Verify the bot starts cleanly**

Run: `mise exec -- bash -c 'cd apps/bot && yarn build && yarn start &'`
Watch logs for ~10s. Ctrl-C.

Expected:

- No errors about missing `prom-client`.
- No errors about missing DI symbols.
- Log line from `setupMetrics` or worker startup.
- No `/metrics` endpoint — hitting it should 404.

Verify: `curl -s -o /dev/null -w '%{http_code}' http://localhost:21983/metrics`
Expected: `404`.

- [ ] **Step 4: Verify Metabase comes up**

Run: `mise exec -- docker compose -f docker-compose.prod.yml up -d metabase`

Wait ~90s.

Run: `mise exec -- docker compose -f docker-compose.prod.yml exec metabase curl -s http://localhost:3000/api/health`
Expected: `{"status":"ok"}`.

- [ ] **Step 5: Open PR**

```bash
mise exec -- git push -u origin feat/metrics-pipeline
mise exec -- gh pr create --title "feat: postgres-backed events pipeline (removes prometheus)" --body "$(cat <<'EOF'
## Summary
- Replaces the prom-client `/metrics` endpoint with a Postgres `events` table populated via a BullMQ-backed typed `track.*()` API.
- Adds Metabase as the view layer, sharing the existing Postgres instance under its own `metabase` schema.
- Removes the commented-out prometheus/grafana/loki/promtail/cadvisor compose blocks and their source directories.

## Test plan
- [ ] Fresh `docker compose up` creates `events` table and both metabase roles.
- [ ] Bot starts without errors; no `/metrics` endpoint.
- [ ] `/ping` (or any command) produces a row in `events`.
- [ ] Button click produces a `button.clicked` row.
- [ ] Leaving a guild produces `guild.left`.
- [ ] Metabase comes up healthy, can log in, can connect to the thoth db as `metabase_reader`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 6: Manual Metabase setup (off-plan)**

After merge + deploy, log into Metabase, create the admin account, add the `thoth` db as a data source using `metabase_reader` credentials, and build initial dashboards. This is outside the spec.

---

## Self-Review Summary

**Spec coverage:**

- Events table + indexes → Task 1 ✓
- Event registry (zod) → Task 3 ✓
- Typed track wrapper → Task 6 ✓
- BullMQ events queue → Task 5 ✓
- Batching worker → Task 7 ✓
- Retention (180d, daily) → Tasks 8, 10 ✓
- Metabase on postgres w/ own schema → Tasks 1, 18 ✓
- `metabase_reader` readonly role → Task 1 ✓
- Prom teardown → Tasks 16, 17 ✓
- All 11 events wired → Tasks 11–15 ✓
- Retention deletion logging (from chat) → Task 8 (`runRetention` logs `deleted` count) ✓

**Placeholder scan:** none found.

**Type consistency:**

- `EventEnvelope<N>` used consistently between `events.ts`, `track.ts`, `worker.ts`, `queue.ts`.
- `Track` method names (`commandInvoked`, `buttonClicked`, …) match between the `Track` type and the `METHOD_TO_EVENT` map.
- Bump-worthy: `deliverToGuild` signature gains a `pendingWord` param — all three call sites are updated in Task 14.
