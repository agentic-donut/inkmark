import {beforeEach, describe, expect, test} from 'vitest';
import {FakeFileExporter, FakeRenderer} from '../testing/fakes';
import {DEFAULT_CONFIG} from '../domain/editor/defaults';
import {exportLogo, type ExportOptions} from './export-logo';

let renderer: FakeRenderer;
let exporter: FakeFileExporter;
const config = {...DEFAULT_CONFIG, name: 'Ação Café'};
const options = (overrides: Partial<ExportOptions> = {}): ExportOptions => ({
	variants: 'both',
	formats: 'both',
	width: 2400,
	transparent: true,
	...overrides
});
const run = (overrides?: Partial<ExportOptions>) =>
	exportLogo(config, options(overrides), {renderer, exporter});

beforeEach(() => {
	renderer = new FakeRenderer();
	exporter = new FakeFileExporter();
});

describe('exportLogo', () => {
	test('um único arquivo é baixado direto', async () => {
		const result = await run({variants: 'light', formats: 'svg'});
		expect(result).toEqual({
			files: ['acao-cafe-clara.svg'],
			downloaded: 'acao-cafe-clara.svg',
			zipped: false
		});
		expect(exporter.downloads.map((d) => d.name)).toEqual(['acao-cafe-clara.svg']);
		expect(exporter.zipped).toHaveLength(0);
		expect(await exporter.downloads[0].blob.text()).toContain('data-variant="light"');
	});

	test('vários arquivos viram um ZIP com nome do slug', async () => {
		const result = await run();
		expect(result.files).toEqual([
			'acao-cafe-clara.svg',
			'acao-cafe-clara.png',
			'acao-cafe-escura.svg',
			'acao-cafe-escura.png'
		]);
		expect(result).toMatchObject({downloaded: 'acao-cafe-logos.zip', zipped: true});
		expect(exporter.downloads.map((d) => d.name)).toEqual(['acao-cafe-logos.zip']);
		expect(exporter.zipped[0].map((f) => f.name)).toEqual(result.files);
	});

	test('só a versão escura, em PNG, na largura pedida', async () => {
		const result = await run({variants: 'dark', formats: 'png', width: 1200});
		expect(result.files).toEqual(['acao-cafe-escura.png']);
		expect(exporter.pngWidths).toEqual([1200]);
	});

	test('SVG não passa pelo conversor de PNG', async () => {
		await run({formats: 'svg'});
		expect(exporter.pngWidths).toEqual([]);
		expect(exporter.zipped[0].map((f) => f.name)).toEqual([
			'acao-cafe-clara.svg',
			'acao-cafe-escura.svg'
		]);
	});

	test('fundo transparente desliga o fundo; sem transparência liga', async () => {
		await run({variants: 'light', formats: 'svg', transparent: true});
		await run({variants: 'light', formats: 'svg', transparent: false});
		expect(renderer.calls.map((c) => c.background)).toEqual([false, true]);
	});

	test('renderiza cada versão uma vez, mesmo com dois formatos', async () => {
		await run();
		expect(renderer.calls.map((c) => c.variant)).toEqual(['light', 'dark']);
	});

	test('nome sem letras usa o slug "logo"', async () => {
		const result = await exportLogo(
			{...config, name: '***'},
			options({variants: 'light', formats: 'svg'}),
			{renderer, exporter}
		);
		expect(result.downloaded).toBe('logo-clara.svg');
	});

	test('falha no PNG propaga o erro e nada é baixado', async () => {
		exporter.failPng = true;
		await expect(run()).rejects.toThrow('png');
		expect(exporter.downloads).toHaveLength(0);
	});

	test('os nomes das versões vêm do idioma informado', async () => {
		const result = await exportLogo(config, options({formats: 'svg'}), {
			renderer,
			exporter,
			variantLabels: {light: 'light', dark: 'dark'}
		});
		expect(result.files).toEqual(['acao-cafe-light.svg', 'acao-cafe-dark.svg']);
		expect(result.downloaded).toBe('acao-cafe-logos.zip');
	});

	test('em espanhol: clara e oscura', async () => {
		const result = await exportLogo(config, options({formats: 'png'}), {
			renderer,
			exporter,
			variantLabels: {light: 'clara', dark: 'oscura'}
		});
		expect(result.files).toEqual(['acao-cafe-clara.png', 'acao-cafe-oscura.png']);
	});
});
