import {describe, expect, it} from 'vitest';
import {MIN_SECRET_LENGTH, createAdminAuth, resolveAuthConfig} from './admin-auth.ts';
import type {AdminAuth} from './admin-auth.ts';
import {InMemoryRevokedSessions} from './revoked-sessions.ts';
import {SESSION_TTL_MS} from './session.ts';

const env = {password: 'teste123', secret: 'a1b2c3d4e5f60718'.repeat(MIN_SECRET_LENGTH / 16)};

function setup(overrides: Partial<typeof env> = {}) {
	const clock = {now: 1_800_000_000_000};
	const auth = createAdminAuth({env: {...env, ...overrides}, now: () => clock.now});
	return {auth, clock};
}
function loggedIn(auth: AdminAuth): string {
	const result = auth.login('teste123', 'ip');
	if (!result.ok) throw new Error('login deveria funcionar');
	return result.token;
}

describe('configuração', () => {
	it('fica desativada sem senha e/ou sem segredo e diz o que falta', () => {
		expect(resolveAuthConfig({})).toEqual({
			enabled: false,
			problems: ['ADMIN_PASSWORD não foi definida.', 'SESSION_SECRET não foi definida.']
		});
		expect(resolveAuthConfig({password: 'x', secret: 's'.repeat(31)})).toMatchObject({
			enabled: false,
			problems: [expect.stringContaining('SESSION_SECRET')]
		});
		expect(resolveAuthConfig({password: '', secret: env.secret})).toMatchObject({enabled: false});
		expect(resolveAuthConfig(env).enabled).toBe(true);
	});

	it('quando desativado, nenhum login nem cookie vale', () => {
		const auth = createAdminAuth({env: {}});
		expect(auth.enabled).toBe(false);
		expect(auth.problems).toHaveLength(2);
		expect(auth.login('qualquer', 'ip').ok).toBe(false);
		expect(auth.isAuthenticated('qualquer.coisa')).toBe(false);
	});
});

describe('login', () => {
	it('aceita a senha correta e emite sessão de 7 dias', () => {
		const {auth} = setup();
		const result = auth.login('teste123', 'ip');
		expect(result).toMatchObject({ok: true, maxAgeSeconds: SESSION_TTL_MS / 1000});
		expect(auth.isAuthenticated((result as {token: string}).token)).toBe(true);
	});

	it('rejeita senha errada, vazia ou de tamanho diferente', () => {
		const {auth} = setup();
		for (const password of ['errada', '', 'teste1234', 'teste12']) {
			expect(auth.login(password, 'ip')).toEqual({ok: false, reason: 'invalid'});
		}
	});

	it('bloqueia o IP depois de 5 falhas, até com a senha certa, e libera após 10 minutos', () => {
		const {auth, clock} = setup();
		for (let i = 0; i < 5; i++) auth.login('errada', 'ip');
		expect(auth.login('teste123', 'ip')).toEqual({
			ok: false,
			reason: 'rate-limited',
			retryAfterSeconds: 600
		});
		expect(auth.login('teste123', 'outro-ip').ok).toBe(true);
		clock.now += 10 * 60_000;
		expect(auth.login('teste123', 'ip').ok).toBe(true);
	});

	it('um login bem-sucedido zera as falhas anteriores', () => {
		const {auth} = setup();
		for (let i = 0; i < 4; i++) auth.login('errada', 'ip');
		expect(auth.login('teste123', 'ip').ok).toBe(true);
		for (let i = 0; i < 4; i++) auth.login('errada', 'ip');
		expect(auth.login('teste123', 'ip').ok).toBe(true);
	});
});

describe('sessão', () => {
	it('expira com o tempo', () => {
		const {auth, clock} = setup();
		const token = loggedIn(auth);
		clock.now += SESSION_TTL_MS + 1;
		expect(auth.isAuthenticated(token)).toBe(false);
	});

	it('rejeita cookie adulterado', () => {
		const {auth} = setup();
		const token = loggedIn(auth);
		const [payload, signature] = token.split('.');
		const tampered = Buffer.from(
			JSON.stringify({...JSON.parse(Buffer.from(payload, 'base64url').toString()), exp: 9e15})
		).toString('base64url');
		expect(auth.isAuthenticated(`${tampered}.${signature}`)).toBe(false);
		expect(auth.isAuthenticated(undefined)).toBe(false);
	});

	it('não vale em outra instância com outro segredo ou outra senha', () => {
		const token = loggedIn(setup().auth);
		expect(setup({secret: '9f8e7d6c5b4a3921'.repeat(3)}).auth.isAuthenticated(token)).toBe(false);
		expect(setup({password: 'nova-senha'}).auth.isAuthenticated(token)).toBe(false);
		expect(setup().auth.isAuthenticated(token)).toBe(true);
	});
});

