import {describe, expect, it} from 'vitest';
import {blockDevSecrets, isBlockedDevPath} from './dev-secrets-plugin.ts';

describe('isBlockedDevPath', () => {
	it('bloqueia o arquivo que carrega as variáveis de ambiente reais, em qualquer grafia', () => {
		for (const url of [
			'/.svelte-kit/generated/dev/env/config.js',
			'/.svelte-kit/generated/dev/env/config.js?t=123',
			'/.SVELTE-KIT/generated/dev/env/CONFIG.js',
			'/%2esvelte-kit/generated/dev/env/config.js',
			'/.svelte-kit/generated/dev/env/private/server.js',
			'/@fs/Users/alguem/projeto/.svelte-kit/generated/dev/env/config.js',
			'/.svelte-kit/generated/dev/./env/config.js',
			'/%E0%A4%A/.svelte-kit/generated/dev/env/config.js',
			// Barras duplas e invertidas: o Vite abre o mesmo arquivo (achado da revisão de segurança).
			'/.svelte-kit/generated/dev//env/config.js',
			'//.svelte-kit/generated/dev/env/config.js',
			'/.svelte-kit//generated/dev/env/config.js',
			'/@fs//Users/alguem/projeto/.svelte-kit/generated/dev//env/config.js',
			'/.svelte-kit/generated/dev/env%5Cconfig.js'
		]) {
			expect(isBlockedDevPath(url), url).toBe(true);
		}
	});

	it('não atrapalha o resto do desenvolvimento', () => {
		for (const url of [
			'/',
			'/src/routes/+page.svelte',
			'/.svelte-kit/generated/dev/client/app.js',
			'/.svelte-kit/generated/dev/env/public/client.js',
			'/@vite/client'
		]) {
			expect(isBlockedDevPath(url), url).toBe(false);
		}
		expect(isBlockedDevPath(undefined)).toBe(false);
	});
});

describe('blockDevSecrets', () => {
	it('registra o middleware antes dos internos do Vite e responde 404', () => {
		const plugin = blockDevSecrets();
		let middleware: ((req: {url?: string}, res: unknown, next: () => void) => void) | undefined;
		(plugin.configureServer as (server: unknown) => void)({
			middlewares: {use: (fn: typeof middleware) => (middleware = fn)}
		});
		const response = {
			statusCode: 200,
			body: '',
			end(text: string) {
				this.body = text;
			}
		};
		let passed = 0;
		middleware!({url: '/.svelte-kit/generated/dev/env/config.js'}, response, () => passed++);
		expect(response.statusCode).toBe(404);
		expect(passed).toBe(0);
		middleware!({url: '/'}, response, () => passed++);
		expect(passed).toBe(1);
		expect(plugin.apply).toBe('serve');
	});
});
