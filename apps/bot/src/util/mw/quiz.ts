import { anthropic } from '@ai-sdk/anthropic';
import { generateText, NoObjectGeneratedError, Output } from 'ai';
import { stripIndents } from 'common-tags';
import type { Entry, Sense, Senses } from 'mw-collegiate';
import type { Sql } from 'postgres';
import { z } from 'zod/v4';
import { logger } from '#logger';
import { formatText } from './format.js';

export interface QuizOption {
	correct: boolean;
	explanation: string;
	id: string;
	sentence: string;
	wotdHistoryId: string;
}

const optionSchema = z.object({
	sentence: z.string().describe('A 10-20 word sentence using the word'),
	explanation: z
		.string()
		.describe(
			'1-2 sentence explanation of why this is correct or incorrect'
		),
});

const quizSchema = z.object({
	correct: optionSchema.describe('The sentence that uses the word correctly'),
	incorrect_one: optionSchema.describe(
		'A sentence that subtly misuses the word'
	),
	incorrect_two: optionSchema.describe(
		'A sentence that subtly misuses the word'
	),
	incorrect_three: optionSchema.describe(
		'A sentence that subtly misuses the word'
	),
});

function extractDefinitionText(entry: Entry): string {
	const senses = entry
		.def![0]!.sseq.flat(1)
		// @ts-expect-error mw-collegiate types
		.filter(([type]: Senses) => type === 'sense')
		// @ts-expect-error mw-collegiate types
		.map(([, data]: Sense) => data);

	return senses
		.map(({ dt }) => {
			const def = dt.find(([type]) => type === 'text');
			if (!def) return null;
			const [, text] = def;
			return formatText(text as string);
		})
		.filter(Boolean)
		.join('; ');
}

export async function generateQuiz(
	sql: Sql<any>,
	word: string,
	wotdHistoryId: string,
	entry: Entry
): Promise<QuizOption[] | null> {
	const definitionText = extractDefinitionText(entry);
	const partOfSpeech = entry.fl ?? 'unknown';

	try {
		const { output } = await generateText({
			model: anthropic('claude-sonnet-4-6'),
			output: Output.object({ schema: quizSchema }),
			prompt: stripIndents`
				You are creating a vocabulary quiz for the word "${word}".

				Definition: ${definitionText}
				Part of speech: ${partOfSpeech}

				Generate 4 sentences using "${word}". The "correct" sentence must use the word correctly. The 3 "incorrect" sentences must misuse it subtly — plausible-sounding but semantically wrong.

				Rules:
				- 10-20 words per sentence
				- Varied topics/contexts
				- Wrong sentences should misapply the meaning, not be grammatically broken
				- Each explanation should be 1-2 sentences explaining why that specific usage is correct or incorrect
			`,
		});

		if (!output) {
			logger.warn('Quiz generation returned no output');
			return null;
		}

		// flatten named fields into array and shuffle
		const options = [
			{ ...output.correct, correct: true },
			{ ...output.incorrect_one, correct: false },
			{ ...output.incorrect_two, correct: false },
			{ ...output.incorrect_three, correct: false },
		].sort(() => Math.random() - 0.5);

		return await sql<QuizOption[]>`
			INSERT INTO wotd_quiz_option ${sql(
				options.map((o) => ({
					wotd_history_id: wotdHistoryId,
					sentence: o.sentence,
					correct: o.correct,
					explanation: o.explanation,
				}))
			)}
			RETURNING id, wotd_history_id as "wotdHistoryId", sentence, correct, explanation
		`;
	} catch (error) {
		if (NoObjectGeneratedError.isInstance(error)) {
			logger.warn(
				{ word, cause: error.cause },
				'Failed to generate quiz: bad model output'
			);
		} else {
			logger.error(error, 'Failed to generate quiz');
		}

		return null;
	}
}

export async function fetchQuiz(
	sql: Sql<any>,
	wotdHistoryId: string
): Promise<QuizOption[] | null> {
	const rows = await sql<QuizOption[]>`
		SELECT id, wotd_history_id as "wotdHistoryId", sentence, correct, explanation
		FROM wotd_quiz_option
		WHERE wotd_history_id = ${wotdHistoryId}
		ORDER BY created_at ASC
	`;

	return rows.length > 0 ? rows : null;
}
