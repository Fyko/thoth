import type { Command } from '@yuudachi/framework';

export function useContentModeration(cmd: Command) {
	cmd.chatInput = async (interaction, args, lng) => {
		// todo: custom logic

		await cmd.chatInput(interaction, args, lng);
	};
}
