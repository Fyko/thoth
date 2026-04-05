export interface WOTDConfig {
	created_at: Date;
	guild_id: bigint;
	id: string;
	post_time: string | null;
	timezone: string | null;
	webhook_id: bigint;
	webhook_token: string;
}
