import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createAdminAuth} from '#lib/server/auth/admin-auth.ts';
import type {AdminAuth} from '#lib/server/auth/admin-auth.ts';

// Produção: o cookie é `secure` quando o pedido chega por HTTPS. O banco e as variáveis reais nunca entram nestes testes.
vi.mock('$app/env', () => ({dev: false}));

let auth: AdminAuth;
vi.mock('#lib/server/auth/index.ts', async () => {
	const real = await import('#lib/server/auth/session.ts');
	const next = await import('#lib/server/auth/safe-next.ts');
	const limiter = await import('#lib/server/auth/rate-limiter.ts');
	const cookie = await import('#lib/server/auth/cookie.ts');
	return {
		SESSION_COOKIE: real.SESSION_COOKIE,
		sessionCookieOptions: cookie.sessionCookieOptions,
		safeNextPath: next.safeNextPath,
		normalizeClientKey: limiter.normalizeClientKey,
		getAdminAuth: () => auth
	};
});

const {actions: loginActions, load: loginLoad} = await import('./login/+page.server.ts');
const {actions: logoutActions, load: logoutLoad} = await import('./logout/+page.server.ts');

const PASSWORD = 'senha-de-teste-longa';

function fakeCookies(initial: Record<string, string> = {}) {
	const jar = new Map(Object.entries(initial));
	const sets: {name: string; value: string; options: Record<string, unknown>}[] = [];
	const deletes: {name: string; options: Record<string, unknown>}[] = [];
	return {
		get: (name: string) => jar.get(name),
		set: (name: string, value: string, options: Record<string, unknown>) => {
			jar.set(name, value);
			sets.push({name, value, options});
		},
		delete: (name: string, options: Record<string, unknown>) => {
			jar.delete(name);
			deletes.push({name, options});
		},
		sets,
		deletes
	};
}

function loginEvent(
	fields: Record<string, string>,
	cookies = fakeCookies(),
	address = '203.0.113.9',
	origin = 'https://inkmark.test'
) {
	const body = new FormData();
	for (const [key, value] of Object.entries(fields)) body.set(key, value);
	return {
		request: new Request(`${origin}/admin/login`, {method: 'POST', body}),
		url: new URL(`${origin}/admin/login`),
		cookies,
		getClientAddress: () => address
	};
}

async function redirectOf(run: () => unknown): Promise<{status: number; location: string}> {
	try {
		await run();
	} catch (thrown) {
		return thrown as {status: number; location: string};
	}
	throw new Error('deveria ter redirecionado');
}

beforeEach(() => {
	auth = createAdminAuth({env: {password: PASSWORD, secret: 'a1b2c3d4e5f60718'.repeat(2)}});
});

