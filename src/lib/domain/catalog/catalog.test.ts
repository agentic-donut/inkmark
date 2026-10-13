import {describe, expect, test} from 'vitest';
import {definition, entry} from '../../testing/fakes';
import {
	EMPTY_SETTINGS,
	countByCategory,
	filterByCategory,
	mergeCatalog,
	resolveDefaultTemplate,
	visibleEntries
} from './catalog';
import type {CatalogSettings} from './types';

const defs = [
	definition('a'),
	definition('b', {category: 'Selos'}),
	definition('c', {category: 'Emblemas'}),
	definition('d', {category: 'Selos'})
];

const withTemplates = (templates: CatalogSettings['templates']): CatalogSettings => ({
	...EMPTY_SETTINGS,
	templates
});

describe('mergeCatalog', () => {
	test('sem configurações mantém a ordem das definições e os padrões', () => {
		const entries = mergeCatalog(defs, EMPTY_SETTINGS);
		expect(entries.map((e) => e.id)).toEqual(['a', 'b', 'c', 'd']);
		expect(entries.map((e) => e.order)).toEqual([0, 1, 2, 3]);
		expect(entries.every((e) => !e.hidden && !e.featured)).toBe(true);
	});

	test('aplica nome, categoria e flags', () => {
		const [a] = mergeCatalog(
			defs,
			withTemplates({a: {name: 'Novo', category: 'Emblemas', hidden: true, featured: true}})
		);
		expect(a).toMatchObject({
			name: 'Novo',
			category: 'Emblemas',
			hidden: true,
			featured: true,
			font: 'Oswald'
		});
	});

	test('ordem explícita vem primeiro, o resto segue as definições', () => {
		const entries = mergeCatalog(defs, withTemplates({c: {order: 0}, b: {order: 5}}));
		expect(entries.map((e) => e.id)).toEqual(['c', 'b', 'a', 'd']);
	});

	test('empates na ordem explícita são estáveis', () => {
		const entries = mergeCatalog(defs, withTemplates({d: {order: 1}, b: {order: 1}}));
		expect(entries.map((e) => e.id)).toEqual(['b', 'd', 'a', 'c']);
	});

	test('não altera as definições nem as configurações', () => {
		const settings = withTemplates({a: {name: 'Novo'}});
		const snapshot = JSON.stringify([defs, settings]);
		mergeCatalog(defs, settings);
		expect(JSON.stringify([defs, settings])).toBe(snapshot);
	});
});

describe('consultas', () => {
	const entries = [
		entry('a'),
		entry('b', {category: 'Selos', hidden: true}),
		entry('c', {category: 'Selos'}),
		entry('d', {category: 'Emblemas'})
	];

	test('visibleEntries remove ocultos', () => {
		expect(visibleEntries(entries).map((e) => e.id)).toEqual(['a', 'c', 'd']);
	});

	test('filterByCategory', () => {
		expect(filterByCategory(entries, 'Todos')).toHaveLength(4);
		expect(filterByCategory(entries, 'Selos').map((e) => e.id)).toEqual(['b', 'c']);
		expect(filterByCategory(entries, 'Todos')).not.toBe(entries);
	});

	test('countByCategory', () => {
		expect(countByCategory(visibleEntries(entries))).toEqual({
			Todos: 3,
			Lettering: 1,
			Selos: 1,
			Emblemas: 1
		});
		expect(countByCategory([])).toEqual({Todos: 0, Lettering: 0, Selos: 0, Emblemas: 0});
	});
});

describe('resolveDefaultTemplate', () => {
	const entries = [entry('a', {hidden: true}), entry('b'), entry('c')];
	const settings = (defaultTemplate: string | null): CatalogSettings => ({
		...EMPTY_SETTINGS,
		defaultTemplate
	});

	test('usa o modelo escolhido quando está visível', () => {
		expect(resolveDefaultTemplate(entries, settings('c'))?.id).toBe('c');
	});

	test('escolhido oculto ou inexistente cai no primeiro visível', () => {
		expect(resolveDefaultTemplate(entries, settings('a'))?.id).toBe('b');
		expect(resolveDefaultTemplate(entries, settings('zzz'))?.id).toBe('b');
		expect(resolveDefaultTemplate(entries, settings(null))?.id).toBe('b');
	});

	test('tudo oculto cai no primeiro; lista vazia não tem padrão', () => {
		const hidden = [entry('a', {hidden: true}), entry('b', {hidden: true})];
		expect(resolveDefaultTemplate(hidden, settings(null))?.id).toBe('a');
		expect(resolveDefaultTemplate([], settings(null))).toBeUndefined();
	});
});
