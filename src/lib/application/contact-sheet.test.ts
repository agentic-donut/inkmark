import {describe, expect, test} from 'vitest';
import {FakeFileExporter, FakeRenderer, entry} from '../testing/fakes';
import {DEFAULT_CONFIG} from '../domain/editor/defaults';
import {CONTACT_SHEET_FILENAME, buildContactSheet, downloadContactSheet} from './contact-sheet';

const entries = Array.from({length: 5}, (_, i) => entry(`m${i}`, {name: `Modelo ${i}`}));

describe('buildContactSheet', () => {
	test('4 colunas de 600×550, fundo branco e altura pelas linhas', () => {
		const svg = buildContactSheet(entries, DEFAULT_CONFIG, {useMyName: true}, new FakeRenderer());
		expect(svg).toContain('width="2400" height="1100"');
		expect(svg).toContain('<rect width="100%" height="100%" fill="white"/>');
		expect(svg).toContain('translate(0,0)');
		expect(svg).toContain('translate(1800,0)');
		expect(svg).toContain('translate(0,550)');
		expect(svg).not.toContain('translate(600,550)');
	});

	test('reduz cada logo para 600×500 e escreve o nome embaixo', () => {
		const svg = buildContactSheet(entries, DEFAULT_CONFIG, {useMyName: true}, new FakeRenderer());
		expect(svg).not.toContain('width="1200" height="1000"');
		expect(svg.match(/width="600" height="500"/g)).toHaveLength(5);
		expect(svg).toContain('y="528"');
		expect(svg).toContain('>Modelo 3</text>');
	});

	test('escapa o nome do modelo', () => {
		const svg = buildContactSheet(
			[entry('x', {name: '<b>&Co'})],
			DEFAULT_CONFIG,
			{useMyName: true},
			new FakeRenderer()
		);
		expect(svg).not.toContain('<b>');
		expect(svg).toContain('&#60;b&#62;&#38;Co');
	});

	test('usa a versão clara e a configuração dos cards', () => {
		const renderer = new FakeRenderer();
		buildContactSheet(entries, {...DEFAULT_CONFIG, name: 'Acme'}, {useMyName: true}, renderer);
		expect(renderer.calls.every((c) => c.variant === 'light')).toBe(true);
		expect(renderer.calls.map((c) => c.config.template)).toEqual(entries.map((e) => e.id));
		expect(renderer.calls[0].config).toMatchObject({name: 'Acme', size: 100, tilt: -6});
	});

	test('sem o nome do usuário usa os exemplos', () => {
		const renderer = new FakeRenderer();
		buildContactSheet([entry('gothic')], DEFAULT_CONFIG, {useMyName: false}, renderer);
		expect(renderer.calls[0].config.name).toBe('Wile Out');
	});

	test('lista vazia gera folha sem células', () => {
		const svg = buildContactSheet([], DEFAULT_CONFIG, {useMyName: true}, new FakeRenderer());
		expect(svg).toContain('height="0"');
		expect(svg).not.toContain('<g ');
	});
});

test('downloadContactSheet baixa o SVG com o nome padrão', async () => {
	const exporter = new FakeFileExporter();
	downloadContactSheet(
		entries,
		DEFAULT_CONFIG,
		{useMyName: true},
		{renderer: new FakeRenderer(), exporter}
	);
	expect(exporter.downloads).toHaveLength(1);
	expect(exporter.downloads[0].name).toBe(CONTACT_SHEET_FILENAME);
	expect(CONTACT_SHEET_FILENAME).toBe('inkmark-prancha.svg');
	expect(exporter.downloads[0].blob.type).toBe('image/svg+xml');
});

test('downloadContactSheet usa o nome de arquivo do idioma quando informado', () => {
	const exporter = new FakeFileExporter();
	downloadContactSheet(
		entries,
		DEFAULT_CONFIG,
		{useMyName: true, filename: 'inkmark-sheet.svg'},
		{renderer: new FakeRenderer(), exporter}
	);
	expect(exporter.downloads.map((d) => d.name)).toEqual(['inkmark-sheet.svg']);
});
