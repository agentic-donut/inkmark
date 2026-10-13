import type {
	CatalogEntry,
	CatalogSettings,
	Category,
	TemplateDefinition,
	TemplateSettings
} from './types';

export const ALL_CATEGORIES = 'Todos';
export type CategoryFilter = Category | typeof ALL_CATEGORIES;

export const CATEGORIES: readonly Category[] = ['Lettering', 'Selos', 'Emblemas'];

export const EMPTY_SETTINGS: Readonly<CatalogSettings> = Object.freeze({
	defaultTemplate: null,
	templates: Object.freeze({}) as Record<string, TemplateSettings>,
	updatedAt: null
});

interface Indexed {
	definition: TemplateDefinition;
	position: number;
	explicitOrder: number | undefined;
}

function byOrder(a: Indexed, b: Indexed): number {
	if (a.explicitOrder !== undefined && b.explicitOrder !== undefined) {
		return a.explicitOrder - b.explicitOrder || a.position - b.position;
	}
	if (a.explicitOrder !== undefined) return -1;
	if (b.explicitOrder !== undefined) return 1;
	return a.position - b.position;
}

/**
 * Aplica as configurações do admin às definições do código.
 * Modelos com `order` explícito vêm primeiro, em ordem crescente; os demais seguem a ordem
 * das definições. O `order` devolvido é a posição final (0, 1, 2…).
 */
export function mergeCatalog(
	definitions: readonly TemplateDefinition[],
	settings: CatalogSettings
): CatalogEntry[] {
	return definitions
		.map<Indexed>((definition, position) => ({
			definition,
			position,
			explicitOrder: settings.templates[definition.id]?.order
		}))
		.sort(byOrder)
		.map(({definition}, index) => {
			const override = settings.templates[definition.id] ?? {};
			return {
				...definition,
				name: override.name ?? definition.name,
				category: override.category ?? definition.category,
				hidden: override.hidden ?? false,
				featured: override.featured ?? false,
				order: index
			};
		});
}

export function visibleEntries(entries: readonly CatalogEntry[]): CatalogEntry[] {
	return entries.filter((entry) => !entry.hidden);
}

export function filterByCategory(
	entries: readonly CatalogEntry[],
	category: CategoryFilter
): CatalogEntry[] {
	return category === ALL_CATEGORIES
		? [...entries]
		: entries.filter((entry) => entry.category === category);
}

export function countByCategory(entries: readonly CatalogEntry[]): Record<CategoryFilter, number> {
	const counts: Record<CategoryFilter, number> = {
		[ALL_CATEGORIES]: entries.length,
		Lettering: 0,
		Selos: 0,
		Emblemas: 0
	};
	for (const entry of entries) counts[entry.category] += 1;
	return counts;
}

/** Modelo inicial do editor: o escolhido no admin se estiver visível, senão o primeiro visível. */
export function resolveDefaultTemplate(
	entries: readonly CatalogEntry[],
	settings: CatalogSettings
): CatalogEntry | undefined {
	const visible = visibleEntries(entries);
	const chosen = visible.find((entry) => entry.id === settings.defaultTemplate);
	return chosen ?? visible[0] ?? entries[0];
}
