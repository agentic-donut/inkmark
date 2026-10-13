/** Uma página de uma lista maior: os itens dela e onde ela está no conjunto. */
export interface Page<T> {
	items: T[];
	/** Página efetiva (1-based), já ajustada aos limites. */
	page: number;
	/** Sempre ao menos 1: uma lista vazia ainda tem a página 1. */
	pageCount: number;
	total: number;
	pageSize: number;
	/** Posição (1-based) do primeiro e do último item na lista inteira; 0 quando a lista é vazia. */
	first: number;
	last: number;
}

/** Nome do parâmetro de URL que guarda a página atual (`?pagina=2`); o mesmo em todos os idiomas. */
export const PAGE_PARAM = 'pagina';

export function pageCountOf(total: number, pageSize: number): number {
	return Math.max(1, Math.ceil(total / pageSize));
}

/** Aceita qualquer número e devolve uma página válida; lixo (NaN, fração, fora do intervalo) vira o limite mais próximo. */
export function clampPage(page: number, pageCount: number): number {
	if (!Number.isFinite(page)) return 1;
	return Math.min(Math.max(Math.trunc(page), 1), Math.max(pageCount, 1));
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): Page<T> {
	if (!Number.isInteger(pageSize) || pageSize < 1) {
		throw new RangeError(`Tamanho de página inválido: ${pageSize}`);
	}
	const pageCount = pageCountOf(items.length, pageSize);
	const current = clampPage(page, pageCount);
	const start = (current - 1) * pageSize;
	const slice = items.slice(start, start + pageSize);
	return {
		items: slice,
		page: current,
		pageCount,
		total: items.length,
		pageSize,
		first: slice.length ? start + 1 : 0,
		last: start + slice.length
	};
}

/** Página (1-based) em que o item de índice `index` (0-based) cai. */
export function pageOfIndex(index: number, pageSize: number): number {
	return Math.floor(index / pageSize) + 1;
}

/** Lê o número de página de um texto vindo da URL; qualquer coisa que não seja um inteiro positivo vira 1. */
export function parsePage(raw: string | null | undefined): number {
	if (!raw || !/^\d{1,6}$/.test(raw.trim())) return 1;
	return Math.max(Number(raw), 1);
}

export const ELLIPSIS = '…';
export type PageLink = number | typeof ELLIPSIS;

/**
 * Números de página para os links do rodapé: sempre a primeira, a última e a vizinhança da atual.
 * Uma lacuna de uma só página mostra a página em vez de reticências, que ocupariam o mesmo espaço.
 */
export function pageLinks(page: number, pageCount: number, siblings = 1): PageLink[] {
	const current = clampPage(page, pageCount);
	const wanted = new Set<number>([1, pageCount]);
	for (let n = current - siblings; n <= current + siblings; n++) {
		if (n >= 1 && n <= pageCount) wanted.add(n);
	}
	const sorted = [...wanted].sort((a, b) => a - b);
	const links: PageLink[] = [];
	sorted.forEach((n, index) => {
		const previous = sorted[index - 1];
		if (previous !== undefined) {
			if (n - previous === 2) links.push(previous + 1);
			else if (n - previous > 2) links.push(ELLIPSIS);
		}
		links.push(n);
	});
	return links;
}
