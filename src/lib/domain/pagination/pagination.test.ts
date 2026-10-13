import {describe, expect, test} from 'vitest';
import {
	ELLIPSIS,
	clampPage,
	pageCountOf,
	pageLinks,
	pageOfIndex,
	paginate,
	parsePage
} from './pagination';

const numbers = (count: number) => Array.from({length: count}, (_, index) => index + 1);

describe('pageCountOf', () => {
	test('arredonda para cima e nunca é menor que 1', () => {
		expect(pageCountOf(0, 24)).toBe(1);
		expect(pageCountOf(24, 24)).toBe(1);
		expect(pageCountOf(25, 24)).toBe(2);
		expect(pageCountOf(228, 24)).toBe(10);
	});
});

describe('clampPage', () => {
	test('mantém páginas válidas e ajusta as demais', () => {
		expect(clampPage(3, 5)).toBe(3);
		expect(clampPage(0, 5)).toBe(1);
		expect(clampPage(-4, 5)).toBe(1);
		expect(clampPage(99, 5)).toBe(5);
		expect(clampPage(2.9, 5)).toBe(2);
		expect(clampPage(Number.NaN, 5)).toBe(1);
		expect(clampPage(Number.POSITIVE_INFINITY, 5)).toBe(1);
	});
});

describe('paginate', () => {
	test('fatia a página pedida', () => {
		const page = paginate(numbers(60), 2, 24);
		expect(page.items).toEqual(numbers(60).slice(24, 48));
		expect(page).toMatchObject({page: 2, pageCount: 3, total: 60, first: 25, last: 48});
	});

	test('a última página traz o resto', () => {
		const page = paginate(numbers(60), 3, 24);
		expect(page.items).toHaveLength(12);
		expect(page).toMatchObject({first: 49, last: 60});
	});

	test('página fora do intervalo vira a mais próxima', () => {
		expect(paginate(numbers(60), 99, 24).page).toBe(3);
		expect(paginate(numbers(60), 0, 24).page).toBe(1);
		expect(paginate(numbers(60), Number.NaN, 24).page).toBe(1);
	});

	test('lista vazia tem uma página vazia', () => {
		expect(paginate([], 1, 24)).toEqual({
			items: [],
			page: 1,
			pageCount: 1,
			total: 0,
			pageSize: 24,
			first: 0,
			last: 0
		});
		expect(paginate([], 7, 24).page).toBe(1);
	});

	test('lista que cabe numa página', () => {
		const page = paginate(numbers(24), 1, 24);
		expect(page.pageCount).toBe(1);
		expect(page.items).toHaveLength(24);
	});

	test('não altera a lista original', () => {
		const original = numbers(30);
		paginate(original, 2, 10).items.push(0);
		expect(original).toHaveLength(30);
	});

	test('recusa tamanho de página inválido', () => {
		expect(() => paginate([1], 1, 0)).toThrow(RangeError);
		expect(() => paginate([1], 1, 2.5)).toThrow(RangeError);
	});
});

describe('pageOfIndex', () => {
	test('acha a página de um item pelo índice', () => {
		expect(pageOfIndex(0, 50)).toBe(1);
		expect(pageOfIndex(49, 50)).toBe(1);
		expect(pageOfIndex(50, 50)).toBe(2);
		expect(pageOfIndex(227, 50)).toBe(5);
	});
});

describe('parsePage', () => {
	test('lê inteiros positivos', () => {
		expect(parsePage('4')).toBe(4);
		expect(parsePage(' 12 ')).toBe(12);
	});
	test('o resto vira 1', () => {
		for (const raw of [null, undefined, '', '0', '-2', '1.5', 'abc', '3x', '9999999']) {
			expect(parsePage(raw)).toBe(1);
		}
	});
});

describe('pageLinks', () => {
	test('poucas páginas aparecem todas', () => {
		expect(pageLinks(1, 1)).toEqual([1]);
		expect(pageLinks(2, 5)).toEqual([1, 2, 3, 4, 5]);
	});

	test('muitas páginas: reticências dos dois lados', () => {
		expect(pageLinks(5, 10)).toEqual([1, ELLIPSIS, 4, 5, 6, ELLIPSIS, 10]);
	});

	test('perto das pontas só tem reticências do lado distante', () => {
		expect(pageLinks(1, 10)).toEqual([1, 2, ELLIPSIS, 10]);
		expect(pageLinks(10, 10)).toEqual([1, ELLIPSIS, 9, 10]);
		expect(pageLinks(3, 10)).toEqual([1, 2, 3, 4, ELLIPSIS, 10]);
		expect(pageLinks(8, 10)).toEqual([1, ELLIPSIS, 7, 8, 9, 10]);
	});

	test('lacuna de uma página mostra a página em vez de reticências', () => {
		expect(pageLinks(4, 10)).toEqual([1, 2, 3, 4, 5, ELLIPSIS, 10]);
		expect(pageLinks(7, 10)).toEqual([1, ELLIPSIS, 6, 7, 8, 9, 10]);
	});

	test('página fora do intervalo é ajustada', () => {
		expect(pageLinks(99, 10)).toEqual([1, ELLIPSIS, 9, 10]);
	});
});
