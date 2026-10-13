import {describe, expect, it} from 'vitest';
import {rerouteTarget} from '#lib/i18n/routing.ts';
import {LOGIN_PATH, createAdminHandle} from './admin-guard.ts';
import {createAdminAuth} from './admin-auth.ts';
import {SESSION_COOKIE} from './session.ts';

const env = {password: 'senha-de-teste-longa', secret: 'a1b2c3d4e5f60718'.repeat(2)};
const ORIGIN = 'https://inkmark.test';

/** Caminhos que chegam ao servidor como o navegador ou um atacante os escreveria (já "como na linha de pedido"). */
const ADMIN_TARGETS = [
	'/admin',
	'/admin/',
	'/admin/.',
	'/admin/login/..',
	'/admin/logout',
	'/admin/qualquer-coisa',
	'/admin//login',
	'/admin//',
	'/admin?/visibility',
	'/admin/?x=1',
	'/admin/__data.json',
	'/admin/__data.json?x-sveltekit-invalidated=01',
	'/admin/x/__data.json',
	'/admin/login/..%2fx',
	'/%61dmin',
	'/%61dmin/',
	'/%61dmin/login',
	'/%41dmin'.replace('%41', 'a'),
	'/admin%2F',
	'/admin%2flogin',
	'/a/../admin',
	'/./admin',
	'/en/%2e%2e/admin',
	'/%2e%2e/admin',
	'/admin/%2e%2e/admin'
];

/** Caminhos que NUNCA podem alcançar uma rota de admin (404 ou página pública). */
const NOT_ADMIN_TARGETS = [
	'/en/admin',
	'/es/admin',
	'/en/admin/',
	'/en/admin/login',
	'/es/admin/login',
	'/en//admin',
	'/es//admin/login',
	'/en/%61dmin',
	'/es/%61dmin/login',
	'/en/admin%2F',
	'/en%2Fadmin',
	'/admin%252F',
	'/admin%252flogin',
	'/EN/admin',
	'/ADMIN',
	'/Admin/login',
	'//admin',
	'/en/__data.json',
	'/__data.json',
	'/',
	'/en',
	'/es?pagina=2'
];

function setup(authenticatedWith?: string) {
	const auth = createAdminAuth({env});
	const handle = createAdminHandle(() => auth);
	const login = () => {
		const result = auth.login(env.password, 'ip');
		if (!result.ok) throw new Error('login deveria funcionar');
		return result.token;
	};
	const token = authenticatedWith ?? undefined;
	return {auth, handle, login, token};
}

async function run(
	handle: ReturnType<typeof createAdminHandle>,
	target: string,
	options: {method?: string; cookie?: string; headers?: Record<string, string>} = {}
) {
	const url = new URL(target, ORIGIN);
	let resolved = 0;
	const locals = {} as App.Locals;
	const event = {
		url,
		locals,
		request: new Request(url, {method: options.method ?? 'GET', headers: options.headers}),
		cookies: {get: (name: string) => (name === SESSION_COOKIE ? options.cookie : undefined)}
	};
	const response = await handle({
		event: event as never,
		resolve: async () => {
			resolved++;
			return new Response('conteudo', {status: 200});
		}
	});
	return {response, resolved, locals};
}

/** O roteador do SvelteKit decodifica o caminho e compara com `/admin` e `/admin/...`. */
function routerSeesAdmin(target: string): boolean {
	const url = new URL(target, ORIGIN);
	const routed = new URL(rerouteTarget(url), ORIGIN).pathname;
	let decoded = routed;
	try {
		decoded = decodeURIComponent(routed);
	} catch {
		// caminho inválido: o SvelteKit responde 400.
	}
	return decoded === '/admin' || decoded.startsWith('/admin/');
}

