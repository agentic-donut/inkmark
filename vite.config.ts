import adapter from '@sveltejs/adapter-node';
import {sveltekit} from '@sveltejs/kit/vite';
import {paraglideVitePlugin} from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vitest/config';
import {paraglideOptions} from './paraglide.options.ts';
import {cspDirectives} from './src/lib/server/security/csp.ts';
import {DEV_SECRET_FILES, blockDevSecrets} from './src/lib/server/security/dev-secrets-plugin.ts';

export default defineConfig({
	// tailwindcss() antes do sveltekit(), como na documentação do Tailwind.
	plugins: [
		blockDevSecrets(),
		tailwindcss(),
		// CSP com nonce nos scripts e estilos que o próprio SvelteKit gera (docs/seguranca.md).
		sveltekit({adapter: adapter(), csp: {mode: 'nonce', directives: cspDirectives}}),
		paraglideVitePlugin({...paraglideOptions, strategy: [...paraglideOptions.strategy]})
	],
	// O Vite confere o caminho já resolvido no disco: nenhuma grafia de URL (barras duplas, /@fs/…)
	// alcança os arquivos com os valores reais do .env. A lista repete os padrões do Vite, que ela substitui.
	server: {fs: {deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', ...DEV_SECRET_FILES]}},
	// Svelte usa o build de navegador nos testes de estado, para as runes reagirem de verdade.
	resolve: process.env.VITEST ? {conditions: ['browser']} : undefined,
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.test.ts'],
					exclude: ['src/**/*.svelte.test.ts']
				}
			},
			{
				extends: true,
				test: {
					name: 'state',
					environment: './vitest.client-environment.ts',
					include: ['src/**/*.svelte.test.ts']
				}
			}
		]
	}
});
