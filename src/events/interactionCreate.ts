import process from 'node:process';
import type { Command } from '@yuudachi/framework';
import { transformApplicationInteraction, kCommands } from '@yuudachi/framework';
import type { Event } from '@yuudachi/framework/types';
import { ApplicationCommandType, Client, EmbedBuilder, Events, WebhookClient } from 'discord.js';
import { Counter, Registry } from 'prom-client';
import { container, inject, injectable } from 'tsyringe';
import { logger } from '#logger';
import { RedisManager } from '#structures';
import { fetchAutocomplete, fetchTopWords } from '#util/mw/index.js';
import { kRedis } from '#util/symbols.js';

const registry = container.resolve<Registry<'text/plain; version=0.0.4; charset=utf-8'>>(Registry);
const commandsMetrics = new Counter({
	name: 'thoth_commands',
	help: 'Number of commands executed',
	labelNames: ['command', 'success'],
	registers: [registry],
});

@injectable()
export default class implements Event {
	public name = 'Interaction handling';

	public event = Events.InteractionCreate as const;

	public webhook = new WebhookClient({ url: process.env.COMMAND_LOG_WEBHOOK_URL! });

	public constructor(
		public readonly client: Client<true>,
		@inject(kCommands) public readonly commands: Map<string, Command>,
		@inject(kRedis) public readonly redis: RedisManager,
	) {}

	public execute(): void {
		this.client.on(this.event, async (interaction) => {
			if (!interaction.isCommand() && !interaction.isAutocomplete()) {
				return;
			}

			if (!interaction.inCachedGuild()) return;

			const command = this.commands.get(interaction.commandName.toLowerCase());
			const args_ = interaction.options.data.map(
				// @ts-expect-error i know it works
				({ name, value }: { name: string; value: any }) => `\`${name}\`: \`${value}\``,
			);

			if (command) {
				try {
					if (interaction.commandType === ApplicationCommandType.ChatInput) {
						const autocomplete = interaction.isAutocomplete();
						logger.info(
							{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
							`Executing ${autocomplete ? 'autocomplete for' : 'chat input'} command ${interaction.commandName}`,
						);

						if (autocomplete) {
							try {
								if (interaction.commandName === 'definition') {
									const input = interaction.options.getFocused().trim();

									if (input) {
										const search = await fetchAutocomplete(this.redis, input);

										await interaction.respond(
											search.docs
												.filter((r) => r.ref === 'owl-combined')
												.slice(0, 5)
												.map(({ word }) => ({ name: word, value: word })),
										);

										logger.debug(
											{ input, interactionId: interaction.id, userId: interaction.user.id },
											'performed autocomplete for definition command',
										);
									} else {
										const top = await fetchTopWords(this.redis);

										await interaction.respond([
											{ name: 'What are you looking for? Or select a trending Merriam-Webster query:', value: 'no' },
											...top.data.words.slice(0, 16).map((word) => ({ name: word, value: word })),
										]);

										logger.debug(
											{ interactionId: interaction.id, userId: interaction.user.id },
											'provided top words for definition command',
										);
									}
								}
							} catch {}

							return;
						}

						await command.chatInput(
							interaction,
							transformApplicationInteraction(interaction.options.data),
							interaction.locale,
						);

						void this.webhook.send({
							embeds: [
								new EmbedBuilder()
									.setTitle(interaction.commandName)
									.setTimestamp()
									.setAuthor({
										name: `${interaction.user.tag} (${interaction.user.id})`,
										iconURL: interaction.user.displayAvatarURL({ size: 128, forceStatic: false }),
									})
									.addFields({ name: 'Arguments', value: args_.length ? args_.join('\n') : 'No arguments provided' })
									.setFooter({ text: 'Command executed successfully' })
									.setColor('DarkGreen'),
							],
						});

						commandsMetrics.inc({
							success: 'true',
							command: interaction.commandName,
						});
					}
				} catch (error) {
					const err = error as Error;
					logger.error(err, err.message);

					void this.webhook.send({
						content: `<@${process.env.OWNER_ID}>`,
						embeds: [
							new EmbedBuilder()
								.setTitle(interaction.commandName)
								.setTimestamp()
								.setAuthor({
									name: `${interaction.user.tag} (${interaction.user.id})`,
									iconURL: interaction.user.displayAvatarURL({ size: 128, forceStatic: false }),
								})
								.setDescription(`\`\`\`js\n${err}\`\`\``)
								.addFields({ name: 'Arguments', value: args_.length ? args_.join('\n') : 'No arguments provided' })
								.setFooter({ text: 'Command execution failed' })
								.setColor('DarkRed'),
						],
					});

					commandsMetrics.inc({
						success: 'false',
						command: interaction.commandName,
					});

					if (interaction.isAutocomplete()) return;

					try {
						if (!interaction.deferred && !interaction.replied) {
							logger.warn(
								{ command: { name: interaction.commandName, type: interaction.type }, userId: interaction.user.id },
								'Command interaction has not been deferred before throwing',
							);
							await interaction.deferReply({ ephemeral: true });
						}

						await interaction.editReply({ content: err.message, components: [] });
					} catch (error) {
						const sub = error as Error;
						logger.error(sub, sub.message);
					}
				}
			}
		});
	}
}
