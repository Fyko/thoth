import { join } from 'path';
import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { Logger, createLogger, transports, format } from 'winston';
import { LoggerConfig } from '../util/LoggerConfig';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		commandHandler: CommandHandler;
		config: ThothConfig;
		cache: Set<string>;
	}
}

export interface ThothConfig {
	token: string;
	owners: string | string[];
	color: string;
	prefix: string;
}

export default class ThothClient extends AkairoClient {
	public constructor(config: ThothConfig) {
		super({
			messageCacheMaxSize: 150,
			ownerID: config.owners,
			disabledEvents: ['TYPING_START'],
			partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'USER'],
		});

		this.config = config;

		this.cache = new Set();

		this.listenerHandler
			.on('load', i => this.logger.debug(`[LISTENER HANDLER] [${i.category.id.toUpperCase()}] Loaded ${i.id} listener!`));
	}

	public logger: Logger = createLogger({
		levels: LoggerConfig.levels,
		format: format.combine(
			format.colorize({ level: true }),
			format.errors({ stack: true }),
			format.splat(),
			format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
			format.printf((data: any) => {
				const { timestamp, level, message, ...rest } = data;
				return `[${timestamp}] ${level}: ${message}${Object.keys(rest).length ? `\n${JSON.stringify(rest, null, 2)}` : ''}`;
			}),
		),
		transports: new transports.Console(),
		level: 'custom',
	});;

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
				modifyStart: (msg: Message, str: string) => `${msg.author}, ${str}\n...or type \`cancel\` to cancel this command.`,
				modifyRetry: (msg: Message, str: string) => `${msg.author}, ${str}\n... or type \`cancel\` to cancel this command.`,
				timeout: 'You took too long! Command cancelled.',
				ended: 'Jeez, 3 tries? Command cancelled.',
				cancel: 'Got it. Command cancelled.',
				retries: 3,
				time: 60000,
			},
			otherwise: '',
		},
	});

	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, { directory: join(__dirname, '..', 'inhibitors') });

	public listenerHandler: ListenerHandler = new ListenerHandler(this, { directory: join(__dirname, '..', 'listeners') });

	private async load(): Promise<void> {
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
		await this.load();
		return this.login(this.config.token);
	}
}