describe('login', () => {
	it('grava o cookie de sessão com todas as proteções', async () => {
		const cookies = fakeCookies();
		const redirect = await redirectOf(() =>
			loginActions.default(loginEvent({password: PASSWORD, next: '/admin'}, cookies) as never)
		);
		expect(redirect).toMatchObject({status: 303, location: '/admin'});
		expect(cookies.sets).toHaveLength(1);
		const [cookie] = cookies.sets;
		expect(cookie.name).toBe('inkmark_admin');
		expect(cookie.options).toMatchObject({
			path: '/admin',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: 7 * 24 * 60 * 60
		});
		expect(auth.isAuthenticated(cookie.value)).toBe(true);
	});

	it('por HTTP (servidor da rede local) o cookie não é secure, senão o navegador não o guardaria', async () => {
		const cookies = fakeCookies();
		await redirectOf(() =>
			loginActions.default(
				loginEvent({password: PASSWORD}, cookies, '192.168.0.9', 'http://inkmark.home') as never
			)
		);
		expect(cookies.sets[0].options).toMatchObject({
			secure: false,
			httpOnly: true,
			sameSite: 'strict'
		});
	});

	it('cada login emite um cookie novo (não reaproveita o que o navegador mandou)', async () => {
		const tokens = new Set<string>();
		for (let i = 0; i < 3; i++) {
			const cookies = fakeCookies({inkmark_admin: 'fixado-pelo-atacante'});
			await redirectOf(() =>
				loginActions.default(loginEvent({password: PASSWORD}, cookies) as never)
			);
			expect(cookies.sets[0].value).not.toBe('fixado-pelo-atacante');
			tokens.add(cookies.sets[0].value);
		}
		expect(tokens.size).toBe(3);
	});

	it('senha errada não grava cookie e responde 401 sem dizer a senha', async () => {
		const cookies = fakeCookies();
		const result = await loginActions.default(loginEvent({password: 'errada'}, cookies) as never);
		expect(result).toMatchObject({status: 401});
		expect(cookies.sets).toHaveLength(0);
		expect(JSON.stringify(result)).not.toContain(PASSWORD);
	});

	it('senha ausente ou não textual (arquivo) é recusada com 400', async () => {
		const body = new FormData();
		body.set('password', new File(['x'], 'senha.txt'));
		const event = {
			request: new Request('https://inkmark.test/admin/login', {method: 'POST', body}),
			cookies: fakeCookies(),
			getClientAddress: () => '203.0.113.9'
		};
		expect(await loginActions.default(event as never)).toMatchObject({status: 400});
		expect(await loginActions.default(loginEvent({}) as never)).toMatchObject({status: 400});
		expect(await loginActions.default(loginEvent({password: ''}) as never)).toMatchObject({
			status: 400
		});
	});

	it('depois de 5 erros responde 429, até com a senha certa, e IPv6 do mesmo /64 divide a cota', async () => {
		for (let i = 0; i < 5; i++) {
			await loginActions.default(
				loginEvent({password: 'errada'}, undefined, `2001:db8:1:2::${i + 1}`) as never
			);
		}
		const cookies = fakeCookies();
		const result = await loginActions.default(
			loginEvent({password: PASSWORD}, cookies, '2001:db8:1:2:ffff::9') as never
		);
		expect(result).toMatchObject({status: 429});
		expect(cookies.sets).toHaveLength(0);
	});

	it('sem endereço do cliente todos dividem a mesma cota (mais rígido, nunca mais frouxo)', async () => {
		const withoutAddress = () => {
			const event = loginEvent({password: 'errada'});
			event.getClientAddress = () => {
				throw new Error('sem endereço');
			};
			return event as never;
		};
		for (let i = 0; i < 5; i++) await loginActions.default(withoutAddress());
		expect(await loginActions.default(withoutAddress())).toMatchObject({status: 429});
	});

	it('o destino pós-login só pode ser dentro do /admin (sem open redirect)', async () => {
		const hostile = [
			'//evil.example',
			'https://evil.example/admin',
			'/\\evil.example',
			'/admin@evil.example',
			'/admin\\..\\evil',
			'//admin',
			'javascript:alert(1)',
			'/admin/login',
			'/admin/logout',
			'/administrador',
			'/admin\r\nSet-Cookie: x=1'
		];
		for (const next of hostile) {
			auth = createAdminAuth({env: {password: PASSWORD, secret: 'a1b2c3d4e5f60718'.repeat(2)}});
			const redirect = await redirectOf(() =>
				loginActions.default(loginEvent({password: PASSWORD, next}) as never)
			);
			expect(redirect.location, next).toBe('/admin');
		}
		const ok = await redirectOf(() =>
			loginActions.default(loginEvent({password: PASSWORD, next: '/admin?x=1'}) as never)
		);
		expect(ok.location).toBe('/admin?x=1');
	});

	it('quem já tem sessão e abre o login é mandado para um destino seguro', async () => {
		const locals = {admin: {enabled: true, authenticated: true}};
		for (const [next, expected] of [
			['/admin?pagina=2', '/admin?pagina=2'],
			['//evil.example', '/admin'],
			['https://evil.example', '/admin']
		]) {
			const redirect = await redirectOf(() =>
				loginLoad({
					locals,
					url: new URL(`https://inkmark.test/admin/login?next=${encodeURIComponent(next)}`)
				} as never)
			);
			expect(redirect.location).toBe(expected);
		}
	});
});

describe('logout', () => {
	function loginToken(): string {
		const result = auth.login(PASSWORD, 'ip');
		if (!result.ok) throw new Error('login deveria funcionar');
		return result.token;
	}

	it('só existe por POST: abrir a rota (GET) apenas redireciona e não encerra nada', async () => {
		const redirect = await redirectOf(() => logoutLoad({} as never));
		expect(redirect).toMatchObject({status: 303, location: '/admin'});
		expect(Object.keys(logoutActions)).toEqual(['default']);
	});

	it('apaga o cookie e encerra a sessão no servidor: o cookie copiado antes não vale mais', async () => {
		const token = loginToken();
		const cookies = fakeCookies({inkmark_admin: token});
		expect(auth.isAuthenticated(token)).toBe(true);
		const redirect = await redirectOf(() =>
			logoutActions.default({cookies, url: new URL('https://inkmark.test/admin/logout')} as never)
		);
		expect(redirect).toMatchObject({status: 303, location: '/admin/login'});
		expect(cookies.deletes[0]).toMatchObject({
			name: 'inkmark_admin',
			options: {path: '/admin', httpOnly: true, sameSite: 'strict', secure: true}
		});
		expect(auth.isAuthenticated(token)).toBe(false);
	});
});
