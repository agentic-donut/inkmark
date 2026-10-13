// Raiz de composição do navegador: o único lugar que liga as portas aos adaptadores concretos.
// Site público e admin pegam os serviços daqui; nenhum componente cria adaptador por conta própria.
import type {ConfigStore, FileExporter, FontLoader, LogoRenderer} from '#lib/application/ports.ts';
import {createInkRenderer} from '#lib/application/renderer.ts';
import {applyEffects, fonts, registerFont, renderLogo} from '#lib/domain/logo/index.ts';
import {BrowserFileExporter, browserDeps} from '#lib/infrastructure/browser-file-exporter.ts';
import {FetchFontLoader} from '#lib/infrastructure/fetch-font-loader.ts';
import {LocalStorageConfigStore} from '#lib/infrastructure/local-storage-config-store.ts';

export interface ClientServices {
	renderer: LogoRenderer;
	fontLoader: FontLoader;
	store: ConfigStore;
	exporter: FileExporter;
}

let services: ClientServices | undefined;

/** Cria os serviços uma vez por página. Só pode ser chamado no navegador. */
export function clientServices(): ClientServices {
	services ??= {
		renderer: createInkRenderer({renderLogo, applyEffects}),
		fontLoader: onceFontLoader(
			new FetchFontLoader({fetch: (url) => fetch(url), fonts, registerFont})
		),
		store: new LocalStorageConfigStore(safeLocalStorage()),
		exporter: new BrowserFileExporter(browserDeps())
	};
	return services;
}

/** As fontes do motor são globais: carregar duas vezes só desperdiça rede. */
function onceFontLoader(loader: FontLoader): FontLoader {
	let loading: Promise<void> | undefined;
	return {
		// Se falhar, esquece a tentativa para que "tentar de novo" volte à rede.
		loadBundled: () =>
			(loading ??= loader.loadBundled().catch((error: unknown) => {
				loading = undefined;
				throw error;
			})),
		registerCustom: (data) => loader.registerCustom(data)
	};
}

function safeLocalStorage(): Storage | null {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
