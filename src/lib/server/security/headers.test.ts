import {describe, expect, it} from 'vitest';
import {HSTS_VALUE, applySecurityHeaders} from './headers.ts';
import {cspDirectives} from './csp.ts';

const base = {secureTransport: true, dev: false, admin: false};

describe('applySecurityHeaders', () => {
	it('põe os cabeçalhos básicos em toda resposta', () => {
		const response = applySecurityHeaders(new Response('ok'), base);
		expect(response.headers.get('x-content-type-options')).toBe('nosniff');
		expect(response.headers.get('x-frame-options')).toBe('DENY');
		expect(response.headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
		expect(response.headers.get('cross-origin-opener-policy')).toBe('same-origin');
		const permissions = response.headers.get('permissions-policy') ?? '';
		for (const feature of ['camera', 'microphone', 'geolocation', 'payment']) {
			expect(permissions).toContain(`${feature}=()`);
		}
	});

	it('o admin não manda nem a origem para fora', () => {
		const response = applySecurityHeaders(new Response('ok'), {...base, admin: true});
		expect(response.headers.get('referrer-policy')).toBe('same-origin');
	});

	it('HSTS só sai em produção e por HTTPS', () => {
		expect(
			applySecurityHeaders(new Response(), base).headers.get('strict-transport-security')
		).toBe(HSTS_VALUE);
		for (const options of [
			{...base, secureTransport: false},
			{...base, dev: true}
		]) {
			expect(
				applySecurityHeaders(new Response(), options).headers.has('strict-transport-security')
			).toBe(false);
		}
		expect(HSTS_VALUE).not.toMatch(/includeSubDomains|preload/);
	});

	it('sobrescreve valores que a rota tenha posto e não perde corpo, status nem outros cabeçalhos', async () => {
		const original = new Response('corpo', {
			status: 201,
			headers: {'x-frame-options': 'ALLOWALL', 'x-custom': '1'}
		});
		const response = applySecurityHeaders(original, base);
		expect(response.headers.get('x-frame-options')).toBe('DENY');
		expect(response.status).toBe(201);
		expect(response.headers.get('x-custom')).toBe('1');
		expect(await response.text()).toBe('corpo');
	});

	it('funciona com respostas de cabeçalhos imutáveis (Response.redirect)', () => {
		const response = applySecurityHeaders(Response.redirect('https://inkmark.test/x', 302), base);
		expect(response.status).toBe(302);
		expect(response.headers.get('location')).toBe('https://inkmark.test/x');
		expect(response.headers.get('x-content-type-options')).toBe('nosniff');
	});
});

describe('política de conteúdo (CSP)', () => {
	const policy = cspDirectives as unknown as Record<string, readonly string[]>;

	it('nada de eval nem de script inline; scripts só do próprio site (mais o nonce do SvelteKit)', () => {
		expect(policy['script-src']).toEqual(['self']);
		for (const [name, sources] of Object.entries(policy)) {
			expect(sources, name).not.toContain('unsafe-eval');
			if (name !== 'style-src-attr') expect(sources, name).not.toContain('unsafe-inline');
			expect(sources, name).not.toContain('*');
		}
	});

	it('bloqueia embutir o site, plugins, <base> e formulários para fora', () => {
		expect(policy['frame-ancestors']).toEqual(['none']);
		expect(policy['object-src']).toEqual(['none']);
		expect(policy['base-uri']).toEqual(['self']);
		expect(policy['form-action']).toEqual(['self']);
		expect(policy['default-src']).toEqual(['self']);
	});

	it('mantém o que o app precisa: PNG pelo canvas (blob:/data:), fontes e fetch do próprio site', () => {
		expect(policy['img-src']).toEqual(expect.arrayContaining(['self', 'data:', 'blob:']));
		expect(policy['font-src']).toEqual(['self']);
		expect(policy['connect-src']).toEqual(['self']);
	});
});
