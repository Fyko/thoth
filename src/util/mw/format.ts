/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { bold, hyperlink, italic, hideLinkEmbed } from '@discordjs/builders';
import { smallCapitals, subscript, superscript } from './builders';

const directionalCrossReferenceTarget = {
	regex: /{dxt\|(.*?)\|(.*?)\|(.*?)}/g,
	format: (_: unknown, text: string, id?: string, sense?: string | number) => {
		let url = '';
		if (sense === 'illustration') {
			url = `https://www.merriam-webster.com/assets/mw/static/art/dict/${encodeURIComponent(id as string)}.gif`;
		} else if (sense === 'table') {
			url = `https://www.merriam-webster.com/table/collegiate/${encodeURIComponent(id as string)}.htm`;
		} else if (id) {
			url = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(id)}`;
		} else {
			url = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(text)}`;
		}

		if (sense) {
			const [word, entry] = text.split(':');
			text = `${word.toUpperCase()} entry ${entry} sense ${sense}`;
			url = `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`;
		}

		return hyperlink(text.trim(), hideLinkEmbed(url));
	},
};

const crossReferenceTokenRegexes = {
	alink: {
		regex: /{a_link\|(.*?)}/g,
		format: (_: unknown, id: string) =>
			hyperlink(id, hideLinkEmbed(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(id)}`)),
	},
	dlink: {
		regex: /{d_link\|(.*?)\|(.*?)}/g,
		format: (_: unknown, text: string, id?: string) =>
			hyperlink(text, hideLinkEmbed(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(id || text)}`)),
	},
	ilink: {
		regex: /{i_link\|(.*?)\|(.*?)}/g,
		format: (_: unknown, text: string, id?: string) =>
			hyperlink(
				italic(text),
				hideLinkEmbed(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(id || text)}`),
			),
	},
	etlink: {
		regex: /{et_link\|(.*?)\|(.*?)}/g,
		format: (_: unknown, text: string, id?: string) =>
			hyperlink(text, hideLinkEmbed(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(id || text)}`)),
	},
	mat: {
		regex: /{mat\|(.*?)\|(.*?)}/g,
		format: (_: unknown, text: string, id?: string) =>
			hyperlink(
				text.toUpperCase(),
				hideLinkEmbed(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(id || text)}`),
			),
	},
	sx: {
		regex: /{sx\|(.*?)\|(.*?)\|(.*?)}/g,
		format: (_: unknown, text: string, id?: string) =>
			hyperlink(
				text.toUpperCase(),
				hideLinkEmbed(`https://www.merriam-webster.com/dictionary/${encodeURIComponent(id || text)}`),
			),
	},
	dxdef: {
		regex: /{dx_def}(.*?){\/dx_def}/g,
		format: (_: unknown, data: string) =>
			`(${data.replace(directionalCrossReferenceTarget.regex, directionalCrossReferenceTarget.format)})`,
	},
} as const;

const formatTokenOpenCloseRegexes = {
	bold: {
		regex: /{b}(.*?){\/b}/g,
		format: (_: unknown, content: string) => bold(content),
	},
	subscript: {
		regex: /{inf}(.*?){\/inf}/g,
		format: (_: unknown, content: string) => subscript(content),
	},
	italics: {
		regex: /{it}(.*?){\/it}/g,
		format: (_: unknown, content: string) => italic(content),
	},
	wi: {
		regex: /{wi}(.*?){\/wi}/g,
		format: (_: unknown, content: string) => italic(content),
	},
	smallCapitals: {
		regex: /{sc}(.*?){\/sc}/g,
		format: (_: unknown, content: string) => smallCapitals(content),
	},
	superscript: {
		regex: /{sup}(.*?){\/sup}/g,
		format: (_: unknown, content: string) => superscript(content),
	},
	moreAt: {
		regex: /{ma}(.*?){\/ma}/g,
		format: (_: unknown, content: string) => `— more at ${content}`,
	},
} as const;

const formatTokenRegexes = {
	boldColonSpace: {
		regex: /{bc}/g,
		value: `${bold(':')} `,
	},
	leftDoubleQuote: {
		regex: /{ldquo}/g,
		value: '\u201C',
	},
	rightDoubleQuote: {
		regex: /{rdquo}/g,
		value: '\u201D',
	},
} as const;

export function formatText(text: string): string {
	// run on tokens that encase text
	for (const { regex, format } of Object.values(formatTokenOpenCloseRegexes)) {
		text = text.replace(regex, format);
	}

	// run on tokens that are cross references
	for (const { regex, format } of Object.values(crossReferenceTokenRegexes)) {
		text = text.replace(regex, format);
	}

	// run on tokens that insert data
	for (const { regex, value } of Object.values(formatTokenRegexes)) {
		text = text.replace(regex, value);
	}

	return text;
}
