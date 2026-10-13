/** Textos do rodapé de páginas. Quem usa fora do site público (o admin) fica com o português. */
export interface PageFolioLabels {
	previous: string;
	goTo: (page: number) => string;
	current: (page: number, pageCount: number) => string;
	pageNumber: (page: number) => string;
	/** "Continua na página 3 →"; some em tela estreita, onde fica só `nextShort`. */
	nextLong: (page: number) => string;
	nextShort: (page: number) => string;
	end: string;
}

export const DEFAULT_PAGE_FOLIO_LABELS: PageFolioLabels = {
	previous: '← Página anterior',
	goTo: (page) => `Ir para a página ${page}`,
	current: (page, pageCount) => `Página ${page} de ${pageCount}`,
	pageNumber: (page) => `Página ${page}`,
	nextLong: (page) => `Continua\u00a0na\u00a0página ${page} →`,
	nextShort: (page) => `página ${page} →`,
	end: 'Fim da edição'
};
