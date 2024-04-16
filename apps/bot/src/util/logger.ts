import process from 'node:process';
import { pino, type LoggerOptions } from 'pino';

const options =
	process.env.NODE_ENV === 'production'
		? ({
				level: 'debug',
			} satisfies LoggerOptions)
		: ({
				level: 'debug',
				transport: {
					target: 'pino-pretty',
				},
			} satisfies LoggerOptions);

export const logger = pino(options);
