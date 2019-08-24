import { Command, Listener } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { addBreadcrumb, setContext, captureException, Severity } from '@sentry/node';

export default class ErrorHandler extends Listener {
	public constructor() {
		super('error', {
			category: 'commandHandler',
			emitter: 'commandHandler',
			event: 'error',
		});
	}

	public exec(err: Error, msg: Message, command: Command): void {
		this.client.logger.error(`[COMMAND ERROR] ${err} ${err.stack}`);
		if (msg.guild && msg.channel instanceof TextChannel && msg.channel!.permissionsFor(this.client.user!)!.has('SEND_MESSAGES')) {
			msg.channel.send([
				'Looks like an error occured.',
				'```js',
				`${err}`,
				'```',
			]);
		}

		addBreadcrumb({
			message: 'cmdError',
			category: command ? command.category.id : 'other',
			level: Severity.Error,
			data: {
				user: {
					id: msg.author!.id,
					tag: msg.author!.tag
				},
				location: msg.guild
					? {
						type: 'guild',
						id: msg.guild.id,
						name: msg.guild.name
					}
					: {
						type: 'dm',
						user: msg.author!.tag
					},
				command: command
					? {
						id: command.id,
						aliases: command.aliases,
						category: command.category.id
					}
					: null,
				message: {
					id: msg.id,
					content: msg.content,
					attachments: msg.attachments.size ? msg.attachments.map(m => m.proxyURL) : null
				}
			}
		});

		setContext('cmdStarted', {
			user: {
				id: msg.author!.id,
				tag: msg.author!.tag
			},
			other: {
				location: msg.guild
					? {
						type: 'guild',
						id: msg.guild.id,
						name: msg.guild.name
					}
					: {
						type: 'dm',
						user: msg.author!.tag
					},
				command: command
					? {
						id: command.id,
						aliases: command.aliases,
						category: command.category.id
					}
					: null,
				message: {
					id: msg.id,
					content: msg.content
				}
			}
		});
		captureException(err);
	}
}