describe('configuração fraca', () => {
	it('recusa segredo sem entropia mesmo com 32+ caracteres', () => {
		for (const secret of ['a'.repeat(40), 'ab'.repeat(20), '12345678' + 'x'.repeat(30)]) {
			expect(resolveAuthConfig({password: 'senha-longa-e-unica', secret})).toMatchObject({
				enabled: false,
				problems: [expect.stringContaining('aleatório')]
			});
		}
		expect(resolveAuthConfig({password: 'x', secret: 'abcdef0123456789'.repeat(2)}).enabled).toBe(
			true
		);
	});

	it('senha curta funciona, mas gera aviso (sem repetir a senha)', () => {
		const strong = 'abcdef0123456789'.repeat(2);
		const weak = resolveAuthConfig({password: 'curta123', secret: strong});
		expect(weak).toMatchObject({
			enabled: true,
			warnings: [expect.stringContaining('ADMIN_PASSWORD')]
		});
		expect(JSON.stringify(weak.enabled && weak.warnings)).not.toContain('curta123');
		expect(resolveAuthConfig({password: 'uma senha bem longa', secret: strong})).toMatchObject({
			enabled: true,
			warnings: []
		});
	});
});

describe('logout e revogação', () => {
	it('o cookie copiado antes do logout deixa de valer depois dele', () => {
		const {auth} = setup();
		const token = loggedIn(auth);
		const other = loggedIn(auth);
		expect(auth.isAuthenticated(token)).toBe(true);
		auth.logout(token);
		expect(auth.isAuthenticated(token)).toBe(false);
		// Outra sessão não é afetada.
		expect(auth.isAuthenticated(other)).toBe(true);
	});

	it('logout com cookie inválido ou ausente não faz nada nem lança erro', () => {
		const {auth} = setup();
		const token = loggedIn(auth);
		for (const junk of [undefined, '', 'lixo', 'a.b'])
			expect(() => auth.logout(junk)).not.toThrow();
		expect(auth.isAuthenticated(token)).toBe(true);
	});

	it('a revogação vale até o cookie expirar sozinho e depois é esquecida', () => {
		const clock = {now: 1_800_000_000_000};
		const revoked = new InMemoryRevokedSessions(() => clock.now);
		const auth = createAdminAuth({env, now: () => clock.now, revoked});
		const token = loggedIn(auth);
		auth.logout(token);
		clock.now += SESSION_TTL_MS - 1;
		expect(auth.isAuthenticated(token)).toBe(false);
		clock.now += 2;
		expect(auth.isAuthenticated(token)).toBe(false); // expirou pelo prazo
		auth.logout(loggedIn(auth)); // a próxima revogação limpa a anterior
		expect(revoked.has('qualquer')).toBe(false);
	});

	it('se o armazenamento de revogação falhar, nega a sessão (falha fechada) e registra o erro', () => {
		const errors: string[] = [];
		const broken = {
			has: () => {
				throw new Error('disco cheio');
			},
			add: () => {
				throw new Error('disco cheio');
			}
		};
		const auth = createAdminAuth({
			env,
			revoked: broken,
			onError: (message) => errors.push(message)
		});
		const token = loggedIn(auth);
		expect(auth.isAuthenticated(token)).toBe(false);
		expect(() => auth.logout(token)).not.toThrow();
		expect(errors).toHaveLength(2);
	});
});

describe('limite global de tentativas', () => {
	it('com o teto atingido, quem já errou espera a janela, mesmo com menos de 5 erros', () => {
		const {auth, clock} = setup();
		for (let i = 0; i < 100; i++) auth.login('errada', `ip-${i}`);
		expect(auth.login('teste123', 'ip-0')).toMatchObject({ok: false, reason: 'rate-limited'});
		clock.now += 10 * 60_000;
		expect(auth.login('teste123', 'ip-0').ok).toBe(true);
	});

	it('um ataque não tranca o dono para fora: endereço sem erros entra com a senha certa', () => {
		const {auth} = setup();
		for (let i = 0; i < 150; i++) auth.login('errada', `ip-${i}`);
		expect(auth.login('teste123', 'ip-do-dono').ok).toBe(true);
	});

	it('com o teto atingido, um endereço novo do atacante ganha uma tentativa só', () => {
		const {auth} = setup();
		for (let i = 0; i < 100; i++) auth.login('errada', `ip-${i}`);
		expect(auth.login('errada', 'ip-novo')).toEqual({ok: false, reason: 'invalid'});
		expect(auth.login('errada', 'ip-novo')).toMatchObject({reason: 'rate-limited'});
		expect(auth.login('teste123', 'ip-novo')).toMatchObject({reason: 'rate-limited'});
	});
});
