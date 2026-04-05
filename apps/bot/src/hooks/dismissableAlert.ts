/* eslint-disable func-names */
import type { InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import { stripIndents } from 'common-tags';
import { ButtonStyle } from 'discord-api-types/v10';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { t } from 'i18next';
import type { DismissableAlertModule } from '#structures';

const CAMPAIGN_MESSAGES = {
	show_by_default_alert:
		'As of <t:1714509120:D>, various Thoth commands will no longer automatically hide their response. Set the `hide` option to `True` to hide command responses from other users.',
};

export function UseGenericTextAlert(campaign: keyof typeof CAMPAIGN_MESSAGES) {
	const content = CAMPAIGN_MESSAGES[campaign];

	return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (
			this: { dismissableAlertService: DismissableAlertModule },
			interaction: InteractionParam,
			...args: any[]
		) {
			const result = await Reflect.apply(originalMethod, this, [interaction, ...args]);

			if (!(await this.dismissableAlertService.beenAlerted(interaction.user.id, 'show_by_default_alert'))) {
				await this.dismissableAlertService.add(interaction.user.id, 'show_by_default_alert');
				await interaction.followUp({
					content,
					ephemeral: true,
				});
			}

			return result;
		};
	};
}

export function UseFeedbackAlert() {
	return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (
			this: { dismissableAlertService: DismissableAlertModule },
			interaction: InteractionParam,
			args: unknown,
			lng: LocaleParam,
		) {
			const result = await Reflect.apply(originalMethod, this, [interaction, args, lng]);

			const feedbackCommand = interaction.client.application.commands.cache.find(
				(command) => command.name === 'feedback',
			);

			if (!(await this.dismissableAlertService.beenAlerted(interaction.user.id, 'feedback'))) {
				await this.dismissableAlertService.add(interaction.user.id, 'feedback');
				await interaction.followUp({
					content: stripIndents`
						Hey there! 👋
						
						I'd really appreciate it if you could take a moment or two out of your busy day to provide some feedback on Thoth.
						Let it be a bug report, a feature request, or just general feedback, I'd love to hear it!
						Your feedback helps me improve Thoth and provide a better experience for you and everyone who depends on it.
						
						Thank you,
						Carter, Thoth Developer
						
						*This alert will not be shown again. To provide feedback in the future, use the </${feedbackCommand?.name}:${feedbackCommand?.id}> command.*
					`,
					ephemeral: true,
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder()
								.setCustomId('feedback:bug')
								.setLabel(t('commands.feedback.meta.args.category.choices.bug', { lng }))
								.setStyle(ButtonStyle.Danger),
							new ButtonBuilder()
								.setCustomId('feedback:feature')
								.setLabel(t('commands.feedback.meta.args.category.choices.feature', { lng }))
								.setStyle(ButtonStyle.Success),
							new ButtonBuilder()
								.setCustomId('feedback:general')
								.setLabel(t('commands.feedback.meta.args.category.choices.general', { lng }))
								.setStyle(ButtonStyle.Secondary),
						),
					],
				});
			}

			return result;
		};
	};
}
