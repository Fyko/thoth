import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '..', '.env') });

import ThothClient from './bot/client/ThothClient';

(async () => {
	const parent = new ThothClient({
		token: process.env.TOKEN!,
		color: process.env.COLOR!,
		owners: process.env.OWNERS!.split(','),
		prefix: process.env.PREFIX!,
	});

	return parent.launch();
})();
