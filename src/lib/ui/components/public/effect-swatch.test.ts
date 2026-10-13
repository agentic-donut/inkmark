import {describe, expect, test} from 'vitest';
import {EFFECT_LEVELS} from '#lib/domain/logo/index.ts';
import {effectSwatch} from './effect-swatch';

const EFFECTS = ['wear', 'halftone', 'pressure', 'bleed'] as const;
const idsOf = (svg: string) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);

describe('effectSwatch', () => {
	test.each(EFFECTS)('%s: nível 0 é a peça lisa, sem filtro nem máscara', (effect) => {
		expect(effectSwatch(effect, 0)).not.toMatch(/filter|mask/);
	});

	test.each(EFFECTS)('%s: cada nível muda a amostra e mantém o desenho', (effect) => {
		const all = EFFECT_LEVELS.map((level) => effectSwatch(effect, level));
		expect(new Set(all).size).toBe(4);
		for (const svg of all) {
			expect(svg.startsWith('<svg')).toBe(true);
			expect(svg.endsWith('</svg>')).toBe(true);
			expect(svg).toMatch(/<rect|<circle/);
		}
	});

	test('o desgaste aponta para o filtro do próprio nível, o mesmo das logos', () => {
		for (const level of [1, 2, 3] as const) {
			const svg = effectSwatch('wear', level);
			expect(svg).toContain(`id="ink-wear-${level}-7"`);
			expect(svg).toContain(`filter="url(#ink-wear-${level}-7)"`);
		}
	});

	test('as 16 amostras convivem na mesma página sem repetir ids próprios', () => {
		const ids = EFFECTS.flatMap((effect) =>
			EFFECT_LEVELS.flatMap((level) => idsOf(effectSwatch(effect, level)))
		).filter((id) => !id.startsWith('ink-wear-'));
		expect(new Set(ids).size).toBe(ids.length);
	});

	test('amostras do mesmo efeito mostram só aquele efeito', () => {
		expect(effectSwatch('halftone', 2)).not.toMatch(/bleed|pr-firm|ink-wear/);
		expect(effectSwatch('bleed', 2)).not.toMatch(/ht-mask|pr-firm|ink-wear/);
		expect(effectSwatch('pressure', 2)).not.toMatch(/bleed|ht-mask/);
	});
});
