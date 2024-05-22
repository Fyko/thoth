create extension if not exists pgcrypto;

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
