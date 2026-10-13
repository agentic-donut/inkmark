import type {CatalogEntry} from '../domain/catalog/types';
import {sampleText} from '../domain/catalog/samples';
import {DEFAULT_CONFIG} from '../domain/editor/defaults';
import type {LogoConfig} from '../domain/editor/types';

const FALLBACK_NAME = DEFAULT_CONFIG.name;

/**
 * Configuração usada nos cards e na prancha: tamanho, espaçamento e inclinação fixos,
 * fonte e ornamento do modelo, textos da marca do usuário ou os de exemplo.
 */
export function cardConfig(
	entry: CatalogEntry,
	config: LogoConfig,
	useMyName: boolean
): LogoConfig {
	const text = useMyName
		? {name: config.name || FALLBACK_NAME, topline: config.topline, tagline: config.tagline}
		: sampleText(entry);
	return {
		...config,
		...text,
		template: entry.id,
		font: entry.font,
		ornament: entry.ornament ?? config.ornament,
		size: 100,
		spacing: 0,
		tilt: -6
	};
}
