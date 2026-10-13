import {resolve} from 'node:path';
import {serverEnv} from '../env.ts';
import {createAdminAuth} from './admin-auth.ts';
import type {AdminAuth} from './admin-auth.ts';
import {SqliteRevokedSessions, revokedSessionsPath} from './revoked-sessions.ts';

export {createAdminAuth, resolveAuthConfig} from './admin-auth.ts';
export type {AdminAuth, LoginResult} from './admin-auth.ts';
export {SESSION_COOKIE, SESSION_TTL_MS} from './session.ts';
export {safeNextPath} from './safe-next.ts';
export {sessionCookieOptions} from './cookie.ts';
export {normalizeClientKey} from './rate-limiter.ts';

let auth: AdminAuth | undefined;

/** Instância única: o limitador de tentativas guarda estado em memória. */
export function getAdminAuth(): AdminAuth {
	if (auth) return auth;
	const env = serverEnv();
	auth = createAdminAuth({
		env: {password: env.adminPassword, secret: env.sessionSecret},
		revoked: new SqliteRevokedSessions(resolve(revokedSessionsPath(env.databasePath)))
	});
	// Só o texto do aviso vai para o log; nunca o valor da senha nem do segredo.
	for (const warning of auth.warnings) console.warn(`[admin] ${warning}`);
	return auth;
}
