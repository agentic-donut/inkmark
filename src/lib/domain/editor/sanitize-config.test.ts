import {describe, expect, test} from 'vitest';
import {DEFAULT_CONFIG, LIMITS} from './defaults';
import {sanitizeConfig, type SanitizeContext} from './sanitize-config';

const ctx: SanitizeContext = {
	templateIds: ['gothic', 'brush'],
	fontIds: ['PirataOne', 'Oswald']
};

describe('sanitizeConfig', () => {
	test('entrada vazia ou inválida devolve o padrão', () => {
		for (const raw of [undefined, null, 'x', 42, [], {}]) {
			expect(sanitizeConfig(raw, ctx)).toEqual(DEFAULT_CONFIG);
		}
	});

	test('mescla valores válidos por cima do padrão', () => {
		const result = sanitizeConfig(
			{name: 'Acme', template: 'brush', font: 'Oswald', ornament: 'diamond', wear: 3},
			ctx
		);
		expect(result).toEqual({
			...DEFAULT_CONFIG,
			name: 'Acme',
			template: 'brush',
			font: 'Oswald',
			ornament: 'diamond',
			wear: 3
		});
	});

	test('limita números aos intervalos', () => {
		const high = sanitizeConfig({size: 999, spacing: 99, tilt: 99}, ctx);
		expect([high.size, high.spacing, high.tilt]).toEqual([
			LIMITS.size.max,
			LIMITS.spacing.max,
			LIMITS.tilt.max
		]);
		const low = sanitizeConfig({size: -5, spacing: -9, tilt: -99}, ctx);
		expect([low.size, low.spacing, low.tilt]).toEqual([
			LIMITS.size.min,
			LIMITS.spacing.min,
			LIMITS.tilt.min
		]);
	});

	test('números inválidos voltam ao padrão', () => {
		const result = sanitizeConfig({size: '120', spacing: NaN, tilt: Infinity}, ctx);
		expect(result.size).toBe(DEFAULT_CONFIG.size);
		expect(result.spacing).toBe(DEFAULT_CONFIG.spacing);
		expect(result.tilt).toBe(DEFAULT_CONFIG.tilt);
	});

	test('modelo desconhecido volta ao modelo e à fonte padrão', () => {
		const result = sanitizeConfig({template: 'nope', font: 'Oswald'}, ctx);
		expect(result.template).toBe(DEFAULT_CONFIG.template);
		expect(result.font).toBe(DEFAULT_CONFIG.font);
	});

	test('fonte desconhecida volta à fonte padrão sem mexer no modelo', () => {
		const result = sanitizeConfig({template: 'brush', font: 'Comic'}, ctx);
		expect(result.template).toBe('brush');
		expect(result.font).toBe(DEFAULT_CONFIG.font);
	});

	test('a fonte custom só vale quando está disponível', () => {
		const raw = {template: 'brush', font: 'custom'};
		expect(sanitizeConfig(raw, ctx).font).toBe(DEFAULT_CONFIG.font);
		expect(sanitizeConfig(raw, {...ctx, customFontAvailable: true}).font).toBe('custom');
	});

	test('ornamento e desgaste inválidos voltam ao padrão', () => {
		const result = sanitizeConfig({ornament: 'sparkles', wear: 7}, ctx);
		expect(result.ornament).toBe(DEFAULT_CONFIG.ornament);
		expect(result.wear).toBe(DEFAULT_CONFIG.wear);
		expect(sanitizeConfig({wear: 0}, ctx).wear).toBe(0);
		expect(sanitizeConfig({ornament: 'none'}, ctx).ornament).toBe('none');
	});

	test('cada efeito é validado, e o que falta ou é inválido vale 0', () => {
		for (const key of ['halftone', 'pressure', 'bleed'] as const) {
			expect(sanitizeConfig({}, ctx)[key]).toBe(0);
			expect(DEFAULT_CONFIG[key]).toBe(0);
			for (const level of [0, 1, 2, 3])
				expect(sanitizeConfig({[key]: level}, ctx)[key]).toBe(level);
			for (const level of [4, -1, 1.5, '2', null, [1], {}, NaN, 'strong']) {
				expect(sanitizeConfig({[key]: level}, ctx)[key]).toBe(0);
			}
		}
	});

	test('os efeitos são independentes e combináveis', () => {
		const result = sanitizeConfig({wear: 2, halftone: 1, pressure: 2, bleed: 3}, ctx);
		expect(result).toMatchObject({wear: 2, halftone: 1, pressure: 2, bleed: 3});
	});

	test('configuração salva antes dos efeitos carrega com o padrão', () => {
		expect(sanitizeConfig({...DEFAULT_CONFIG, name: 'Antiga', wear: 2}, ctx)).toEqual({
			...DEFAULT_CONFIG,
			name: 'Antiga',
			wear: 2
		});
	});

	describe('migração do acabamento único antigo (finish)', () => {
		const migrated = (finish: unknown, extra: object = {}) => {
			const {halftone, pressure, bleed} = sanitizeConfig({finish, ...extra}, ctx);
			return {halftone, pressure, bleed};
		};
		const off = {halftone: 0, pressure: 0, bleed: 0};

		test.each([
			['halftone', {...off, halftone: 3}],
			['pressure', {...off, pressure: 3}],
			['bleed-light', {...off, bleed: 1}],
			['bleed-medium', {...off, bleed: 2}],
			['bleed-strong', {...off, bleed: 3}],
			['none', off]
		])('%s', (finish, expected) => {
			expect(migrated(finish)).toEqual(expected);
		});

		test('valores desconhecidos não ligam nada', () => {
			for (const finish of [
				'sparkles',
				'',
				3,
				null,
				['halftone'],
				{},
				'HALFTONE',
				'__proto__',
				'constructor'
			]) {
				expect(migrated(finish)).toEqual(off);
			}
		});

		test('o efeito novo, quando existe, vale mais que o acabamento antigo', () => {
			expect(migrated('pressure', {pressure: 1})).toEqual({...off, pressure: 1});
			expect(migrated('pressure', {pressure: 0})).toEqual(off);
			expect(migrated('halftone', {bleed: 2})).toEqual({...off, halftone: 3, bleed: 2});
		});

		test('o resultado não guarda mais o campo finish', () => {
			expect(sanitizeConfig({finish: 'pressure'}, ctx)).not.toHaveProperty('finish');
		});
	});

	test('trunca textos e aceita nome vazio', () => {
		const result = sanitizeConfig(
			{name: 'a'.repeat(100), tagline: 'b'.repeat(100), topline: 'c'.repeat(100)},
			ctx
		);
		expect(result.name).toHaveLength(LIMITS.nameLength);
		expect(result.tagline).toHaveLength(LIMITS.taglineLength);
		expect(result.topline).toHaveLength(LIMITS.toplineLength);
		expect(sanitizeConfig({name: ''}, ctx).name).toBe('');
		expect(sanitizeConfig({name: 5}, ctx).name).toBe(DEFAULT_CONFIG.name);
	});

	test('não altera a entrada e ignora chaves desconhecidas', () => {
		const raw = Object.freeze({name: 'X', extra: true});
		expect(sanitizeConfig(raw, ctx)).not.toHaveProperty('extra');
	});
});
