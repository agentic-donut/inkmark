import {describe, expect, it} from 'vitest';
import {
	parseBoolean,
	parseCategory,
	parseDirection,
	parseName,
	parseTemplateId,
	parseTemplateIds
} from './input.ts';

function form(entries: [string, string | Blob][]): FormData {
	const data = new FormData();
	for (const [key, value] of entries) data.append(key, value);
	return data;
}
const known = new Set(['a', 'b']);

describe('validação das entradas do admin', () => {
	it('aceita só ids conhecidos', () => {
		expect(parseTemplateId(form([['id', 'a']]), known)).toEqual({ok: true, value: 'a'});
		expect(parseTemplateId(form([['id', 'zzz']]), known).ok).toBe(false);
		expect(parseTemplateId(form([]), known).ok).toBe(false);
		expect(parseTemplateId(form([['id', new Blob(['a'])]]), known).ok).toBe(false);
		expect(parseTemplateId(form([['id', 'constructor']]), known).ok).toBe(false);
	});

	it('valida a lista de ids e remove repetidos', () => {
		expect(
			parseTemplateIds(
				form([
					['ids', 'a'],
					['ids', 'b'],
					['ids', 'a']
				]),
				known
			)
		).toEqual({ok: true, value: ['a', 'b']});
		expect(parseTemplateIds(form([]), known).ok).toBe(false);
		expect(
			parseTemplateIds(
				form([
					['ids', 'a'],
					['ids', 'x']
				]),
				known
			).ok
		).toBe(false);
	});

	it('aceita só "true" e "false"', () => {
		expect(parseBoolean(form([['hidden', 'true']]), 'hidden')).toEqual({ok: true, value: true});
		expect(parseBoolean(form([['hidden', 'false']]), 'hidden')).toEqual({ok: true, value: false});
		expect(parseBoolean(form([['hidden', '1']]), 'hidden').ok).toBe(false);
	});

	it('limita o nome a 60 caracteres e apara espaços', () => {
		expect(parseName(form([['name', '  Olá  ']]))).toEqual({ok: true, value: 'Olá'});
		expect(parseName(form([['name', '']]))).toEqual({ok: true, value: ''});
		expect(parseName(form([['name', 'x'.repeat(60)]])).ok).toBe(true);
		expect(parseName(form([['name', 'x'.repeat(61)]])).ok).toBe(false);
		expect(parseName(form([])).ok).toBe(false);
	});

	it('valida categoria e direção', () => {
		expect(parseCategory(form([['category', 'Selos']])).ok).toBe(true);
		expect(parseCategory(form([['category', 'Outra']])).ok).toBe(false);
		expect(parseDirection(form([['direction', 'up']])).ok).toBe(true);
		expect(parseDirection(form([['direction', 'left']])).ok).toBe(false);
	});
});