describe('matriz de proteção do /admin sem sessão', () => {
	for (const target of ADMIN_TARGETS) {
		it(`barra ${target}`, async () => {
			const {handle} = setup();
			const {response, resolved} = await run(handle, target);
			const url = new URL(target, ORIGIN);
			if (url.pathname === LOGIN_PATH) {
				expect(resolved).toBe(1);
				return;
			}
			expect(resolved, 'não pode chegar à rota').toBe(0);
			expect(response.status).toBe(303);
			expect(response.headers.get('location')).toMatch(/^\/admin\/login\?next=%2F/);
			expect(response.headers.get('cache-control')).toBe('no-store');
		});
	}

	it('o login (e só ele) continua acessível, também por __data.json decodificado', async () => {
		const {handle} = setup();
		for (const target of ['/admin/login', '/admin/login?next=%2Fadmin']) {
			expect((await run(handle, target)).resolved).toBe(1);
		}
	});

	it('formulário via fetch (x-sveltekit-action) recebe o redirect em JSON, nunca o conteúdo', async () => {
		const {handle} = setup();
		const {response, resolved} = await run(handle, '/admin?/visibility', {
			method: 'POST',
			headers: {'x-sveltekit-action': 'true'}
		});
		expect(resolved).toBe(0);
		expect(await response.json()).toMatchObject({type: 'redirect', status: 303});
	});

	it('toda ação (POST) de /admin sem sessão é barrada, não só a leitura', async () => {
		const {handle} = setup();
		for (const action of [
			'visibility',
			'feature',
			'edit',
			'move',
			'makeDefault',
			'reset',
			'bulkVisibility'
		]) {
			const {resolved, response} = await run(handle, `/admin?/${action}`, {method: 'POST'});
			expect(resolved, action).toBe(0);
			expect(response.status, action).toBe(303);
		}
		expect((await run(handle, '/admin/logout', {method: 'POST'})).resolved).toBe(0);
	});

	it('cookie adulterado, de outro segredo ou de outra senha não vale', async () => {
		const {handle, login} = setup();
		const token = login();
		const otherAuth = createAdminAuth({
			env: {...env, secret: '9f8e7d6c5b4a3921'.repeat(2)}
		});
		const foreign = otherAuth.login(env.password, 'ip');
		for (const cookie of [
			token + 'x',
			token.replace(/.$/, 'A'),
			'x.y',
			foreign.ok ? foreign.token : ''
		]) {
			expect((await run(handle, '/admin', {cookie})).resolved).toBe(0);
		}
	});

	it('com sessão válida o painel abre; depois do logout o mesmo cookie é barrado', async () => {
		const {handle, login, auth} = setup();
		const token = login();
		const open = await run(handle, '/admin', {cookie: token});
		expect(open.resolved).toBe(1);
		expect(open.locals.admin).toEqual({enabled: true, authenticated: true});
		auth.logout(token);
		expect((await run(handle, '/admin', {cookie: token})).resolved).toBe(0);
	});
});

describe('caminhos que o hook não considera admin não alcançam rota de admin', () => {
	for (const target of NOT_ADMIN_TARGETS) {
		it(`${target}`, () => {
			expect(routerSeesAdmin(target)).toBe(false);
		});
	}
});

describe('consistência entre o hook e o roteador', () => {
	it('tudo o que o roteador resolve como admin passa pelo guarda', async () => {
		const {handle} = setup();
		for (const target of [...ADMIN_TARGETS, ...NOT_ADMIN_TARGETS]) {
			if (!routerSeesAdmin(target)) continue;
			const url = new URL(target, ORIGIN);
			if (url.pathname === LOGIN_PATH) continue;
			const {resolved} = await run(handle, target);
			expect(resolved, `${target} chegou à rota de admin sem sessão`).toBe(0);
		}
	});

	it('páginas públicas não ganham `locals.admin` nem cache-control de admin', async () => {
		const {handle} = setup();
		const {locals, response, resolved} = await run(handle, '/en');
		expect(resolved).toBe(1);
		expect(locals.admin).toBeUndefined();
		expect(response.headers.get('cache-control')).toBeNull();
	});
});

describe('admin desativado (sem variáveis de ambiente)', () => {
	const disabled = createAdminHandle(() => createAdminAuth({env: {}}));

	it('só a página de aviso abre; todo o resto é fechado', async () => {
		expect((await run(disabled, '/admin')).resolved).toBe(1);
		for (const target of ['/admin/login', '/admin/x', '/admin/__data.json', '/%61dmin/login']) {
			const {response, resolved} = await run(disabled, target);
			expect(resolved, target).toBe(0);
			expect(response.status, target).toBe(303);
			expect(response.headers.get('location'), target).toBe('/admin');
		}
	});

	it('escritas respondem 503, com e sem cookie', async () => {
		for (const target of ['/admin?/visibility', '/admin/login', '/admin/logout']) {
			const {response, resolved} = await run(disabled, target, {
				method: 'POST',
				cookie: 'qualquer.coisa'
			});
			expect(resolved, target).toBe(0);
			expect(response.status, target).toBe(503);
		}
	});
});

