import { Listener } from 'discord-akairo';
import { Guild, WebhookClient } from 'discord.js';
import * as moment from 'moment';
import 'moment-duration-format';
import { stripIndents } from 'common-tags';

const { SERVERLOGID, SERVERLOGTOKEN } = process.env;

export default class GuildCreateListener extends Listener {
	public constructor() {
		super('guildCreate', {
			category: 'client',
			emitter: 'client',
			event: 'guildCreate',
		});
	}

	public async exec(guild: Guild): Promise<void> {
		this.client.logger.info(`[NEW GUILD] Joined ${guild.name} with ${guild.memberCount} members.`);
		const log = new WebhookClient(SERVERLOGID!, SERVERLOGTOKEN!);
		const createdAgo = moment.utc(guild.createdAt).format('MM/DD/YYYY h:mm A');
		const owner = await this.client.users.fetch(guild.ownerID).catch(() => ({ tag: 'JohnDoe#0000', id: '????' }));
		const embed = this.client.util.embed()
			.setAuthor('Joined a Guild', guild.iconURL() || this.client.user!.displayAvatarURL())
			.setColor('#0BDA51')
			.setDescription(stripIndents`
                **Name**: ${guild.name} \`[${guild.id}]\`
                **Owner**: ${owner.tag} \`[${owner.id}]\`
                **Member Count**: ${guild.memberCount}
                **Created At**: ${createdAgo}
            `)
			.setTimestamp();
		try {
			await log.send({
				embeds: [embed],
				avatarURL: this.client.user!.displayAvatarURL(),
				username: `${this.client.user!.username} - Guild Logs`,
			});
		} catch (err) {
			this.client.logger.error(`[GUILD CREAE LOG]: ${err}`);
		}
	}
}
