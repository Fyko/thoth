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
import { fetch, File, FormData } from 'undici';
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

export async function createDefinitionResponse(
	res: FastifyReply,
	word: string,
	pronunciationUrl: string,
	content: string,
	
) {
	const form = new FormData();
	form.set('payload_json', JSON.stringify({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content,
		},
	}));

	const pronResponse = await fetch(pronunciationUrl);
	form.set('files[0]', new File([await pronResponse.blob()], `${word}.mp3`))

	return res.status(200).header('content-type', 'multipart/form-data').send(form);
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
