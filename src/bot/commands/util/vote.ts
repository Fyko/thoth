import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class VoteCommand extends Command {
	public constructor() {
		super('vote', {
			aliases: ['vote'],
			description: {
				content: 'Returns a link to vote for Thoth on DiscordBots.org.',
			},
			category: 'utilities',
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | undefined> {
		const embed = this.client.util.embed()
			.setColor(this.client.config.color)
			.setDescription(`Vote for ${this.client.user!.username} on [\`DiscordBots.org\`](https://discordbots.org/bot/${this.client.user!.id}/vote)!`);

		return msg.util!.send({ embed });
	}
}

