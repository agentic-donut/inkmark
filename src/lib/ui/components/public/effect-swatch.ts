import {applyEffects, wearFilter, type EffectKey} from '#lib/domain/logo/index.ts';
import type {EffectLevel} from '#lib/domain/editor/index.ts';

// Mesma semente do desgaste aplicado às logos: o carimbo de amostra desgasta como a marca.
const WEAR_SEED = 7;

// Amostra nas coordenadas da logo (600×500), porque os efeitos medem tudo nelas:
// um bloco maciço (mostra pontos, cantos e o lado gasto), uma barra e um fio (mostram o que resiste).
const SAMPLE =
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="240 186 120 110" aria-hidden="true">` +
	`<g fill="currentColor" color="currentColor">` +
	`<rect x="252" y="196" width="96" height="52"/><rect x="252" y="260" width="96" height="12"/><rect x="252" y="282" width="96" height="3"/>` +
	`</g></svg>`;

/** Um carimbo redondo maciço desenhado com o filtro de desgaste do nível (o visual da Tinta). */
function wearSwatch(level: EffectLevel): string {
	const filter = level ? wearFilter(level, WEAR_SEED) : '';
	const attribute = level ? ` filter="url(#ink-wear-${level}-${WEAR_SEED})"` : '';
	return (
		`<svg viewBox="150 75 300 300" aria-hidden="true">` +
		(filter ? `<defs>${filter}</defs>` : '') +
		`<g fill="currentColor"${attribute}><circle cx="300" cy="225" r="120"/></g></svg>`
	);
}

/** Amostra de um efeito num nível, sozinho (os outros desligados) para isolar o que ele faz. */
export function effectSwatch(effect: EffectKey, level: EffectLevel): string {
	if (effect === 'wear') return wearSwatch(level);
	return applyEffects(SAMPLE, {halftone: 0, bleed: 0, pressure: 0, wear: 0, [effect]: level});
}
