import type {EffectKey, EffectSettings} from '#lib/domain/logo/index.ts';
import {m} from '#lib/paraglide/messages.js';
import {getLocale, type Locale} from '#lib/paraglide/runtime.js';

type Phrase = typeof m.caption_wear_1;
type Phrases = Readonly<Record<1 | 2 | 3, Phrase>>;

/** Na ordem em que a legenda os cita (a mesma dos seletores). Nível 0 não aparece. */
const PHRASES: readonly (readonly [EffectKey, Phrases])[] = [
	['wear', {1: m.caption_wear_1, 2: m.caption_wear_2, 3: m.caption_wear_3}],
	['halftone', {1: m.caption_halftone_1, 2: m.caption_halftone_2, 3: m.caption_halftone_3}],
	['pressure', {1: m.caption_pressure_1, 2: m.caption_pressure_2, 3: m.caption_pressure_3}],
	['bleed', {1: m.caption_bleed_1, 2: m.caption_bleed_2, 3: m.caption_bleed_3}]
];

/** Legenda da foto de capa, no tom de reportagem. Sem `locale`, vale o idioma da página. */
export function captionText(
	brandName: string,
	templateName: string,
	effects: EffectSettings,
	locale?: Locale
): string {
	const options = locale ? {locale} : undefined;
	const active = PHRASES.flatMap(([key, phrases]) => {
		const level = effects[key];
		return level ? [phrases[level]({}, options)] : [];
	});
	const list = new Intl.ListFormat(locale ?? getLocale(), {style: 'long', type: 'conjunction'});
	const phrase = active.length
		? m.caption_with({effects: list.format(active)}, options)
		: m.caption_effects_none({}, options);
	const brand = brandName.trim();
	return brand
		? m.caption_named({brand, template: templateName, effects: phrase}, options)
		: m.caption_unnamed({template: templateName, effects: phrase}, options);
}
