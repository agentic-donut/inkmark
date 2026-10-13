import {flushSync} from 'svelte';
import {beforeEach, describe, expect, test} from 'vitest';
import {DEFAULT_CONFIG} from '../../domain/editor/defaults';
import {FakeConfigStore, FakeFontLoader, FakeRenderer, definition} from '../../testing/fakes';
import {EditorState} from './editor-state.svelte';

const templates = [
	definition('gothic', {font: 'PirataOne', tilt: true}),
	definition('brush', {font: 'Lobster', ornament: 'diamond'}),
	definition('plain', {font: 'Oswald'})
];
const fonts = [{id: 'PirataOne'}, {id: 'Lobster'}, {id: 'Oswald'}];

let renderer: FakeRenderer;
let fontLoader: FakeFontLoader;
let store: FakeConfigStore;

function create(stored: ConstructorParameters<typeof FakeConfigStore>[0] = null) {
	renderer = new FakeRenderer();
	fontLoader = new FakeFontLoader();
	store = new FakeConfigStore(stored);
	return new EditorState({renderer, fontLoader, store, templates, fonts});
}

beforeEach(() => create());

describe('inicialização', () => {
	test('começa com o padrão, sem fontes e sem desenhar', () => {
		const state = create();
		expect(state.config).toEqual(DEFAULT_CONFIG);
		expect(state.fontsReady).toBe(false);
		expect(state.previewSvg).toBe('');
		expect(state.canExport).toBe(false);
		expect(renderer.calls).toHaveLength(0);
	});

	test('init carrega a configuração salva (validada) e as fontes', async () => {
		const state = create({name: 'Acme', size: 9999, template: 'brush', font: 'Lobster'});
		await state.init();
		expect(state.config).toMatchObject({
			name: 'Acme',
			size: 130,
			template: 'brush',
			font: 'Lobster'
		});
		expect(fontLoader.loaded).toBe(true);
		expect(state.fontsReady).toBe(true);
		expect(state.fontsError).toBeNull();
	});

	test('init com modelo salvo que não existe mais volta ao padrão', async () => {
		const state = create({template: 'sumiu', font: 'Oswald'});
		await state.init();
		expect(state.config.template).toBe('gothic');
		expect(state.config.font).toBe('PirataOne');
	});

	test('falha nas fontes guarda a mensagem e não libera o desenho', async () => {
		const state = create();
		fontLoader.failLoad = new Error('Não foi possível carregar Lobster.');
		await state.init();
		expect(state.fontsReady).toBe(false);
		expect(state.fontsError).toBe('Não foi possível carregar Lobster.');
		expect(state.previewSvg).toBe('');
	});
});

describe('prévia', () => {
	test('só desenha depois das fontes e segue a versão escolhida', async () => {
		const state = create();
		await state.init();
		expect(state.lightSvg).toContain('data-variant="light"');
		expect(state.darkSvg).toContain('data-variant="dark"');
		expect(state.previewSvg).toBe(state.lightSvg);
		state.setVariant('dark');
		expect(state.previewSvg).toBe(state.darkSvg);
	});

	test('a prévia sai sem fundo, para a foto da capa mostrar o papel', async () => {
		const state = create();
		await state.init();
		expect(state.previewSvg).toContain('data-bg="false"');
	});

	test('a prévia acompanha a configuração', async () => {
		const state = create();
		await state.init();
		state.setField('name', 'Novo Nome');
		expect(state.previewSvg).toContain('data-name="Novo Nome"');
	});

	test('a prévia é recalculada quando a configuração muda', async () => {
		const state = create();
		await state.init();
		const seen: string[] = [];
		const stop = $effect.root(() => {
			$effect(() => void seen.push(state.config.name));
		});
		flushSync();
		state.setField('name', 'Reativo');
		flushSync();
		stop();
		expect(seen).toEqual([DEFAULT_CONFIG.name, 'Reativo']);
		const before = renderer.calls.length;
		expect(state.previewSvg).toContain('Reativo');
		expect(state.previewSvg).toBe(state.previewSvg);
		expect(renderer.calls.length).toBe(before + 1);
	});

	test('canExport exige nome preenchido', async () => {
		const state = create();
		await state.init();
		expect(state.canExport).toBe(true);
		state.setField('name', '   ');
		expect(state.canExport).toBe(false);
	});

	test('template expõe o modelo em uso', async () => {
		const state = create();
		expect(state.template?.id).toBe('gothic');
		expect(state.template?.tilt).toBe(true);
		state.selectTemplate(templates[2]);
		expect(state.template?.id).toBe('plain');
	});
});

describe('efeitos salvos', () => {
	test('init recupera os efeitos salvos', async () => {
		const state = create({halftone: 1, pressure: 2, bleed: 3});
		await state.init();
		expect(state.config).toMatchObject({halftone: 1, pressure: 2, bleed: 3});
	});

	test('configuração salva sem efeitos carrega com tudo em 0', async () => {
		const state = create({name: 'Antiga', wear: 2});
		await state.init();
		expect(state.config).toMatchObject({
			name: 'Antiga',
			wear: 2,
			halftone: 0,
			pressure: 0,
			bleed: 0
		});
	});

	test('configuração antiga com acabamento único migra para o efeito equivalente', async () => {
		const state = create({finish: 'pressure'} as never);
		await state.init();
		expect(state.config).toMatchObject({pressure: 3, halftone: 0, bleed: 0});
		expect(state.config).not.toHaveProperty('finish');
	});

	test('efeito salvo inválido volta a 0', async () => {
		const state = create({bleed: 9} as never);
		await state.init();
		expect(state.config.bleed).toBe(0);
	});
});

