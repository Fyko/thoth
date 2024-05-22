import tsParser from '@typescript-eslint/parser';
import astroParser from 'astro-eslint-parser';
import astro from 'eslint-config-neon/flat/astro.js';
import common from 'eslint-config-neon/flat/common.js';
import node from 'eslint-config-neon/flat/node.js';
import prettier from 'eslint-config-neon/flat/prettier.js';
import react from 'eslint-config-neon/flat/react.js';
import typescript from 'eslint-config-neon/flat/typescript.js';
import merge from 'lodash.merge';

const commonFiles = '{js,mjs,cjs,ts,mts,cts,jsx,tsx}';

const commonRuleset = merge(...common, { files: [`**/*${commonFiles}`] });

const nodeRuleset = merge(...node, { files: [`**/*${commonFiles}`] });

const prettierRuleset = merge(...prettier, { files: [`**/*${commonFiles}`] });

const typeScriptRuleset = merge(...typescript, {
	files: [`**/*${commonFiles}`],
	languageOptions: {
		parserOptions: {
			warnOnUnsupportedTypeScriptVersion: false,
			allowAutomaticSingleRunInference: true,
			project: ['tsconfig.eslint.json', 'apps/*/tsconfig.eslint.json', 'packages/*/tsconfig.eslint.json'],
		},
	},
	rules: {
		'@typescript-eslint/consistent-type-definitions': [2, 'interface'],
		'@typescript-eslint/naming-convention': [
			2,
			{
				selector: 'typeParameter',
				format: ['PascalCase'],
				custom: {
					regex: '^\\w{3,}',
					match: true,
				},
			},
		],
		'@typescript-eslint/consistent-type-imports': 0,
	},
	settings: {
		'import/resolver': {
			typescript: {
				project: ['tsconfig.eslint.json', 'apps/*/tsconfig.eslint.json', 'packages/*/tsconfig.eslint.json'],
			},
		},
	},
});

/** @type {import('eslint').Linter.FlatConfig[]} */
const reactRuleset = merge(...react, {
	files: [`**/*${commonFiles}`],
	rules: {
		'react/react-in-jsx-scope': 0,
		'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
		'@typescript-eslint/triple-slash-reference': 0,
	},
});

const astroRules = merge(...astro, {
	files: [`**/*.astro`],
	languageOptions: {
		parser: astroParser,
		parserOptions: {
			parser: tsParser,
		},
	},
});

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	{
		ignores: ['**/node_modules/', '.git/', '**/dist/'],
	},
	{
		files: ['**/*{js,mjs,cjs,jsx}'],
		rules: { 'tsdoc/syntax': 0 },
	},
	commonRuleset,
	nodeRuleset,
	typeScriptRuleset,
	prettierRuleset,
	reactRuleset,
	astroRules,
];
