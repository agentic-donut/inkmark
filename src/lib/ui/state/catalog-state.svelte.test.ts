import {flushSync} from 'svelte';
import {describe, expect, test} from 'vitest';
import {EMPTY_SETTINGS} from '../../domain/catalog/catalog';
import {definition} from '../../testing/fakes';
import {CLASSIFIEDS_PAGE_SIZE, CatalogState} from './catalog-state.svelte';

const definitions = [
	definition('a'),
	definition('b', {category: 'Selos'}),
	definition('c', {category: 'Selos'}),
	definition('d', {category: 'Emblemas'})
];
const settings = {
	defaultTemplate: 'c',
	templates: {b: {hidden: true}, d: {order: 0}},
	updatedAt: null
};

describe('CatalogState', () => {
	test('mescla definições e configurações', () => {
		const state = new CatalogState(definitions, settings);
		expect(state.entries.map((e) => e.id)).toEqual(['d', 'a', 'b', 'c']);
		expect(state.visible.map((e) => e.id)).toEqual(['d', 'a', 'c']);
		expect(state.defaultTemplate?.id).toBe('c');
	});

	test('valores iniciais: todos os modelos e o nome do usuário', () => {
		const state = new CatalogState(definitions, EMPTY_SETTINGS);
		expect(state.category).toBe('Todos');
		expect(state.useMyName).toBe(true);
		expect(state.filtered).toHaveLength(4);
	});

	test('contagens só consideram os visíveis', () => {
		const state = new CatalogState(definitions, settings);
		expect(state.counts).toEqual({Todos: 3, Lettering: 1, Selos: 1, Emblemas: 1});
	});

	test('o filtro de categoria reage à mudança', () => {
		const state = new CatalogState(definitions, settings);
		state.setCategory('Selos');
		expect(state.filtered.map((e) => e.id)).toEqual(['c']);
		state.setCategory('Todos');
		expect(state.filtered).toHaveLength(3);
	});

	test('alterna o uso do nome do usuário', () => {
		const state = new CatalogState(definitions, settings);
		state.setUseMyName(false);
		expect(state.useMyName).toBe(false);
	});

	test('as runes notificam quando o filtro muda', () => {
		const state = new CatalogState(definitions, settings);
		const seen: number[] = [];
		const stop = $effect.root(() => {
			$effect(() => void seen.push(state.filtered.length));
		});
		flushSync();
		state.setCategory('Selos');
		flushSync();
		stop();
		expect(seen).toEqual([3, 1]);
	});

	describe('paginação', () => {
		const many = Array.from({length: CLASSIFIEDS_PAGE_SIZE * 2 + 5}, (_, index) =>
			definition(`m${index}`, {category: index % 2 ? 'Selos' : 'Lettering'})
		);

		test('mostra uma página por vez', () => {
			const state = new CatalogState(many, EMPTY_SETTINGS);
			expect(state.paged.items).toHaveLength(CLASSIFIEDS_PAGE_SIZE);
			expect(state.paged).toMatchObject({page: 1, pageCount: 3, total: many.length});
			state.setPage(3);
			expect(state.paged.items.map((e) => e.id)).toEqual(
				many.slice(CLASSIFIEDS_PAGE_SIZE * 2).map((e) => e.id)
			);
		});

		test('começa na página pedida e ajusta o que passa do fim', () => {
			expect(new CatalogState(many, EMPTY_SETTINGS, 2).paged.page).toBe(2);
			expect(new CatalogState(many, EMPTY_SETTINGS, 99).paged.page).toBe(3);
			expect(new CatalogState(many, EMPTY_SETTINGS, -1).paged.page).toBe(1);
		});

		test('trocar de categoria ou do uso do nome volta à página 1', () => {
			const state = new CatalogState(many, EMPTY_SETTINGS, 3);
			state.setCategory('Selos');
			expect(state.paged.page).toBe(1);
			state.setPage(2);
			state.setUseMyName(false);
			expect(state.paged.page).toBe(1);
		});

		test('lista vazia fica na página 1', () => {
			const state = new CatalogState(many, EMPTY_SETTINGS, 2);
			state.setCategory('Emblemas');
			expect(state.paged).toMatchObject({page: 1, pageCount: 1, items: []});
		});
	});
});
