import {m} from '#lib/paraglide/messages.js';
import type {PageFolioLabels} from '#lib/ui/components/shared/page-folio-labels.ts';

/** Rótulos do rodapé de páginas no idioma da página aberta. */
export function pageFolioLabels(): PageFolioLabels {
	return {
		previous: m.pagefolio_previous(),
		goTo: (page) => m.pagefolio_go_to({page}),
		current: (page, pageCount) => m.pagefolio_current({page, pageCount}),
		pageNumber: (page) => m.pagefolio_page_label({page}),
		nextLong: (page) => m.pagefolio_next_long({page}),
		nextShort: (page) => m.pagefolio_next_short({page}),
		end: m.pagefolio_end()
	};
}
