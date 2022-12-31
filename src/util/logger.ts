import { pino } from 'pino';

export const logger = pino({
	level: 'trace',
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'SYS:standard',
		},
	},
});
