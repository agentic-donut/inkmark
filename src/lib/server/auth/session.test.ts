import {describe, expect, it} from 'vitest';
import {
	SESSION_TTL_MS,
	createSessionToken,
	parseSessionToken,
	verifySessionToken
} from './session.ts';
import {createHmac} from 'node:crypto';

const key = 'k'.repeat(64);
const now = 1_800_000_000_000;

describe('sessão assinada', () => {
	it('aceita um token recém-emitido', () => {
		expect(verifySessionToken(createSessionToken(key, now), key, now + 1000)).toBe(true);
	});

	it('expira em 7 dias', () => {
		const token = createSessionToken(key, now);
		expect(verifySessionToken(token, key, now + SESSION_TTL_MS - 1)).toBe(true);
		expect(verifySessionToken(token, key, now + SESSION_TTL_MS)).toBe(false);
	});

	it('rejeita token com chave diferente', () => {
		expect(verifySessionToken(createSessionToken(key, now), 'outra-chave', now)).toBe(false);
	});

	it('rejeita payload adulterado, mesmo com a assinatura original', () => {
		const [, signature] = createSessionToken(key, now).split('.');
		const forged = Buffer.from(JSON.stringify({iat: now, exp: now + 10 * SESSION_TTL_MS})).toString(
			'base64url'
		);
		expect(verifySessionToken(`${forged}.${signature}`, key, now)).toBe(false);
	});

	it('rejeita assinatura adulterada, truncada ou vazia', () => {
		const [payload, signature] = createSessionToken(key, now).split('.');
		const flipped = (signature[0] === 'A' ? 'B' : 'A') + signature.slice(1);
		expect(verifySessionToken(`${payload}.${flipped}`, key, now)).toBe(false);
		expect(verifySessionToken(`${payload}.${signature.slice(0, 10)}`, key, now)).toBe(false);
		expect(verifySessionToken(`${payload}.`, key, now)).toBe(false);
	});

	it('rejeita lixo e valores ausentes sem lançar erro', () => {
		for (const token of [undefined, '', 'abc', 'a.b.c', '.', '%%%.%%%']) {
			expect(verifySessionToken(token, key, now)).toBe(false);
		}
	});

	it('rejeita token emitido no futuro distante', () => {
		expect(verifySessionToken(createSessionToken(key, now + 3_600_000), key, now)).toBe(false);
	});
});

function signed(payload: unknown, signingKey = key): string {
	const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
	return `${encoded}.${createHmac('sha256', signingKey).update(encoded).digest('base64url')}`;
}

describe('identificador e política da sessão', () => {
	it('cada token tem um sid aleatório e diferente', () => {
		const first = parseSessionToken(createSessionToken(key, now), key, now);
		const second = parseSessionToken(createSessionToken(key, now), key, now);
		expect(first?.sid).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
		expect(first?.sid).not.toBe(second?.sid);
	});

	it('recusa token assinado sem sid ou com sid fora do formato (cookies da versão antiga)', () => {
		const valid = {iat: now, exp: now + SESSION_TTL_MS};
		for (const sid of [
			undefined,
			'',
			'curto',
			7,
			null,
			'a'.repeat(65),
			'com espaço e símbolos!!'
		]) {
			expect(verifySessionToken(signed({...valid, sid}), key, now)).toBe(false);
		}
		expect(verifySessionToken(signed({...valid, sid: 'a'.repeat(24)}), key, now)).toBe(true);
	});

	it('recusa validade maior que a política mesmo com a assinatura certa', () => {
		const sid = 'a'.repeat(24);
		expect(verifySessionToken(signed({iat: now, exp: now + SESSION_TTL_MS, sid}), key, now)).toBe(
			true
		);
		expect(
			verifySessionToken(signed({iat: now, exp: now + SESSION_TTL_MS + 1, sid}), key, now)
		).toBe(false);
	});

	it('recusa payload que não é objeto, timestamps não numéricos e token gigante', () => {
		for (const payload of [null, 1, 'x', [], {iat: '1', exp: '2', sid: 'a'.repeat(24)}]) {
			expect(verifySessionToken(signed(payload), key, now)).toBe(false);
		}
		expect(verifySessionToken('a'.repeat(100_000), key, now)).toBe(false);
		expect(verifySessionToken(`${'a'.repeat(600)}.${'b'.repeat(43)}`, key, now)).toBe(false);
	});

	it('tolera até um minuto de relógio adiantado na emissão, não mais', () => {
		expect(verifySessionToken(createSessionToken(key, now + 59_000), key, now)).toBe(true);
		expect(verifySessionToken(createSessionToken(key, now + 61_000), key, now)).toBe(false);
	});

	it('o cookie tem uma única forma válida (bits finais do base64url não são maleáveis)', () => {
		const [payload, signature] = createSessionToken(key, now).split('.');
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
		const last = alphabet.indexOf(signature.at(-1)!);
		const sibling = alphabet[(last ^ 1) % 64];
		expect(sibling).not.toBe(signature.at(-1));
		expect(verifySessionToken(`${payload}.${signature.slice(0, -1)}${sibling}`, key, now)).toBe(
			false
		);
	});
});
