import {describe, expect, it} from 'vitest';
import {EMPTY_SETTINGS} from '#lib/domain/catalog/index.ts';
import type {CatalogSettings} from '#lib/domain/catalog/index.ts';
import {definition} from '../../testing/fakes.ts';
import {NO_FILTER, buildRows, filterRows, summarize} from './rows.ts';

const definitions = [
	definition('a', {name: 'Café Royal', category: 'Lettering'}),
	definition('b', {name: 'Beta', category: 'Selos'}),
	definition('c', {name: 'Gamma', category: 'Emblemas'})
];
const settings: CatalogSettings = {
	...EMPTY_SETTINGS,
	defaultTemplate: 'b',
	templates: {a: {hidden: true}, c: {featured: true, name: 'Terceiro'}}
};

describe('buildRows', () => {
	const rows = buildRows(definitions, settings);

	it('numera pela posição final e marca o que foi personalizado', () => {
		expect(rows.map((row) => [row.entry.id, row.number, row.customized])).toEqual([
			['a', 1, true],
			['b', 2, false],
			['c', 3, true]
		]);
		expect(rows[2].originalName).toBe('Gamma');
	});

	it('resume totais e o modelo padrão efetivo', () => {
		const summary = summarize(rows, 'b');
		expect(summary).toMatchObject({total: 3, visible: 2, hidden: 1, featured: 1});
		expect(summary.defaultEntry?.id).toBe('b');
		expect(summary.defaultIsHidden).toBe(false);
	});

	it('avisa quando o padrão escolhido está oculto e cai no primeiro visível', () => {
		const summary = summarize(rows, 'a');
		expect(summary.defaultIsHidden).toBe(true);
		expect(summary.defaultEntry?.id).toBe('b');
	});
});

describe('filterRows', () => {
	const rows = buildRows(definitions, settings);
	const ids = (filter: Partial<typeof NO_FILTER>) =>
		filterRows(rows, {...NO_FILTER, ...filter}).map((row) => row.entry.id);

	it('sem filtro devolve tudo', () => expect(ids({})).toEqual(['a', 'b', 'c']));
	it('filtra por categoria', () => expect(ids({category: 'Selos'})).toEqual(['b']));
	it('filtra por situação', () => {
		expect(ids({status: 'visiveis'})).toEqual(['b', 'c']);
		expect(ids({status: 'ocultos'})).toEqual(['a']);
		expect(ids({status: 'destaques'})).toEqual(['c']);
	});
	it('busca por nome atual, nome original e id, sem acento nem caixa', () => {
		expect(ids({query: 'cafe'})).toEqual(['a']);
		expect(ids({query: 'GAMMA'})).toEqual(['c']);
		expect(ids({query: 'tercei'})).toEqual(['c']);
		expect(ids({query: ' b '})).toEqual(['b']);
	});
	it('combina os filtros', () => expect(ids({status: 'visiveis', query: 'be'})).toEqual(['b']));
});
