import {describe, expect, test} from 'vitest';
import {entry} from '../../testing/fakes';
import {EMPTY_SETTINGS} from './catalog';
import {
	publicSettings,
	moveTemplate,
	reorder,
	sanitizeSettings,
	setDefaultTemplate,
	setTemplateSettings
} from './settings';
import type {CatalogSettings} from './types';

const ids = ['a', 'b', 'c'];
const now = () => '2026-01-01T00:00:00.000Z';

describe('sanitizeSettings', () => {
	test('lixo vira configuração vazia', () => {
		for (const raw of [undefined, null, 'x', 3, [], {templates: 'x'}]) {
			expect(sanitizeSettings(raw, ids)).toEqual(EMPTY_SETTINGS);
		}
	});

	test('mantém valores válidos', () => {
		const raw = {
			defaultTemplate: 'b',
			updatedAt: '2026-02-02',
			templates: {a: {hidden: true, featured: false, order: 2, name: 'Novo', category: 'Selos'}}
		};
		expect(sanitizeSettings(raw, ids)).toEqual(raw);
	});

	test('descarta ids desconhecidos e modelo padrão inexistente', () => {
		const result = sanitizeSettings(
			{defaultTemplate: 'zzz', templates: {zzz: {hidden: true}, a: {hidden: true}}},
			ids
		);
		expect(result.defaultTemplate).toBeNull();
		expect(Object.keys(result.templates)).toEqual(['a']);
	});

	test('descarta categoria, flags e ordem inválidos', () => {
		const result = sanitizeSettings(
			{
				templates: {
					a: {category: 'Outra', hidden: 'sim', featured: 1, order: 1.5},
					b: {order: '2'},
					c: {order: 0, hidden: false}
				}
			},
			ids
		);
		expect(result.templates).toEqual({c: {order: 0, hidden: false}});
	});

	test('apara o nome, limita a 60 e remove se vazio', () => {
		const result = sanitizeSettings(
			{templates: {a: {name: `  ${'x'.repeat(80)}  `}, b: {name: '   '}, c: {name: ' Ok '}}},
			ids
		);
		expect(result.templates.a.name).toHaveLength(60);
		expect(result.templates).not.toHaveProperty('b');
		expect(result.templates.c.name).toBe('Ok');
	});

	test('não confunde chaves herdadas com ids', () => {
		expect(sanitizeSettings({templates: {}}, ['constructor']).templates).toEqual({});
	});
});

describe('atualizadores', () => {
	const base: CatalogSettings = {
		defaultTemplate: null,
		templates: {a: {hidden: true, name: 'A'}},
		updatedAt: null
	};

	test('setTemplateSettings mescla, carimba a data e não muda o original', () => {
		const snapshot = JSON.stringify(base);
		const result = setTemplateSettings(base, 'a', {featured: true}, now);
		expect(result.templates.a).toEqual({hidden: true, name: 'A', featured: true});
		expect(result.updatedAt).toBe(now());
		expect(result).not.toBe(base);
		expect(JSON.stringify(base)).toBe(snapshot);
	});

	test('valor undefined remove a chave e modelo sem chaves some', () => {
		const first = setTemplateSettings(base, 'a', {name: undefined}, now);
		expect(first.templates.a).toEqual({hidden: true});
		const second = setTemplateSettings(first, 'a', {hidden: undefined}, now);
		expect(second.templates).not.toHaveProperty('a');
	});

	test('setTemplateSettings cria entrada para modelo novo', () => {
		expect(setTemplateSettings(base, 'b', {hidden: true}, now).templates.b).toEqual({hidden: true});
	});

	test('reorder grava a posição de todos', () => {
		const result = reorder(base, ['c', 'a', 'b'], now);
		expect(result.templates.c.order).toBe(0);
		expect(result.templates.a).toEqual({hidden: true, name: 'A', order: 1});
		expect(result.templates.b.order).toBe(2);
		expect(result.updatedAt).toBe(now());
		expect(base.templates.a).not.toHaveProperty('order');
	});

	const entries = [entry('a'), entry('b'), entry('c')];

	test('moveTemplate troca com o vizinho', () => {
		const down = moveTemplate(EMPTY_SETTINGS, entries, 'a', 'down', now);
		expect(['a', 'b', 'c'].map((id) => down.templates[id].order)).toEqual([1, 0, 2]);
		const up = moveTemplate(EMPTY_SETTINGS, entries, 'c', 'up', now);
		expect(['a', 'b', 'c'].map((id) => up.templates[id].order)).toEqual([0, 2, 1]);
	});

	test('moveTemplate na borda ou com id desconhecido não muda nada', () => {
		expect(moveTemplate(base, entries, 'a', 'up', now)).toBe(base);
		expect(moveTemplate(base, entries, 'c', 'down', now)).toBe(base);
		expect(moveTemplate(base, entries, 'zzz', 'down', now)).toBe(base);
	});

	test('setDefaultTemplate', () => {
		const result = setDefaultTemplate(base, 'b', now);
		expect(result).toMatchObject({defaultTemplate: 'b', updatedAt: now()});
		expect(setDefaultTemplate(result, null, now).defaultTemplate).toBeNull();
		expect(base.defaultTemplate).toBeNull();
	});
});

describe('publicSettings', () => {
	test('modelo oculto não leva nome, categoria nem destaque para a página pública', () => {
		const settings: CatalogSettings = {
			defaultTemplate: 'b',
			templates: {
				a: {hidden: true, name: 'Nome interno', category: 'Selos', featured: true, order: 3},
				b: {name: 'Visível', featured: true, order: 1}
			},
			updatedAt: '2026-10-12T20:00:00.000Z'
		};
		expect(publicSettings(settings)).toEqual({
			defaultTemplate: 'b',
			templates: {a: {hidden: true}, b: {name: 'Visível', featured: true, order: 1}},
			updatedAt: null
		});
	});
});
