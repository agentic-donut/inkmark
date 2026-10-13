import type {Variant} from '../domain/catalog/types';
import type {LogoConfig} from '../domain/editor/types';
import type {EffectSettings} from '../domain/logo/effects';
import type {LogoRenderer} from './ports';

/** O que o renderizador precisa do motor; a fachada `domain/logo` já satisfaz este formato. */
export interface InkEngine {
	renderLogo(config: Partial<LogoConfig>, variant: Variant, background: boolean): string;
	/** Retícula, tinta espalhada, pressão desigual e desgaste, nesta ordem fixa (a ordem é do domínio). */
	applyEffects(svg: string, settings: EffectSettings): string;
}

/** Toda logo do app (prévia, cards e exportação) sai com os efeitos de impressão escolhidos. */
export function createInkRenderer(engine: InkEngine): LogoRenderer {
	return {
		render(config, variant, options) {
			const svg = engine.renderLogo(config, variant, options?.background ?? true);
			const {halftone, bleed, pressure, wear} = config;
			return engine.applyEffects(svg, {halftone, bleed, pressure, wear});
		}
	};
}