describe('ADMIN_REQUIRE_HTTPS: o admin só existe por HTTPS', () => {
	const ADMIN_ROUTES = ['/admin', '/admin/login', '/admin/__data.json', '/%61dmin/login'];
	const HTTP_ORIGIN = 'http://inkmark.home';

	/** Como `run`, mas com a origem do pedido escolhida (o adapter monta `event.url` com o protocolo real). */
	async function runAt(
		origin: string,
		requireHttps: boolean,
		target: string,
		options: {method?: string; cookie?: string; auth?: ReturnType<typeof createAdminAuth>} = {}
	) {
		const auth = options.auth ?? createAdminAuth({env});
		const handle = createAdminHandle(() => auth, {requireHttps: () => requireHttps});
		const url = new URL(target, origin);
		let resolved = 0;
		const event = {
			url,
			locals: {} as App.Locals,
			request: new Request(url, {method: options.method ?? 'GET'}),
			cookies: {get: (name: string) => (name === SESSION_COOKIE ? options.cookie : undefined)}
		};
		const response = await handle({
			event: event as never,
			resolve: async () => {
				resolved++;
				return new Response('conteudo', {status: 200});
			}
		});
		return {response, resolved, locals: event.locals};
	}

	for (const target of ADMIN_ROUTES) {
		it(`HTTP com a trava ligada: ${target} dá 404 sem chegar à rota, sem redirecionar`, async () => {
			const {response, resolved, locals} = await runAt(HTTP_ORIGIN, true, target);
			expect(resolved).toBe(0);
			expect(response.status).toBe(404);
			expect(response.headers.get('location')).toBeNull();
			expect(response.headers.get('cache-control')).toBe('no-store');
			expect(locals.admin).toBeUndefined();
		});

		it(`HTTP com a trava desligada: ${target} se comporta como antes`, async () => {
			const {response, resolved} = await runAt(HTTP_ORIGIN, false, target);
			if (new URL(target, HTTP_ORIGIN).pathname === LOGIN_PATH) {
				expect(resolved).toBe(1);
			} else {
				expect(resolved).toBe(0);
				expect(response.status).toBe(303);
			}
		});

		it(`HTTPS com a trava ligada: ${target} se comporta como antes`, async () => {
			const {response, resolved} = await runAt(ORIGIN, true, target);
			if (new URL(target, ORIGIN).pathname === LOGIN_PATH) {
				expect(resolved).toBe(1);
			} else {
				expect(resolved).toBe(0);
				expect(response.status).toBe(303);
			}
		});

		it(`HTTPS com a trava desligada: ${target} se comporta como antes`, async () => {
			const {response, resolved} = await runAt(ORIGIN, false, target);
			if (new URL(target, ORIGIN).pathname === LOGIN_PATH) {
				expect(resolved).toBe(1);
			} else {
				expect(resolved).toBe(0);
				expect(response.status).toBe(303);
			}
		});
	}

	it('formulário (POST) por HTTP com a trava ligada: 404, sem login nem ação', async () => {
		for (const target of ['/admin/login', '/admin?/visibility', '/admin/logout']) {
			const {response, resolved} = await runAt(HTTP_ORIGIN, true, target, {method: 'POST'});
			expect(resolved, target).toBe(0);
			expect(response.status, target).toBe(404);
		}
	});

	it('por HTTP com a trava ligada, nem uma sessão válida abre o painel', async () => {
		const auth = createAdminAuth({env});
		const result = auth.login(env.password, 'ip');
		if (!result.ok) throw new Error('login deveria funcionar');
		const http = await runAt(HTTP_ORIGIN, true, '/admin', {cookie: result.token, auth});
		expect(http.resolved).toBe(0);
		expect(http.response.status).toBe(404);
		const https = await runAt(ORIGIN, true, '/admin', {cookie: result.token, auth});
		expect(https.resolved).toBe(1);
	});

	it('o site público não é afetado, em HTTP ou HTTPS', async () => {
		for (const origin of [HTTP_ORIGIN, ORIGIN]) {
			for (const target of ['/', '/en', '/healthz', '/en/admin']) {
				expect((await runAt(origin, true, target)).resolved, `${origin}${target}`).toBe(1);
			}
		}
	});

	it('com o admin desativado (sem senha) a trava também vale: 404 por HTTP, aviso por HTTPS', async () => {
		const disabled = createAdminAuth({env: {}});
		const http = await runAt(HTTP_ORIGIN, true, '/admin', {auth: disabled});
		expect(http.resolved).toBe(0);
		expect(http.response.status).toBe(404);
		expect((await runAt(ORIGIN, true, '/admin', {auth: disabled})).resolved).toBe(1);
	});

	it('sem opções o comportamento é o de sempre (trava desligada)', async () => {
		const handle = createAdminHandle(() => createAdminAuth({env}));
		const url = new URL('/admin/login', HTTP_ORIGIN);
		let resolved = 0;
		await handle({
			event: {
				url,
				locals: {},
				request: new Request(url),
				cookies: {get: () => undefined}
			} as never,
			resolve: async () => {
				resolved++;
				return new Response('ok');
			}
		});
		expect(resolved).toBe(1);
	});
});
