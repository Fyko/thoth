import type { AutocompleteInteraction } from 'discord.js';

const allTimezones = Intl.supportedValuesOf('timeZone');

export async function timezoneAutoComplete(interaction: AutocompleteInteraction<'cached'>) {
	const input = interaction.options.getFocused().trim().toLowerCase();

	const filtered = input
		? allTimezones.filter((tz) => tz.toLowerCase().includes(input))
		: allTimezones.filter((tz) => tz.startsWith('America/') || tz.startsWith('Europe/'));

	await interaction.respond(filtered.slice(0, 25).map((tz) => ({ name: tz, value: tz })));
}
