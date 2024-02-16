CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS wotd (
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

CREATE TABLE IF NOT EXISTS wotd_history (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	word TEXT UNIQUE NOT NULL,
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thoth_bans (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id BIGINT NOT NULL,
	reason TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

create table if not exists blocked_words (
	word text primary key,
	created_at timestamptz not null default now()
);
