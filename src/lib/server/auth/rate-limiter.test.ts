import {describe, expect, it} from 'vitest';
import {LoginRateLimiter, normalizeClientKey} from './rate-limiter.ts';

function setup(maxKeys?: number) {
	const clock = {now: 0};
	const limiter = new LoginRateLimiter({
		maxFailures: 3,
		windowMs: 10 * 60_000,
		now: () => clock.now,
		maxKeys
	});
	return {clock, limiter};
}

describe('LoginRateLimiter', () => {
	it('bloqueia depois do limite de falhas e informa quanto falta', () => {
		const {clock, limiter} = setup();
		for (let i = 0; i < 3; i++) {
			expect(limiter.check('ip').allowed).toBe(true);
			limiter.recordFailure('ip');
		}
		clock.now = 60_000;
		expect(limiter.check('ip')).toEqual({allowed: false, retryAfterMs: 9 * 60_000});
	});

	it('libera quando a janela termina', () => {
		const {clock, limiter} = setup();
		for (let i = 0; i < 3; i++) limiter.recordFailure('ip');
		clock.now = 10 * 60_000;
		expect(limiter.check('ip').allowed).toBe(true);
	});

	it('conta por chave', () => {
		const {limiter} = setup();
		for (let i = 0; i < 3; i++) limiter.recordFailure('a');
		expect(limiter.check('a').allowed).toBe(false);
		expect(limiter.check('b').allowed).toBe(true);
	});

	it('reset zera as falhas', () => {
		const {limiter} = setup();
		for (let i = 0; i < 3; i++) limiter.recordFailure('ip');
		limiter.reset('ip');
		expect(limiter.check('ip').allowed).toBe(true);
	});

	it('não cresce além do teto de chaves', () => {
		const {limiter} = setup(2);
		for (const key of ['a', 'b', 'c']) for (let i = 0; i < 3; i++) limiter.recordFailure(key);
		// 'a' foi descartada para caber 'c'.
		expect(limiter.check('a').allowed).toBe(true);
		expect(limiter.check('c').allowed).toBe(false);
	});
});

describe('normalizeClientKey', () => {
	it('IPv4 fica como está (minúsculo, sem espaços)', () => {
		expect(normalizeClientKey(' 203.0.113.7 ')).toBe('203.0.113.7');
		expect(normalizeClientKey('')).toBe('unknown');
	});

	it('IPv6 do mesmo /64 vira a mesma chave; outro /64 vira outra', () => {
		const a = normalizeClientKey('2001:db8:1:2::1');
		expect(a).toBe('2001:db8:1:2::/64');
		expect(normalizeClientKey('2001:0DB8:0001:0002:ffff:ffff:ffff:ffff')).toBe(a);
		expect(normalizeClientKey('2001:db8:1:2:aaaa:bbbb:cccc:dddd')).toBe(a);
		expect(normalizeClientKey('2001:db8:1:3::1')).not.toBe(a);
	});

	it('IPv4 mapeado em IPv6 vale como o IPv4, com e sem notação mista', () => {
		expect(normalizeClientKey('::ffff:203.0.113.7')).toBe('203.0.113.7');
		expect(normalizeClientKey('::ffff:cb00:7107')).toBe('203.0.113.7');
	});

	it('trata zona, loopback e lixo sem lançar erro', () => {
		expect(normalizeClientKey('fe80::1%en0')).toBe('fe80:0:0:0::/64');
		expect(normalizeClientKey('::1')).toBe('0:0:0:0::/64');
		expect(normalizeClientKey('::1::2')).toBe('::1::2');
		expect(normalizeClientKey('zz:zz')).toBe('zz:zz');
		expect(normalizeClientKey('1:2:3:4:5:6:7:8:9')).toBe('1:2:3:4:5:6:7:8:9');
	});
});
