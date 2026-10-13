import {readFileSync} from 'node:fs';
import {describe, expect, test} from 'vitest';
import {fonts, registerFont, renderLogo, templates} from './index';
import type {LogoConfig} from '../editor/types';

for (const font of fonts) {
	const file = readFileSync(new URL(`../../../../static/fonts/${font.id}.ttf`, import.meta.url));
	registerFont(
		font.id,
		file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
	);
}

describe('motor de logos', () => {
	test('todos os templates e fontes geram curvas válidas nas duas versões', () => {
		for (const t of templates)
			for (const f of fonts)
				for (const v of ['light', 'dark'] as const) {
					const svg = renderLogo(
						{template: t.id, font: f.id, name: 'Ação & Café', tagline: 'FEITO NO BRASIL'},
						v,
						false
					);
					expect(svg).toMatch(/<path /);
					expect(svg).not.toMatch(/<text|font-family|NaN|Infinity/);
					expect(svg).toMatch(/Ação &amp; Café/);
					expect(svg).toMatch(new RegExp(`color:${v === 'dark' ? '#ffffff' : '#191a18'}`));
					expect(svg).not.toMatch(/<rect width="600" height="500" fill="#/);
				}
		// Percorre todos os modelos e fontes: segundos no Mac, bem mais no servidor de deploy.
	}, 120_000);

	test('o SVG com fundo inclui a superfície da versão selecionada', () => {
		expect(renderLogo({}, 'dark', true)).toMatch(/<rect width="600" height="500" fill="#191a18"/);
		expect(renderLogo({}, 'light', true)).toMatch(/<rect width="600" height="500" fill="#ffffff"/);
	});

	test('campos vazios e nomes longos não produzem geometria inválida', () => {
		for (const t of templates)
			for (const name of ['', 'W'.repeat(40)]) {
				expect(
					renderLogo({template: t.id, name, tagline: '', topline: '', size: 130, spacing: 8})
				).not.toMatch(/NaN|Infinity/);
			}
	});

	test('conteúdo fornecido pelo usuário é escapado no SVG', () => {
		expect(renderLogo({name: '<script>alert(1)</script>'})).not.toMatch(/<script>/);
	});

	test('a biblioteca mantém os sete aprovados e acrescenta as rodadas 3 a 6', () => {
		expect(templates.slice(0, 7).map((t) => t.id)).toEqual([
			'gothic',
			'rosette',
			'stamp',
			'coin',
			'hex-solid',
			'round-plate',
			'bow-hex'
		]);
		expect(templates.length).toBe(333);
		expect(new Set(templates.map((t) => t.id)).size).toBe(templates.length);
		expect(new Set(templates.map((t) => t.name)).size).toBe(templates.length);
		for (const t of templates) expect(['Lettering', 'Selos', 'Emblemas']).toContain(t.category);
		for (const t of templates) expect(fonts.some((f) => f.id === t.font)).toBe(true);
	});

	test('selos com textos curvos preservam os textos como curvas e os vazados como máscaras', () => {
		for (const id of ['rosette', 'hex-solid', 'round-plate', 'bow-hex']) {
			const svg = renderLogo(
				{template: id, name: 'VINTAGE', topline: 'PREMIUM', tagline: 'STANDARD'},
				'dark',
				false
			);
			expect(svg).toMatch(/<mask /);
			expect(svg).toMatch(/maskUnits="userSpaceOnUse"/);
			expect(svg).not.toMatch(/<text|<image/);
		}
	});

	test('os novos modelos respondem aos controles de tamanho, espaçamento e ornamento', () => {
		const normalize = (svg: string) =>
			svg.replace(/(?:mono|proposal|kit|r7|type)-cut-\d+/g, 'cut-ID');
		for (const t of templates.filter((t) => t.sample)) {
			const config: Partial<LogoConfig> = {
				template: t.id,
				name: 'NORTH CLUB',
				font: t.font,
				ornament: t.ornament
			};
			const base = normalize(renderLogo(config));
			expect(normalize(renderLogo({...config, size: 65}))).not.toBe(base);
			expect(normalize(renderLogo({...config, spacing: 5}))).not.toBe(base);
			expect(normalize(renderLogo({...config, ornament: 'none'}))).not.toBe(base);
		}
	});
});
