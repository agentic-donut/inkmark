import {ALL_CATEGORIES, mergeCatalog} from '#lib/domain/catalog/index.ts';
import type {
	CatalogEntry,
	CatalogSettings,
	CategoryFilter,
	TemplateDefinition
} from '#lib/domain/catalog/index.ts';

/** Uma linha da lista do admin: o modelo já mesclado, com o que mudou em relação ao código. */
export interface AdminRow {
	entry: CatalogEntry;
	number: number;
	originalName: string;
	originalCategory: CatalogEntry['category'];
	customized: boolean;
}

export type StatusFilter = 'todos' | 'visiveis' | 'ocultos' | 'destaques';

export interface RowFilter {
	category: CategoryFilter;
	status: StatusFilter;
	query: string;
}

export const NO_FILTER: Readonly<RowFilter> = Object.freeze({
	category: ALL_CATEGORIES,
	status: 'todos',
	query: ''
});

export function buildRows(
	definitions: readonly TemplateDefinition[],
	settings: CatalogSettings
): AdminRow[] {
	const originals = new Map(definitions.map((definition) => [definition.id, definition]));
	return mergeCatalog(definitions, settings).map((entry) => {
		const original = originals.get(entry.id)!;
		return {
			entry,
			number: entry.order + 1,
			originalName: original.name,
			originalCategory: original.category,
			customized:
				entry.name !== original.name ||
				entry.category !== original.category ||
				entry.hidden ||
				entry.featured
		};
	});
}

export interface Summary {
	total: number;
	visible: number;
	hidden: number;
	featured: number;
	/** O modelo que o site realmente abre: o escolhido, se visível, ou o primeiro visível. */
	defaultEntry: CatalogEntry | undefined;
	/** O padrão escolhido existe mas está oculto, então o site usa outro. */
	defaultIsHidden: boolean;
}

export function summarize(rows: readonly AdminRow[], defaultTemplate: string | null): Summary {
	const chosen = rows.find((row) => row.entry.id === defaultTemplate)?.entry;
	const hidden = rows.filter((row) => row.entry.hidden).length;
	const firstVisible = rows.find((row) => !row.entry.hidden)?.entry;
	return {
		total: rows.length,
		hidden,
		visible: rows.length - hidden,
		featured: rows.filter((row) => row.entry.featured).length,
		defaultEntry: chosen && !chosen.hidden ? chosen : firstVisible,
		defaultIsHidden: Boolean(chosen?.hidden)
	};
}

function normalize(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

const STATUS_TESTS: Record<StatusFilter, (entry: CatalogEntry) => boolean> = {
	todos: () => true,
	visiveis: (entry) => !entry.hidden,
	ocultos: (entry) => entry.hidden,
	destaques: (entry) => entry.featured
};

export function filterRows(rows: readonly AdminRow[], filter: RowFilter): AdminRow[] {
	const query = normalize(filter.query.trim());
	return rows.filter(({entry, originalName}) => {
		if (filter.category !== ALL_CATEGORIES && entry.category !== filter.category) return false;
		if (!STATUS_TESTS[filter.status](entry)) return false;
		if (!query) return true;
		return [entry.name, originalName, entry.id].some((text) => normalize(text).includes(query));
	});
}
