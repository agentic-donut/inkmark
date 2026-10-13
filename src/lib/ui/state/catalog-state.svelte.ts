import {
	countByCategory,
	filterByCategory,
	mergeCatalog,
	resolveDefaultTemplate,
	visibleEntries,
	type CategoryFilter
} from '../../domain/catalog/catalog';
import type {CatalogEntry, CatalogSettings, TemplateDefinition} from '../../domain/catalog/types';
import {paginate, type Page} from '../../domain/pagination/pagination';

/** Anúncios por página dos classificados. */
export const CLASSIFIEDS_PAGE_SIZE = 24;

export class CatalogState {
	category = $state<CategoryFilter>('Todos');
	useMyName = $state(true);
	/** Página pedida; a página efetiva (`paged.page`) já vem ajustada aos limites da lista. */
	page = $state(1);

	readonly entries: CatalogEntry[];
	readonly visible: CatalogEntry[];
	readonly counts: Record<CategoryFilter, number>;
	readonly defaultTemplate: CatalogEntry | undefined;
	readonly filtered: CatalogEntry[];
	readonly paged: Page<CatalogEntry>;

	constructor(
		definitions: readonly TemplateDefinition[],
		settings: CatalogSettings,
		initialPage = 1
	) {
		this.page = initialPage;
		this.entries = mergeCatalog(definitions, settings);
		this.visible = visibleEntries(this.entries);
		this.counts = countByCategory(this.visible);
		this.defaultTemplate = resolveDefaultTemplate(this.entries, settings);
		this.filtered = $derived(filterByCategory(this.visible, this.category));
		this.paged = $derived(paginate(this.filtered, this.page, CLASSIFIEDS_PAGE_SIZE));
	}

	setCategory(category: CategoryFilter): void {
		this.category = category;
		this.page = 1;
	}

	setUseMyName(value: boolean): void {
		this.useMyName = value;
		this.page = 1;
	}

	setPage(page: number): void {
		this.page = page;
	}
}
