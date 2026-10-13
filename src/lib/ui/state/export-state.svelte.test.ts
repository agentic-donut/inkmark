import {beforeEach, describe, expect, test, vi} from 'vitest';
import {DEFAULT_CONFIG} from '../../domain/editor/defaults';
import {FakeFileExporter, FakeRenderer} from '../../testing/fakes';
import {ExportState} from './export-state.svelte';

let renderer: FakeRenderer;
let exporter: FakeFileExporter;
let config: typeof DEFAULT_CONFIG;
let state: ExportState;

beforeEach(() => {
	renderer = new FakeRenderer();
	exporter = new FakeFileExporter();
	config = {...DEFAULT_CONFIG, name: 'Acme'};
	state = new ExportState({renderer, exporter}, () => config);
});

describe('ExportState', () => {
	test('começa fechado, ocioso e com as opções do original', () => {
		expect(state.open).toBe(false);
		expect(state.busy).toBe(false);
		expect(state.status).toBe('idle');
		expect(state.options).toEqual({
			variants: 'both',
			formats: 'both',
			width: 2400,
			transparent: true
		});
	});

	test('abre e fecha o diálogo', () => {
		state.openDialog();
		expect(state.open).toBe(true);
		state.closeDialog();
		expect(state.open).toBe(false);
	});

	test('a resolução só vale quando há PNG', () => {
		expect(state.resolutionEnabled).toBe(true);
		state.setOption('formats', 'svg');
		expect(state.resolutionEnabled).toBe(false);
		state.setOption('formats', 'png');
		expect(state.resolutionEnabled).toBe(true);
	});

	test('run exporta com a configuração atual e as opções', async () => {
		state.setOption('variants', 'dark');
		state.setOption('formats', 'svg');
		expect(await state.run()).toBe(true);
		expect(exporter.downloads.map((d) => d.name)).toEqual(['acme-escura.svg']);
		expect(state.status).toBe('done');
		expect(state.failed).toBe(false);
		expect(state.busy).toBe(false);
	});

	test('lê a configuração no momento de exportar', async () => {
		state.setOption('variants', 'light');
		state.setOption('formats', 'svg');
		config = {...config, name: 'Depois'};
		await state.run();
		expect(exporter.downloads[0].name).toBe('depois-clara.svg');
	});

	test('mostra "preparando" e fica ocupado durante a exportação', async () => {
		let release!: () => void;
		exporter.svgToPng = () => new Promise((resolve) => (release = () => resolve(new Blob())));
		state.setOption('variants', 'light');
		state.setOption('formats', 'png');
		const running = state.run();
		expect(state.busy).toBe(true);
		expect(state.status).toBe('preparing');
		expect(await state.run()).toBe(false);
		release();
		await running;
		expect(state.busy).toBe(false);
	});

	test('falha: status failed e libera o botão', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		exporter.failPng = true;
		expect(await state.run()).toBe(false);
		expect(state.failed).toBe(true);
		expect(state.status).toBe('failed');
		expect(state.busy).toBe(false);
		error.mockRestore();
	});

	test('uma nova tentativa limpa o erro anterior', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		exporter.failPng = true;
		await state.run();
		exporter.failPng = false;
		await state.run();
		expect(state.failed).toBe(false);
		expect(state.status).toBe('done');
		error.mockRestore();
	});

	test('os nomes dos arquivos seguem os rótulos de versão injetados', async () => {
		state = new ExportState(
			{renderer, exporter, variantLabels: {light: 'light', dark: 'dark'}},
			() => config
		);
		state.setOption('variants', 'dark');
		state.setOption('formats', 'svg');
		await state.run();
		expect(exporter.downloads.map((d) => d.name)).toEqual(['acme-dark.svg']);
	});
});
