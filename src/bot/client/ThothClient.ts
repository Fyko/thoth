import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { ColorResolvable, Intents, Message } from 'discord.js';
import { join } from 'path';
import { Logger } from 'winston';
import { logger } from '../util/logger';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		commandHandler: CommandHandler;
		listenerHandler: ListenerHandler;
		config: ThothConfig;
	}
}

export interface ThothConfig {
	token: string;
	owners: string | string[];
	color: ColorResolvable;
}

export default class ThothClient extends AkairoClient {
	public constructor(public readonly config: ThothConfig) {
		super({
			messageCacheMaxSize: 15,
			ownerID: config.owners,
			ws: {
				intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
			},
		});
	}

	public logger: Logger = logger;

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: ['📖 ', '📔 ', '📒 ', '📚 ', '📖 ', '✏ ', '📕 ', '📗 ', '📘 ', '📙 '],
		aliasReplacement: /-/g,
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 3000,
		ignorePermissions: this.ownerID,
		argumentDefaults: {
			prompt: {
				modifyStart: (msg: Message, str: string) =>
					`${msg.author.toString()}, ${str}\n...or type \`cancel\` to cancel this command.`,
				modifyRetry: (msg: Message, str: string) =>
					`${msg.author.toString()}, ${str}\n... or type \`cancel\` to cancel this command.`,
				timeout: 'You took too long! Command cancelled.',
				ended: 'Jeez, 3 tries? Command cancelled.',
				cancel: 'Got it. Command cancelled.',
				retries: 3,
				time: 60000,
			},
			otherwise: '',
		},
	});

	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: join(__dirname, '..', 'inhibitors'),
	});

	public listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, '..', 'listeners'),
	});

	private load(): void {
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
			shard: this,
		});

		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();
		this.listenerHandler.loadAll();
	}

	public async launch(): Promise<string> {
		this.load();
		return this.login(this.config.token);
	}
}