describe('edição', () => {
	test('setField valida, aplica e salva', () => {
		const state = create();
		state.setField('size', 500);
		state.setField('tagline', 'x'.repeat(80));
		expect(state.config.size).toBe(130);
		expect(state.config.tagline).toHaveLength(50);
		expect(store.saved).toHaveLength(2);
		expect(store.saved.at(-1)).toEqual(state.config);
	});

	test('selectTemplate troca modelo, fonte e ornamento e salva', () => {
		const state = create();
		state.selectTemplate(templates[1]);
		expect(state.config).toMatchObject({template: 'brush', font: 'Lobster', ornament: 'diamond'});
		state.selectTemplate(templates[2]);
		expect(state.config.ornament).toBe('stars');
		expect(store.saved.at(-1)).toEqual(state.config);
	});

	test('setVariant não mexe na configuração nem salva', () => {
		const state = create();
		state.setVariant('dark');
		expect(state.variant).toBe('dark');
		expect(store.saved).toHaveLength(0);
	});

	test('cada efeito é validado, salvo e preservado ao trocar de modelo', () => {
		const state = create();
		state.setField('halftone', 2);
		state.setField('pressure', 1);
		state.setField('bleed', 3);
		expect(state.config).toMatchObject({halftone: 2, pressure: 1, bleed: 3});
		expect(store.saved.at(-1)).toMatchObject({halftone: 2, pressure: 1, bleed: 3});
		state.selectTemplate(templates[1]);
		expect(state.config).toMatchObject({halftone: 2, pressure: 1, bleed: 3});
		state.setField('bleed', 7 as never);
		expect(state.config.bleed).toBe(0);
	});

	test('o renderizador recebe os efeitos da configuração', () => {
		const state = create();
		state.setField('pressure', 2);
		state.setField('halftone', 1);
		void state.previewSvg;
		expect(
			renderer.calls.every((call) => call.config.pressure === 2 && call.config.halftone === 1)
		).toBe(true);
	});

	test('reset volta ao padrão, mantém a versão e salva', () => {
		const state = create();
		state.setField('name', 'X');
		state.setVariant('dark');
		state.reset();
		expect(state.config).toEqual(DEFAULT_CONFIG);
		expect(state.variant).toBe('dark');
		expect(store.saved.at(-1)).toEqual(DEFAULT_CONFIG);
	});

	test('a configuração é substituída, não mutada', () => {
		const state = create();
		const before = state.config;
		state.setField('name', 'Outro');
		expect(before.name).toBe(DEFAULT_CONFIG.name);
	});
});

describe('fonte própria', () => {
	test('registra, libera a fonte custom e seleciona', () => {
		const state = create();
		const data = new ArrayBuffer(4);
		expect(state.registerCustomFont(data)).toBe(true);
		expect(fontLoader.custom).toEqual([data]);
		expect(state.customFontAvailable).toBe(true);
		expect(state.config.font).toBe('custom');
	});

	test('o que vai para o disco usa a fonte do modelo, não a custom', () => {
		const state = create();
		state.selectTemplate(templates[1]);
		state.registerCustomFont(new ArrayBuffer(4));
		expect(state.config.font).toBe('custom');
		expect(store.saved.at(-1)?.font).toBe('Lobster');
	});

	test('arquivo inválido devolve false e não muda nada', () => {
		const state = create();
		fontLoader.failCustom = true;
		expect(state.registerCustomFont(new ArrayBuffer(1))).toBe(false);
		expect(state.customFontAvailable).toBe(false);
		expect(state.config.font).toBe('PirataOne');
		expect(store.saved).toHaveLength(0);
	});

	test('fonte que lê mas quebra ao desenhar é recusada e não muda nada', () => {
		const state = create();
		const render = renderer.render.bind(renderer);
		renderer.render = (config, variant, options) => {
			if (config.font === 'custom') throw new Error('glifo corrompido');
			return render(config, variant, options);
		};
		expect(state.registerCustomFont(new ArrayBuffer(4))).toBe(false);
		expect(state.customFontAvailable).toBe(false);
		expect(state.config.font).toBe('PirataOne');
		expect(store.saved).toHaveLength(0);
	});

	test('sem fonte importada, a custom é recusada por setField', () => {
		const state = create();
		state.setField('font', 'custom');
		expect(state.config.font).toBe(DEFAULT_CONFIG.font);
	});
});

describe('modelo padrão do admin', () => {
	function createWithDefault(stored: ConstructorParameters<typeof FakeConfigStore>[0] = null) {
		renderer = new FakeRenderer();
		fontLoader = new FakeFontLoader();
		store = new FakeConfigStore(stored);
		return new EditorState({
			renderer,
			fontLoader,
			store,
			templates,
			fonts,
			defaultTemplate: templates[1]
		});
	}

	test('sem configuração salva começa no modelo padrão', async () => {
		const state = createWithDefault();
		await state.init();
		expect(state.config).toMatchObject({template: 'brush', font: 'Lobster', ornament: 'diamond'});
	});

	test('a configuração salva tem prioridade', async () => {
		const state = createWithDefault({template: 'plain', font: 'Oswald', name: 'Acme'});
		await state.init();
		expect(state.config).toMatchObject({template: 'plain', font: 'Oswald', name: 'Acme'});
	});

	test('modelo salvo que sumiu cai no padrão e mantém os textos', async () => {
		const state = createWithDefault({template: 'sumiu', font: 'Oswald', name: 'Acme', size: 80});
		await state.init();
		expect(state.config).toMatchObject({
			template: 'brush',
			font: 'Lobster',
			name: 'Acme',
			size: 80
		});
	});

	test('reset volta ao modelo padrão', () => {
		const state = createWithDefault();
		state.selectTemplate(templates[2]);
		state.reset();
		expect(state.config.template).toBe('brush');
	});
});
