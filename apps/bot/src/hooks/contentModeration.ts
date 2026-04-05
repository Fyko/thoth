/* eslint-disable func-names */
import type { CommandPayload, ArgsParam, InteractionParam, LocaleParam } from '@yuudachi/framework/types';
import i18n from 'i18next';
import type { BlockedUserModule, BlockedWordModule } from '#structures';
import { CommandError } from '#util/error.js';
import { pickRandom } from '#util/index.js';

/**
 * Applies common content moderation checks to a chatInput command
 */
export function UseModeration<Cmd extends CommandPayload>() {
	return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (
			this: { blockedUser: BlockedUserModule; blockedWord: BlockedWordModule },
			interaction: InteractionParam,
			args: ArgsParam<Cmd> & { word?: string },
			lng: LocaleParam,
		) {
			if ('word' in args && this.blockedWord.check(args.word)) {
				throw new CommandError(
					pickRandom(i18n.t('common.errors.blocked_word', { lng, returnObjects: true }) as string[]),
				);
			}

			const ban = this.blockedUser.check(interaction.user.id);
			if (ban) {
				throw new CommandError(i18n.t('common.errors.banned', { lng, reason: ban }));
			}

			return Reflect.apply(originalMethod, this, [interaction, args, lng]);
		};
	};
}
