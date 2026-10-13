export type Ornament = 'none' | 'stars' | 'diamond' | 'mountain';
/** Intensidade de um efeito de impressão: 0 desligado, 1 leve, 2 médio, 3 forte. */
export type EffectLevel = 0 | 1 | 2 | 3;
/** O desgaste da tinta é um dos quatro efeitos e usa a mesma escala. */
export type WearLevel = EffectLevel;

export interface LogoConfig {
	name: string;
	tagline: string;
	topline: string;
	font: string;
	template: string;
	ornament: Ornament;
	size: number;
	spacing: number;
	tilt: number;
	wear: WearLevel;
	/** Retícula: o miolo das áreas grossas vira pontos. */
	halftone: EffectLevel;
	/** Pressão desigual: um lado da marca sai mais gasto que o outro. */
	pressure: EffectLevel;
	/** Tinta espalhada: a forma engorda e os cantos arredondam. */
	bleed: EffectLevel;
}
