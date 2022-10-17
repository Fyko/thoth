import type {
	AllowedMentionsTypes,
	APIActionRowComponent,
	APIActionRowComponentTypes,
	APIEmbed,
	APIInteractionResponseChannelMessageWithSource,
	APIInteractionResponseDeferredChannelMessageWithSource,
	RESTPatchAPIWebhookWithTokenMessageResult,
} from 'discord-api-types/v10';
import { InteractionResponseType, Routes } from 'discord-api-types/v10';
import type { FastifyReply } from 'fastify';
import { container } from 'tsyringe';
import type { REST } from '../structures/REST.js';
import { kREST } from './symbols.js';

export function createResponse(
	res: FastifyReply,
	content: string,
	ephemeral = false,
	{
		components,
		embeds,
		users,
		parse,
	}: {
		components?: APIActionRowComponent<APIActionRowComponentTypes>[];
		embeds?: APIEmbed[];
		parse?: AllowedMentionsTypes[];
		users?: string[];
	} = {},
) {
	return res.status(200).send({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			components,
			content,
			embeds,
			flags: ephemeral ? 64 : 0,
			allowed_mentions: { parse, users },
		},
	} as APIInteractionResponseChannelMessageWithSource);
}

export async function sendFollowup(
	applicationId: string,
	interactionToken: string,
	content: string,
	ephemeral = false,
	{
		components,
		embeds,
		users,
		parse,
	}: {
		components?: APIActionRowComponent<APIActionRowComponentTypes>[];
		embeds?: APIEmbed[];
		parse?: AllowedMentionsTypes[];
		users?: string[];
	} = {},
) {
	const rest = container.resolve<REST>(kREST);
	return (await rest.patch(Routes.webhookMessage(applicationId, interactionToken, '@original'), {
		body: {
			components,
			content,
			embeds,
			flags: ephemeral ? 64 : 0,
			allowed_mentions: { parse, users },
		},
	})) as RESTPatchAPIWebhookWithTokenMessageResult;
}

export function defer(res: FastifyReply) {
	return res.status(200).send({
		type: InteractionResponseType.DeferredChannelMessageWithSource,
		data: {
			flags: 64,
		},
	} as APIInteractionResponseDeferredChannelMessageWithSource);
}
