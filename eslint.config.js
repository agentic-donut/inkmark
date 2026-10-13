import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

export default ts.config(
	{
		ignores: [
			'build/',
			'.svelte-kit/',
			'node_modules/',
			'data/',
			'static/',
			'docs/',
			'scripts/',
			// Gerado pelo Paraglide (npm run i18n:compile)
			'src/lib/paraglide/',
			// Motor legado: fica fora do lint (ver docs/arquitetura.md)
			'src/lib/domain/logo/engine.js',
			'src/lib/domain/logo/kit.js',
			'src/lib/domain/logo/badges.js',
			'src/lib/domain/logo/proposals.js',
			'src/lib/domain/logo/proposals4.js',
			'src/lib/domain/logo/proposals5.js',
			'src/lib/domain/logo/proposals6.js',
			'src/lib/domain/logo/ink.js'
		]
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: {globals: {...globals.browser, ...globals.node}}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts'],
		languageOptions: {parserOptions: {parser: ts.parser}}
	}
);
