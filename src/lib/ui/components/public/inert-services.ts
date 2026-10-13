import type {ClientServices} from '#lib/ui/composition.ts';

/**
 * Serviços do servidor: o SSR só entrega a página com espaços reservados, então nada aqui desenha,
 * baixa ou grava. As logos nascem no navegador, depois que as fontes carregam.
 */
export const inertServices: ClientServices = {
	renderer: {render: () => ''},
	fontLoader: {loadBundled: () => new Promise<void>(() => {}), registerCustom: () => {}},
	store: {load: () => null, save: () => {}},
	exporter: {
		svgToPng: () => Promise.reject(new Error('Indisponível no servidor.')),
		zip: () => Promise.reject(new Error('Indisponível no servidor.')),
		download: () => {}
	}
};
