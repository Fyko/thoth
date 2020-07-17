import { Listener } from 'discord-akairo';
import { Guild } from 'discord.js';

export default class GuildDeleteListener extends Listener {
	public constructor() {
		super('guildDelete', {
			category: 'client',
			emitter: 'client',
			event: 'guildDelete',
		});
	}

	public exec(guild: Guild): void {
		this.client.logger.info(`[NEW GUILD] Joined ${guild.name} with ${guild.memberCount} members.`);
	}
}
