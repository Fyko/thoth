import ThothClient from './bot/client/ThothClient';

void (async () => {
	const parent = new ThothClient({
		token: process.env.TOKEN!,
		color: process.env.COLOR!,
		owners: process.env.OWNERS!.split(','),
		prefix: process.env.PREFIX!,
	});

	return parent.launch();
})();
