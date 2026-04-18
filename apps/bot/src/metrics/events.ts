import { z } from 'zod';

export const EventSchemas = {
	'command.invoked': z.object({
		command: z.string(),
		success: z.boolean(),
		durationMs: z.number(),
	}),
	'button.clicked': z.object({ customId: z.string() }),
	'modal.submitted': z.object({ customId: z.string() }),
	'guild.joined': z.object({ memberCount: z.number() }),
	'guild.left': z.object({}),
	'wotd.delivered': z.object({
		word: z.string(),
		tier: z.enum(['free', 'premium']),
	}),
	'wotd.quiz_attempted': z.object({
		word: z.string(),
		correct: z.boolean(),
	}),
	'entitlement.checked': z.object({
		kind: z.enum(['premium']),
		granted: z.boolean(),
		site: z.enum(['wotd_setup', 'wotd_delivery']),
	}),
	'entitlement.granted': z.object({ skuId: z.string() }),
	'entitlement.revoked': z.object({ skuId: z.string() }),
	'feedback.submitted': z.object({
		type: z.enum(['bug', 'feature', 'general']),
	}),
} as const satisfies Record<string, z.ZodType>;

export type EventName = keyof typeof EventSchemas;
export type EventProps<N extends EventName> = z.infer<(typeof EventSchemas)[N]>;

export interface EventEnvelope<N extends EventName = EventName> {
	name: N;
	userId: string | null;
	guildId: string | null;
	props: EventProps<N>;
	occurredAt: string; // ISO
}

export type ValidateResult = { success: true; data: unknown } | { success: false; error: string };

export function validateEvent(name: string, props: unknown): ValidateResult {
	const schema = (EventSchemas as Record<string, z.ZodType>)[name];
	if (!schema) return { success: false, error: `unknown event name: ${name}` };
	const parsed = schema.safeParse(props);
	if (parsed.success) return { success: true, data: parsed.data };
	return { success: false, error: parsed.error.message };
}
