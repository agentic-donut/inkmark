import {CUSTOM_FONT_ID, DEFAULT_CONFIG, LIMITS, type NumericLimit} from './defaults';
import type {EffectLevel, LogoConfig, Ornament} from './types';

export interface SanitizeContext {
	templateIds: readonly string[];
	fontIds: readonly string[];
	/** A fonte 'custom' só vale quando o usuário importou uma nesta sessão. */
	customFontAvailable?: boolean;
}

const ORNAMENTS: readonly Ornament[] = ['none', 'stars', 'diamond', 'mountain'];
const EFFECT_LEVELS: readonly EffectLevel[] = [0, 1, 2, 3];

function asRecord(raw: unknown): Record<string, unknown> {
	return typeof raw === 'object' && raw !== null && !Array.isArray(raw)
		? (raw as Record<string, unknown>)
		: {};
}

type EffectKey = 'halftone' | 'pressure' | 'bleed';

/**
 * Configurações antigas guardavam um único acabamento (`finish`). Cada valor vira o nível equivalente
 * do efeito que o substituiu (a retícula no nível forte, que são os parâmetros aprovados na época);
 * `none` e valores desconhecidos não ligam nada.
 */
const LEGACY_FINISH = new Map<unknown, Partial<Record<EffectKey, EffectLevel>>>([
	['halftone', {halftone: 3}],
	['pressure', {pressure: 3}],
	['bleed-light', {bleed: 1}],
	['bleed-medium', {bleed: 2}],
	['bleed-strong', {bleed: 3}]
]);

/**
 * Troca o `finish` antigo pelos efeitos novos, sem sobrescrever um efeito que já exista.
 * Roda antes de qualquer mesclagem com o padrão, que também traz os efeitos (em 0) e esconderia a migração.
 */
export function migrateLegacyConfig(raw: unknown): Record<string, unknown> {
	const {finish, ...rest} = asRecord(raw);
	const legacy = LEGACY_FINISH.get(finish) ?? {};
	return {...legacy, ...rest};
}

function text(value: unknown, fallback: string, maxLength: number): string {
	return typeof value === 'string' ? value.slice(0, maxLength) : fallback;
}

function clampedNumber(value: unknown, fallback: number, limit: NumericLimit): number {
	if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
	return Math.min(limit.max, Math.max(limit.min, value));
}

function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
	return allowed.includes(value as T) ? (value as T) : fallback;
}

function isKnownFont(font: string, ctx: SanitizeContext): boolean {
	if (font === CUSTOM_FONT_ID) return ctx.customFontAvailable === true;
	return ctx.fontIds.includes(font);
}

/** Aceita qualquer coisa (localStorage, formulário) e devolve uma configuração válida. */
export function sanitizeConfig(raw: unknown, ctx: SanitizeContext): LogoConfig {
	const input = migrateLegacyConfig(raw);
	const templateKnown =
		typeof input.template === 'string' && ctx.templateIds.includes(input.template);

	// Modelo desconhecido volta ao padrão inteiro, fonte incluída, como na versão original.
	const template = templateKnown ? (input.template as string) : DEFAULT_CONFIG.template;
	const requestedFont = templateKnown ? input.font : DEFAULT_CONFIG.font;
	const font =
		typeof requestedFont === 'string' && isKnownFont(requestedFont, ctx)
			? requestedFont
			: DEFAULT_CONFIG.font;

	return {
		name: text(input.name, DEFAULT_CONFIG.name, LIMITS.nameLength),
		tagline: text(input.tagline, DEFAULT_CONFIG.tagline, LIMITS.taglineLength),
		topline: text(input.topline, DEFAULT_CONFIG.topline, LIMITS.toplineLength),
		font,
		template,
		ornament: oneOf(input.ornament, ORNAMENTS, DEFAULT_CONFIG.ornament),
		size: clampedNumber(input.size, DEFAULT_CONFIG.size, LIMITS.size),
		spacing: clampedNumber(input.spacing, DEFAULT_CONFIG.spacing, LIMITS.spacing),
		tilt: clampedNumber(input.tilt, DEFAULT_CONFIG.tilt, LIMITS.tilt),
		wear: oneOf(input.wear, EFFECT_LEVELS, DEFAULT_CONFIG.wear),
		halftone: oneOf(input.halftone, EFFECT_LEVELS, 0),
		pressure: oneOf(input.pressure, EFFECT_LEVELS, 0),
		bleed: oneOf(input.bleed, EFFECT_LEVELS, 0)
	};
}
