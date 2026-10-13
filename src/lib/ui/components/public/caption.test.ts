import {describe, expect, test} from 'vitest';
import type {EffectSettings} from '#lib/domain/logo/index.ts';
import {captionText} from './caption';

const OFF: EffectSettings = {halftone: 0, bleed: 0, pressure: 0, wear: 0};
const fx = (settings: Partial<EffectSettings>): EffectSettings => ({...OFF, ...settings});

describe('captionText', () => {
	test('descreve marca, composição e desgaste', () => {
		expect(captionText('Wild Coast', 'Arched seal', fx({wear: 1}))).toBe(
			'Na foto: a marca Wild Coast em composição Arched seal, com desgaste leve.'
		);
	});

	test('sem nenhum efeito mantém a frase "sem desgaste"', () => {
		expect(captionText('X', 'Y', OFF)).toBe('Na foto: a marca X em composição Y, sem desgaste.');
	});

	test('sem nome fala da sua marca', () => {
		expect(captionText('   ', 'Y', fx({wear: 2}))).toBe(
			'Na foto: a sua marca em composição Y, com desgaste médio.'
		);
	});

	test('lista todos os efeitos ativos, em ordem, com "e" antes do último', () => {
		expect(captionText('X', 'Y', fx({wear: 1, halftone: 2, pressure: 3}))).toBe(
			'Na foto: a marca X em composição Y, com desgaste leve, retícula média e pressão desigual forte.'
		);
		expect(captionText('X', 'Y', {wear: 3, halftone: 1, pressure: 2, bleed: 1})).toBe(
			'Na foto: a marca X em composição Y, com desgaste forte, retícula leve, pressão desigual média e tinta espalhada leve.'
		);
	});

	test('efeito sozinho, sem desgaste', () => {
		expect(captionText('', 'Y', fx({pressure: 3}))).toBe(
			'Na foto: a sua marca em composição Y, com pressão desigual forte.'
		);
		expect(captionText('', 'Y', fx({halftone: 1, bleed: 2}))).toBe(
			'Na foto: a sua marca em composição Y, com retícula leve e tinta espalhada média.'
		);
	});

	test('cada nível de cada efeito tem a sua frase', () => {
		for (const key of ['wear', 'halftone', 'pressure', 'bleed'] as const) {
			const phrases = ([1, 2, 3] as const).map((level) =>
				captionText('X', 'Y', fx({[key]: level}))
			);
			expect(new Set(phrases).size, key).toBe(3);
		}
	});

	test('em inglês, com vírgula antes do "and" final', () => {
		expect(captionText('Wild Coast', 'Arched seal', fx({wear: 1}), 'en')).toBe(
			'Pictured: the Wild Coast brand in the Arched seal composition, with light wear.'
		);
		expect(captionText('', 'Y', OFF, 'en')).toBe(
			'Pictured: your brand in the Y composition, with no wear.'
		);
		expect(captionText('', 'Y', {wear: 1, halftone: 2, pressure: 3, bleed: 0}, 'en')).toBe(
			'Pictured: your brand in the Y composition, with light wear, medium halftone, and strong uneven pressure.'
		);
		expect(captionText('', 'Y', fx({halftone: 1, bleed: 3}), 'en')).toBe(
			'Pictured: your brand in the Y composition, with light halftone and strong ink spread.'
		);
	});

	test('em espanhol, com "y" final', () => {
		expect(captionText('Wild Coast', 'Arched seal', fx({wear: 3}), 'es')).toBe(
			'En la foto: la marca Wild Coast en composición Arched seal, con desgaste fuerte.'
		);
		expect(captionText('X', 'Y', OFF, 'es')).toBe(
			'En la foto: la marca X en composición Y, sin desgaste.'
		);
		expect(captionText('X', 'Y', {wear: 1, halftone: 2, pressure: 3, bleed: 2}, 'es')).toBe(
			'En la foto: la marca X en composición Y, con desgaste leve, trama media, presión desigual fuerte y tinta expandida media.'
		);
	});
});
