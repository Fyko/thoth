const { exec } = require(`child_process`);

const plugin = {
	default: {
		hooks: {
			afterAllInstalled: async () => exec('git config core.hooksPath .github/hooks'),
		},
	},
};

module.exports = {
	name: `plugin-git-hooks`,
	factory: () => plugin,
};
