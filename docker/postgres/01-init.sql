create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists "uuid-ossp";

create table if not exists wotd (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	guild_id BIGINT NOT NULL UNIQUE,
	created_by BIGINT NOT NULL,
	webhook_id BIGINT NOT NULL UNIQUE,
	webhook_token TEXT NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN wotd.guild_id IS 'The ID of the guild this config belongs to';
COMMENT ON COLUMN wotd.created_by IS 'The ID of the user who created this config';
COMMENT ON COLUMN wotd.webhook_id IS 'The ID of the webhook used to post the word of the day';
COMMENT ON COLUMN wotd.webhook_token IS 'The token of the webhook used to post the word of the day';
COMMENT ON COLUMN wotd.created_at IS 'The date and time this config was created';

create table if not exists wotd_history (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	word TEXT UNIQUE NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

create table if not exists thoth_bans (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id BIGINT NOT NULL,
	reason TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

create table if not exists blocked_words (
	word text primary key,
	created_at timestamptz not null default now()
);

alter table thoth_bans
alter column user_id type text using user_id::text,
add constraint unique_user_id unique (user_id);

create table if not exists show_by_default_alert (
	user_id text primary key not null,
	created_at timestamptz not null default now()
);

create table if not exists dismissable_alert (
	id uuid primary key default gen_random_uuid(),
	user_id text not null,
	campaign text not null,
	created_at timestamptz not null default now()
);
create index campaign on dismissable_alert (user_id, campaign);

insert into dismissable_alert (user_id, campaign, created_at) select user_id, 'show_by_default_alert', created_at from show_by_default_alert;

create table if not exists feedback_submission (
	id uuid primary key default gen_random_uuid(),
	type text not null default 'general',
	user_id text not null,
	subject text,
	description text not null,
	channel_id text,
	thread_id text,
	created_at timestamptz not null default now()
);

create table if not exists wotd_quiz_option (
	id uuid primary key default gen_random_uuid(),
	wotd_history_id uuid not null references wotd_history(id) on delete cascade,
	sentence text not null,
	correct boolean not null default false,
	explanation text not null,
	created_at timestamptz not null default now()
);
create index idx_wotd_quiz_option_history on wotd_quiz_option (wotd_history_id);

create table if not exists wotd_quiz_attempt (
	id uuid primary key default gen_random_uuid(),
	option_id uuid not null references wotd_quiz_option(id) on delete cascade,
	user_id text not null,
	guild_id text not null,
	created_at timestamptz not null default now()
);
create index idx_wotd_quiz_attempt_user on wotd_quiz_attempt (user_id);

-- premium scheduling columns (NULL = free tier / immediate delivery)
alter table wotd add column if not exists post_time time;
alter table wotd add column if not exists timezone text;

COMMENT ON COLUMN wotd.post_time IS 'Premium: time of day to deliver WOTD, NULL = immediate';
COMMENT ON COLUMN wotd.timezone IS 'Premium: IANA timezone for post_time, NULL = immediate';

-- stores rendered wotd content for scheduled delivery
create table if not exists wotd_pending (
	id uuid primary key default gen_random_uuid(),
	wotd_history_id uuid not null references wotd_history(id) on delete cascade,
	content text not null,
	components jsonb not null default '[]',
	created_at timestamptz not null default now()
);
create index idx_wotd_pending_created on wotd_pending (created_at desc);

-- tracks which guilds received which pending word (prevents double-delivery)
create table if not exists wotd_delivery_log (
	id uuid primary key default gen_random_uuid(),
	wotd_pending_id uuid not null references wotd_pending(id) on delete cascade,
	wotd_config_id uuid not null references wotd(id) on delete cascade,
	delivered_at timestamptz not null default now(),
	unique (wotd_pending_id, wotd_config_id)
);
create index idx_wotd_delivery_log_pending on wotd_delivery_log (wotd_pending_id);

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
