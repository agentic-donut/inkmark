import {readFileSync} from 'node:fs';
import {describe, expect, test} from 'vitest';
import {EFFECT_LEVELS, applyEffects, applyWear, fonts, registerFont, renderLogo} from './index';
import type {EffectSettings} from './index';
import type {EffectLevel} from '../editor/types';

for (const font of fonts) {
	const file = readFileSync(new URL(`../../../../static/fonts/${font.id}.ttf`, import.meta.url));
	registerFont(
		font.id,
		file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
	);
}

const LEVELS = EFFECT_LEVELS;
const ACTIVE = [1, 2, 3] as const;
const TEMPLATES = ['hex-solid', 'arched-seal', 'sunset', 'gothic'];
const OFF: EffectSettings = {halftone: 0, bleed: 0, pressure: 0, wear: 0};
const fx = (settings: Partial<EffectSettings>): EffectSettings => ({...OFF, ...settings});

const logo = (template: string, variant: 'light' | 'dark' = 'light', name = 'Inkmark') =>
	renderLogo(
		{template, font: 'Oswald', name, topline: 'EST. 2026', tagline: 'MARCAS'},
		variant,
		true
	);

const ART_OPEN = /<g fill="[^"]+" color="[^"]+"/;
const count = (svg: string, pattern: RegExp) => svg.match(pattern)?.length ?? 0;
const idsOf = (svg: string) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const refsOf = (svg: string) => [...svg.matchAll(/url\(#([^)]+)\)/g)].map((match) => match[1]);

/** Tags que abrem e fecham; as que se fecham sozinhas (`<rect/>`) não entram na conta. */
const PAIRED = ['svg', 'g', 'defs', 'mask', 'filter', 'pattern', 'linearGradient'];

function expectWellFormed(svg: string) {
	expect(svg).not.toMatch(/NaN|Infinity|undefined/);
	expect(svg.startsWith('<svg')).toBe(true);
	expect(svg.endsWith('</svg>')).toBe(true);
	for (const tag of PAIRED) {
		expect(count(svg, new RegExp(`<${tag}[\\s>]`, 'g')), `<${tag}>`).toBe(
			count(svg, new RegExp(`</${tag}>`, 'g'))
		);
	}
}

/** Cada id aparece uma vez (até os filtros de desgaste compartilhados) e toda referência resolve. */
function expectReferencesResolve(svg: string) {
	const ids = idsOf(svg);
	expect(new Set(ids).size, 'ids repetidos').toBe(ids.length);
	for (const ref of refsOf(svg)) expect(ids, `url(#${ref})`).toContain(ref);
}

function expectKeepsArt(input: string, output: string) {
	const start = input.search(ART_OPEN);
	expect(output).toContain(input.slice(0, start));
	expect(output).toContain(input.slice(start, -'</svg>'.length));
}

const withoutShared = (svg: string) => idsOf(svg).filter((id) => !id.startsWith('ink-wear-'));

describe('applyEffects: sem efeito de forma', () => {
	test('só o desgaste equivale a applyWear, e tudo em 0 devolve o SVG como veio', () => {
		const svg = logo('hex-solid');
		for (const wear of LEVELS) expect(applyEffects(svg, fx({wear}))).toBe(applyWear(svg, wear));
		expect(applyEffects(svg, OFF)).toBe(svg);
	});

	test('entrada sem arte reconhecível volta só com o desgaste, sem quebrar', () => {
		const odd = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="3"/></svg>';
		for (const halftone of LEVELS)
			for (const bleed of LEVELS)
				for (const pressure of LEVELS) {
					expect(applyEffects(odd, {halftone, bleed, pressure, wear: 0})).toBe(odd);
				}
	});
});

describe.each(['halftone', 'bleed', 'pressure'] as const)('%s sozinho', (key) => {
	test.each(ACTIVE)(
		'nível %i devolve SVG válido, com a arte, em todos os modelos, versões e desgastes',
		(level) => {
			for (const template of TEMPLATES)
				for (const variant of ['light', 'dark'] as const)
					for (const wear of LEVELS) {
						const input = logo(template, variant);
						const output = applyEffects(input, fx({[key]: level, wear}));
						expectWellFormed(output);
						expectReferencesResolve(output);
						expect(output).not.toBe(input);
						expectKeepsArt(input, output);
					}
		}
	);

	test('cada nível produz um resultado diferente', () => {
		const input = logo('hex-solid');
		const outputs = ACTIVE.map((level) => applyEffects(input, fx({[key]: level})));
		expect(new Set(outputs).size).toBe(3);
	});
});

describe('combinações', () => {
	test.each(['hex-solid', 'arched-seal'])(
		'%s: todas as combinações de níveis dão SVG válido, sem id repetido e com referências resolvidas',
		(template) => {
			const input = logo(template);
			let tested = 0;
			for (const halftone of LEVELS)
				for (const bleed of LEVELS)
					for (const pressure of LEVELS)
						for (const wear of LEVELS) {
							const output = applyEffects(input, {halftone, bleed, pressure, wear});
							expectWellFormed(output);
							expectReferencesResolve(output);
							// Só com o desgaste, ele vira atributo da própria arte (applyWear).
							if (halftone || bleed || pressure) expectKeepsArt(input, output);
							tested++;
						}
			expect(tested).toBe(256);
		}
	);

	test('ids do próprio SVG de entrada (recortes do motor) seguem resolvendo', () => {
		const input = logo('arched-seal');
		expect(idsOf(input).length).toBeGreaterThan(0);
		const output = applyEffects(input, {halftone: 2, bleed: 2, pressure: 2, wear: 2});
		for (const id of idsOf(input)) expect(idsOf(output)).toContain(id);
	});

	test('a ordem é fixa: pressão por fora, depois desgaste, retícula, tinta espalhada e a arte', () => {
		const output = applyEffects(logo('hex-solid'), {halftone: 2, bleed: 2, pressure: 2, wear: 2});
		const firm = output.indexOf('<g mask="url(#pr-firm-');
		const wear = output.indexOf('<g filter="url(#ink-wear-2-7)">', firm);
		const halftone = output.indexOf('<g mask="url(#ht-mask-', wear);
		const bleed = output.indexOf('<g filter="url(#bleed-', halftone);
		const art = output.indexOf('<g fill=', bleed);
		expect([firm, wear, halftone, bleed, art].every((at) => at >= 0)).toBe(true);
		expect(firm).toBeLessThan(wear);
		expect(wear).toBeLessThan(halftone);
		expect(halftone).toBeLessThan(bleed);
		expect(bleed).toBeLessThan(art);
		// A camada fraca fica por baixo da firme.
		expect(output.indexOf('filter="url(#ink-wear-pressure-2-7)"')).toBeLessThan(firm);
	});

	test('a tinta espalhada entra na máscara da retícula: os pontos não viram mancha', () => {
		const output = applyEffects(logo('hex-solid'), fx({halftone: 2, bleed: 2}));
		const mask = output.match(/<mask id="ht-mask-[^"]+"[\s\S]*?<\/mask>/)?.[0] ?? '';
		expect(mask).toContain('filter="url(#bleed-');
		expect(mask).toContain('fill="#fff"');
	});

	test('o desgaste envolve a retícula e a tinta espalhada, por fora', () => {
		const input = logo('hex-solid');
		for (const key of ['halftone', 'bleed'] as const) {
			const output = applyEffects(input, fx({[key]: 2, wear: 2}));
			expect(output).toContain('<g filter="url(#ink-wear-2-7)"><g ');
			expect(output).not.toContain('ink-wear-pressure');
			expect(applyEffects(input, fx({[key]: 2}))).not.toContain('ink-wear');
		}
	});

	test('pressão: lado fraco com desgaste próprio, o escolhido na camada firme', () => {
		const input = logo('hex-solid');
		const output = applyEffects(input, fx({pressure: 3, wear: 1}));
		expect(idsOf(output)).toEqual(
			expect.arrayContaining(['ink-wear-1-7', 'ink-wear-pressure-3-7'])
		);
		expect(count(output, /filter="url\(#ink-wear-pressure-3-7\)"/g)).toBe(1);
		expect(count(output, /filter="url\(#ink-wear-1-7\)"/g)).toBe(1);
		// Sem desgaste a camada firme fica lisa, só a fraca é gasta.
		const clean = applyEffects(input, fx({pressure: 3}));
		expect(count(clean, /filter="url\(#ink-wear-/g)).toBe(1);
		expect(idsOf(clean)).not.toContain('ink-wear-1-7');
	});

	test('cada filtro de desgaste é definido uma vez, mesmo quando dois lados o usam', () => {
		const output = applyEffects(logo('hex-solid'), fx({pressure: 3, wear: 3}));
		expect(count(output, /<filter id="ink-wear-3-7"/g)).toBe(1);
		expect(count(output, /<filter id="ink-wear-pressure-3-7"/g)).toBe(1);
		expectReferencesResolve(output);
	});

	test('o lado fraco da pressão tem um filtro por nível', () => {
		const ids = ACTIVE.map((pressure) =>
			idsOf(applyEffects(logo('hex-solid'), fx({pressure}))).find((id) =>
				id.startsWith('ink-wear-pressure-')
			)
		);
		expect(ids).toEqual([
			'ink-wear-pressure-1-7',
			'ink-wear-pressure-2-7',
			'ink-wear-pressure-3-7'
		]);
	});

	test('é determinístico', () => {
		const input = logo('sunset');
		const settings = {halftone: 1, bleed: 2, pressure: 3, wear: 2} as const;
		expect(applyEffects(input, settings)).toBe(applyEffects(input, settings));
	});
});

describe('ids únicos entre logos', () => {
	test('logos e níveis diferentes não repetem ids próprios', () => {
		const a = logo('hex-solid', 'light', 'Alfa');
		const b = logo('hex-solid', 'light', 'Beta');
		const own = (svg: string, settings: EffectSettings) =>
			withoutShared(applyEffects(svg, settings)).filter((id) => !id.startsWith('kit-'));
		const settings = {halftone: 2, bleed: 2, pressure: 2, wear: 0} as const;
		expect(own(a, settings).filter((id) => own(b, settings).includes(id))).toEqual([]);
		const levels = ACTIVE.map((bleed) => own(a, fx({bleed})).find((id) => id.startsWith('bleed-')));
		expect(new Set(levels).size).toBe(3);
	});

	test('vários SVGs no mesmo documento: nenhum id próprio se repete', () => {
		const svgs = TEMPLATES.flatMap((template) =>
			LEVELS.map((level) =>
				applyEffects(logo(template), {
					halftone: level,
					bleed: LEVELS[(level + 1) % 4],
					pressure: LEVELS[(level + 2) % 4],
					wear: 1
				})
			)
		);
		const documentIds = withoutShared(svgs.join('\n'));
		expect(new Set(documentIds).size).toBe(documentIds.length);
		// O desgaste é igual em todo lugar: o mesmo id sempre tem a mesma definição.
		const filters = new Set(
			[...svgs.join('\n').matchAll(/<filter id="ink-wear-[^"]+"[\s\S]*?<\/filter>/g)].map(
				(match) => match[0]
			)
		);
		const wearIds = [...filters].map((filter) => filter.match(/id="([^"]+)"/)?.[1]);
		expect(new Set(wearIds).size).toBe(filters.size);
	});
});

describe('parâmetros aprovados', () => {
	const input = logo('hex-solid');
	const halftoneOf = (halftone: EffectLevel) => {
		const output = applyEffects(input, fx({halftone}));
		return {
			cell: Number(output.match(/<pattern[^>]* width="([\d.]+)"/)?.[1]),
			dot: Number(output.match(/<circle cx="[\d.]+" cy="[\d.]+" r="([\d.]+)"/)?.[1]),
			rim: Number(output.match(/radius="([\d.]+)"/)?.[1])
		};
	};

	test('retícula: o nível forte é o aprovado e os leves cobrem mais de tinta', () => {
		expect(halftoneOf(3)).toEqual({cell: 10, dot: 3.4, rim: 5});
		const coverage = ACTIVE.map((level) => {
			const {cell, dot} = halftoneOf(level);
			return (Math.PI * dot ** 2) / cell ** 2;
		});
		expect(coverage[0]).toBeCloseTo(0.7, 1);
		expect(coverage[1]).toBeCloseTo(0.52, 1);
		expect(coverage[2]).toBeCloseTo(0.36, 1);
		const rims = ACTIVE.map((level) => halftoneOf(level).rim);
		expect(rims[0]).toBeGreaterThan(rims[1]);
		expect(rims[1]).toBeGreaterThan(rims[2]);
	});

	test('tinta espalhada: 1, 2 e 3 são leve, média e forte aprovadas', () => {
		const bleed = (level: EffectLevel) => applyEffects(input, fx({bleed: level}));
		expect(bleed(1)).toContain('radius="0.6"');
		expect(bleed(1)).toContain('stdDeviation="1.3"');
		expect(bleed(1)).toContain('scale="2"');
		expect(bleed(2)).toContain('radius="1.1"');
		expect(bleed(2)).toContain('stdDeviation="1.8"');
		expect(bleed(3)).toContain('radius="1.7"');
		expect(bleed(3)).toContain('scale="4.5"');
	});

	test('pressão: o nível forte é a implementação aprovada; os leves recuam o degradê e gastam menos', () => {
		const pressure = (level: EffectLevel) => applyEffects(input, fx({pressure: level}));
		const strong = pressure(3);
		expect(strong).toContain('x1="190" y1="250" x2="410" y2="250"');
		expect(strong).toContain('rotate(-25 300 250)');
		expect(strong).toMatch(/<filter id="pr-dither-[^"]+"/);
		// Desgaste do lado fraco: pontinhos, riscos, manchas e borda do nível forte.
		expect(strong).toMatch(/<filter id="ink-wear-pressure-3-7"[^>]*>/);
		expect(strong).toContain('k3="0.34"');
		const start = (level: EffectLevel) => Number(pressure(level).match(/x1="(\d+)"/)?.[1]);
		expect(start(1)).toBeGreaterThan(start(2));
		expect(start(2)).toBeGreaterThan(start(3));
		const patch = (level: EffectLevel) => Number(pressure(level).match(/ k3="([\d.]+)"/)?.[1]);
		expect(patch(1)).toBeLessThan(patch(2));
		expect(patch(2)).toBeLessThan(patch(3));
	});

	test('a retícula guarda cópia branca da arte na máscara', () => {
		const output = applyEffects(logo('arched-seal'), fx({halftone: 3}));
		expect(output).toContain('<g fill="#fff" color="#fff"');
		expectReferencesResolve(output);
	});
});
