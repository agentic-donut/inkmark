import {createHmac, randomBytes} from 'node:crypto';
import {safeEqualBytes} from './safe-equal.ts';

export const SESSION_COOKIE = 'inkmark_admin';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Tolerância para relógios levemente adiantados entre emissão e verificação. */
const CLOCK_SKEW_MS = 60_000;
/** Um cookie legítimo tem ~150 caracteres; o teto evita fazer HMAC de lixo gigante. */
const MAX_TOKEN_LENGTH = 512;
const SESSION_ID = /^[A-Za-z0-9_-]{16,64}$/;

export interface SessionPayload {
	/** Instante de emissão, em ms desde a época. */
	iat: number;
	/** Instante de expiração, em ms desde a época. */
	exp: number;
	/** Identificador aleatório da sessão; é o que o logout revoga no servidor. */
	sid: string;
}

function sign(encodedPayload: string, key: string): Buffer {
	return createHmac('sha256', key).update(encodedPayload).digest();
}

/** Formato do cookie: `<payload em base64url>.<assinatura HMAC-SHA256 em base64url>`. */
export function createSessionToken(key: string, nowMs: number, ttlMs = SESSION_TTL_MS): string {
	const payload: SessionPayload = {
		iat: nowMs,
		exp: nowMs + ttlMs,
		sid: randomBytes(18).toString('base64url')
	};
	const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
	return `${encoded}.${sign(encoded, key).toString('base64url')}`;
}

/** Confere assinatura, formato e validade. Não sabe de revogação: quem decide isso é o `AdminAuth`. */
export function parseSessionToken(
	token: string | undefined,
	key: string,
	nowMs: number
): SessionPayload | null {
	if (!token || token.length > MAX_TOKEN_LENGTH) return null;
	const parts = token.split('.');
	if (parts.length !== 2) return null;
	const [encoded, signature] = parts;
	// Compara o texto, não os bytes decodificados: o base64url ignora os bits finais do último caractere,
	// então várias grafias do mesmo cookie valeriam (inofensivo, mas cada cookie deve ter uma só forma).
	const expected = sign(encoded, key).toString('base64url');
	if (!safeEqualBytes(Buffer.from(signature), Buffer.from(expected))) return null;
	try {
		const payload = JSON.parse(
			Buffer.from(encoded, 'base64url').toString('utf8')
		) as SessionPayload;
		const valid =
			Number.isFinite(payload.iat) &&
			Number.isFinite(payload.exp) &&
			typeof payload.sid === 'string' &&
			SESSION_ID.test(payload.sid) &&
			payload.iat <= nowMs + CLOCK_SKEW_MS &&
			nowMs < payload.exp &&
			// Mesmo com a assinatura certa, uma validade maior que a política não é aceita.
			payload.exp - payload.iat <= SESSION_TTL_MS;
		return valid ? payload : null;
	} catch {
		return null;
	}
}

export function verifySessionToken(token: string | undefined, key: string, nowMs: number): boolean {
	return parseSessionToken(token, key, nowMs) !== null;
}
