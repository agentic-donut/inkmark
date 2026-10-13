import {createHmac} from 'node:crypto';
import {LoginRateLimiter} from './rate-limiter.ts';
import {InMemoryRevokedSessions} from './revoked-sessions.ts';
import type {RevokedSessions} from './revoked-sessions.ts';
import {safeEqual} from './safe-equal.ts';
import {SESSION_TTL_MS, createSessionToken, parseSessionToken} from './session.ts';

export const MIN_SECRET_LENGTH = 32;
/** Abaixo disto a senha ainda funciona, mas o servidor avisa no log (força bruta de 5 por IP a cada 10 min). */
export const RECOMMENDED_PASSWORD_LENGTH = 12;
/** Falhas somadas de todos os IPs que travam o login para todo mundo até a janela passar. */
const GLOBAL_MAX_FAILURES = 100;
const GLOBAL_KEY = '*';

export interface AuthEnv {
	password?: string;
	secret?: string;
}

export type AuthConfig =
	| {enabled: true; password: string; secret: string; warnings: string[]}
	| {enabled: false; problems: string[]};

/** Sem senha e sem segredo forte, o admin não abre: nunca existe um padrão inseguro. */
export function resolveAuthConfig(env: AuthEnv): AuthConfig {
	const problems: string[] = [];
	if (!env.password) problems.push('ADMIN_PASSWORD não foi definida.');
	if (!env.secret) problems.push('SESSION_SECRET não foi definida.');
	else if (env.secret.length < MIN_SECRET_LENGTH) {
		problems.push(`SESSION_SECRET precisa ter pelo menos ${MIN_SECRET_LENGTH} caracteres.`);
	} else if (new Set(env.secret).size < 10) {
		// "aaaa…" e afins passam no tamanho mas não têm entropia nenhuma.
		problems.push('SESSION_SECRET precisa ser aleatório (gere com: openssl rand -hex 32).');
	}
	if (problems.length > 0) return {enabled: false, problems};
	const warnings: string[] = [];
	if (env.password!.length < RECOMMENDED_PASSWORD_LENGTH) {
		warnings.push(
			`ADMIN_PASSWORD tem menos de ${RECOMMENDED_PASSWORD_LENGTH} caracteres; use uma senha longa e única.`
		);
	}
	return {enabled: true, password: env.password!, secret: env.secret!, warnings};
}

export type LoginResult =
	| {ok: true; token: string; maxAgeSeconds: number}
	| {ok: false; reason: 'invalid'}
	| {ok: false; reason: 'rate-limited'; retryAfterSeconds: number};

export interface AdminAuth {
	readonly enabled: boolean;
	/** Quando desativado: o que falta configurar. */
	readonly problems: readonly string[];
	/** Quando ativado: avisos de configuração fraca (não impedem o login). */
	readonly warnings: readonly string[];
	login(password: string, clientKey: string): LoginResult;
	isAuthenticated(token: string | undefined): boolean;
	/** Encerra a sessão do cookie no servidor: o mesmo cookie, copiado antes, deixa de valer. */
	logout(token: string | undefined): void;
}

export interface AdminAuthOptions {
	env: AuthEnv;
	/** Relógio em ms; injetado nos testes. */
	now?: () => number;
	maxFailures?: number;
	windowMs?: number;
	/** Onde ficam as sessões encerradas; o padrão é em memória. */
	revoked?: RevokedSessions;
	/** Erros inesperados do armazenamento de revogação (a sessão é negada nesse caso). */
	onError?: (message: string, error: unknown) => void;
}

export function createAdminAuth(options: AdminAuthOptions): AdminAuth {
	const config = resolveAuthConfig(options.env);
	const now = options.now ?? Date.now;
	if (!config.enabled) {
		return {
			enabled: false,
			problems: config.problems,
			warnings: [],
			login: () => ({ok: false, reason: 'invalid'}),
			isAuthenticated: () => false,
			logout: () => {}
		};
	}
	const limiter = new LoginRateLimiter({
		maxFailures: options.maxFailures ?? 5,
		windowMs: options.windowMs ?? 10 * 60 * 1000,
		now
	});
	// Teto somado de todos os IPs, contra quem troca de endereço a cada tentativa (botnet, proxy aberto).
	// Ele só barra quem já errou nesta janela: assim um ataque não tranca o dono para fora, que entra
	// de um endereço sem erros, e quem troca de IP ganha no máximo uma tentativa por endereço novo.
	const globalLimiter = new LoginRateLimiter({
		maxFailures: GLOBAL_MAX_FAILURES,
		windowMs: options.windowMs ?? 10 * 60 * 1000,
		now,
		maxKeys: 1
	});
	const revoked = options.revoked ?? new InMemoryRevokedSessions(now);
	const onError = options.onError ?? ((message, error) => console.error(message, error));
	// A senha entra na chave: trocar ADMIN_PASSWORD derruba todas as sessões abertas.
	const signingKey = createHmac('sha256', config.secret).update(config.password).digest('hex');

	return {
		enabled: true,
		problems: [],
		warnings: config.warnings,
		login(password, clientKey) {
			const global = globalLimiter.check(GLOBAL_KEY);
			const blocked = [
				limiter.check(clientKey),
				limiter.failures(clientKey) > 0 ? global : ({allowed: true} as const)
			].find((state) => !state.allowed);
			if (blocked && !blocked.allowed) {
				return {
					ok: false,
					reason: 'rate-limited',
					retryAfterSeconds: Math.max(1, Math.ceil(blocked.retryAfterMs / 1000))
				};
			}
			if (!safeEqual(password, config.password)) {
				limiter.recordFailure(clientKey);
				globalLimiter.recordFailure(GLOBAL_KEY);
				return {ok: false, reason: 'invalid'};
			}
			limiter.reset(clientKey);
			return {
				ok: true,
				token: createSessionToken(signingKey, now()),
				maxAgeSeconds: SESSION_TTL_MS / 1000
			};
		},
		isAuthenticated(token) {
			const session = parseSessionToken(token, signingKey, now());
			if (!session) return false;
			try {
				return !revoked.has(session.sid);
			} catch (error) {
				// Sem saber se a sessão foi encerrada, a resposta segura é negar.
				onError('Não foi possível consultar as sessões encerradas.', error);
				return false;
			}
		},
		logout(token) {
			const session = parseSessionToken(token, signingKey, now());
			if (!session) return;
			try {
				revoked.add(session.sid, session.exp);
			} catch (error) {
				onError('Não foi possível registrar o encerramento da sessão.', error);
			}
		}
	};
}
