import type {EffectLevel} from '../editor/types';
import {applyWear, wearFilter, wearFilterWith, type WearParams} from './ink.js';

/** Os quatro efeitos de impressão; cada um tem um nível de 0 (desligado) a 3 (forte). */
export interface EffectSettings {
	halftone: EffectLevel;
	bleed: EffectLevel;
	pressure: EffectLevel;
	wear: EffectLevel;
}
export type EffectKey = keyof EffectSettings;

/** Níveis em ordem de intensidade, como aparecem nos seletores. */
export const EFFECT_LEVELS: readonly EffectLevel[] = [0, 1, 2, 3];

type Active = Exclude<EffectLevel, 0>;
type ByLevel<T> = Readonly<Record<Active, T>>;

// Parâmetros aprovados nas pranchas de revisão (docs/review/acabamentos, scripts/review-finishes.mjs).

// Retícula: o nível 3 é o aprovado primeiro (cobertura de tinta ~36% no miolo). Os mais leves aumentam o
// ponto (mais tinta) e engrossam a borda sólida, então a marca fica mais firme e o efeito mais discreto.
const HALFTONE: ByLevel<{cell: number; dot: number; rim: number}> = {
	1: {cell: 10, dot: 4.7, rim: 7},
	2: {cell: 10, dot: 4.05, rim: 6},
	3: {cell: 10, dot: 3.4, rim: 5}
};

const BLEED: ByLevel<{spread: number; soft: number; wobble: number}> = {
	1: {spread: 0.6, soft: 1.3, wobble: 2},
	2: {spread: 1.1, soft: 1.8, wobble: 3},
	3: {spread: 1.7, soft: 2.4, wobble: 4.5}
};

// O lado fraco da pressão desigual tem desgaste próprio, bem mais forte que os níveis da Tinta: com o
// desgaste 3 os dois lados ficavam quase iguais. Os níveis leves aproximam esse desgaste do normal e
// empurram o degradê para a borda, de modo que a região fraca cobre menos da marca.
// O degradê vai de `from` (tinta firme) a `to` (lado fraco), em x, antes da rotação.
const PRESSURE: ByLevel<{weak: WearParams; from: number; to: number}> = {
	1: {weak: {dots: 0.71, scratch: 0.78, patch: 0.2, edge: 0.85}, from: 235, to: 455},
	2: {weak: {dots: 0.65, scratch: 0.72, patch: 0.28, edge: 1.0}, from: 212, to: 432},
	3: {weak: {dots: 0.6, scratch: 0.68, patch: 0.34, edge: 1.2}, from: 190, to: 410}
};
const PRESSURE_ANGLE = -25;

// Semente padrão de ink.js: os filtros de desgaste têm o mesmo id e a mesma definição em todo lugar.
const WEAR_SEED = 7;

// Os filtros trabalham nas coordenadas da logo (600×500), como o desgaste.
const REGION = 'x="0" y="0" width="600" height="500"';
const FILTER_REGION = `filterUnits="userSpaceOnUse" ${REGION} color-interpolation-filters="sRGB"`;
const MASK_REGION = `maskUnits="userSpaceOnUse" ${REGION}`;
const ART_OPEN = /<g fill="[^"]+" color="[^"]+"/;

/**
 * Estrutura que atravessa os passos: o SVG do motor separado em partes.
 * `defs` acumula as definições (filtros, máscaras); `under` é uma camada desenhada por baixo da arte
 * e `mask`, quando existe, esconde a arte aos poucos para deixar `under` aparecer.
 */
interface Parts {
	head: string;
	defs: string[];
	under: string;
	art: string;
	mask: string | null;
	tail: string;
}

/** Id próprio do SVG (derivado da entrada e dos níveis) e o que o passo precisa saber do efeito. */
interface Context {
	id: string;
	settings: EffectSettings;
}

/** Um efeito: transforma as partes. Acrescentar efeito é acrescentar um passo em `STEPS`. */
interface Step {
	key: EffectKey;
	apply(parts: Parts, context: Context, level: Active): Parts;
}

/** Separa o SVG do motor em cabeçalho, arte (o <g> com a cor) e fechamento. */
function split(svg: string): Parts | null {
	const start = svg.search(ART_OPEN);
	const end = svg.lastIndexOf('</svg>');
	if (start < 0 || end < start) return null;
	return {
		head: svg.slice(0, start),
		defs: [],
		under: '',
		art: svg.slice(start, end),
		mask: null,
		tail: svg.slice(end)
	};
}

/** Junta as partes; definições idênticas (os filtros de desgaste compartilhados) aparecem uma vez só. */
function assemble({head, defs, under, art, mask, tail}: Parts): string {
	const unique = [...new Set(defs)];
	const body = mask ? `<g>${under}<g mask="url(#${mask})">${art}</g></g>` : art;
	return head + (unique.length ? `<defs>${unique.join('')}</defs>` : '') + body + tail;
}

/** FNV-1a de 32 bits: rápido e determinístico, o bastante para diferenciar ids entre logos. */
function fnv1a(text: string): string {
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(36);
}

/**
 * Acrescenta um sufixo aos ids definidos no trecho e às referências a eles (url(#…)).
 * Referências a ids de fora (máscaras e filtros dos efeitos) ficam como estão: a cópia as compartilha.
 */
function suffixIds(fragment: string, suffix: string): string {
	const own = new Set([...fragment.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
	return fragment
		.replace(/(\sid=")([^"]+)"/g, `$1$2${suffix}"`)
		.replace(/url\(#([^)]+)\)/g, (ref, id: string) => (own.has(id) ? `url(#${id}${suffix})` : ref));
}

const wearId = (level: EffectLevel) => `ink-wear-${level}-${WEAR_SEED}`;

/**
 * Retícula: o miolo das áreas grossas (achado por erosão) vira pontos; borda e traços finos ficam sólidos.
 * A máscara leva uma cópia branca da arte, então os ids dela ganham outro sufixo para não repetir os da arte.
 */
const halftoneStep: Step = {
	key: 'halftone',
	apply(parts, {id}, level) {
		const {cell, dot, rim} = HALFTONE[level];
		const whiteArt = suffixIds(parts.art.replace(ART_OPEN, '<g fill="#fff" color="#fff"'), '-m');
		return {
			...parts,
			defs: [
				...parts.defs,
				`<pattern id="ht-dots-${id}" patternUnits="userSpaceOnUse" width="${cell}" height="${cell}" patternTransform="rotate(45)"><circle cx="${cell / 2}" cy="${cell / 2}" r="${dot}" fill="#fff"/></pattern>`,
				`<filter id="ht-rim-${id}" ${FILTER_REGION}><feMorphology in="SourceAlpha" operator="erode" radius="${rim}" result="core"/><feComposite in="SourceGraphic" in2="core" operator="out"/></filter>`,
				`<mask id="ht-mask-${id}" ${MASK_REGION}><rect width="600" height="500" fill="url(#ht-dots-${id})"/><g filter="url(#ht-rim-${id})">${whiteArt}</g></mask>`
			],
			art: `<g mask="url(#ht-mask-${id})">${parts.art}</g>`
		};
	}
};

/** Tinta espalhada: engorda a forma, suaviza e corta de novo num limiar; os cantos arredondam como tinta no papel. */
const bleedStep: Step = {
	key: 'bleed',
	apply(parts, {id}, level) {
		const {spread, soft, wobble} = BLEED[level];
		return {
			...parts,
			defs: [
				...parts.defs,
				`<filter id="bleed-${id}" ${FILTER_REGION}>` +
					`<feMorphology in="SourceGraphic" operator="dilate" radius="${spread}" result="fat"/>` +
					`<feGaussianBlur in="fat" stdDeviation="${soft}" result="blur"/>` +
					`<feComponentTransfer in="blur" result="cut"><feFuncA type="linear" slope="7" intercept="-3"/></feComponentTransfer>` +
					`<feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="4" result="noise"/>` +
					`<feDisplacementMap in="cut" in2="noise" scale="${wobble}" xChannelSelector="R" yChannelSelector="G"/>` +
					`</filter>`
			],
			art: `<g filter="url(#bleed-${id})">${parts.art}</g>`
		};
	}
};

/**
 * Pressão desigual: a versão gasta fica embaixo, inteira; a bem impressa (a arte, que ainda recebe o
 * desgaste escolhido) vem por cima e some aos poucos. Assim o meio não fica mais claro que as pontas
 * (duas camadas semitransparentes clareariam). A camada de baixo é cópia da arte, então reescreve os ids que herdou.
 */
const pressureStep: Step = {
	key: 'pressure',
	apply(parts, {id}, level) {
		const {weak, from, to} = PRESSURE[level];
		const weakId = `ink-wear-pressure-${level}-${WEAR_SEED}`;
		return {
			...parts,
			defs: [
				...parts.defs,
				wearFilterWith(weak, weakId, WEAR_SEED),
				`<linearGradient id="pr-grad-${id}" gradientUnits="userSpaceOnUse" x1="${from}" y1="250" x2="${to}" y2="250" gradientTransform="rotate(${PRESSURE_ANGLE} 300 250)"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>`,
				// O degradê é quebrado em pontos (ruído + limiar): cada ponto é tinta cheia ou papel, sem faixa cinza no meio.
				`<filter id="pr-dither-${id}" ${FILTER_REGION}><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" result="noise"/><feColorMatrix in="noise" type="matrix" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1" result="grain"/><feComposite in="SourceGraphic" in2="grain" operator="arithmetic" k2="1" k3="0.7" k4="-0.35" result="mix"/><feComponentTransfer in="mix"><feFuncR type="discrete" tableValues="0 1"/><feFuncG type="discrete" tableValues="0 1"/><feFuncB type="discrete" tableValues="0 1"/><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer></filter>`,
				`<mask id="pr-firm-${id}" ${MASK_REGION}><rect width="600" height="500" fill="url(#pr-grad-${id})" filter="url(#pr-dither-${id})"/></mask>`
			],
			under: `<g filter="url(#${weakId})">${suffixIds(parts.art, '-w')}</g>`,
			mask: `pr-firm-${id}`
		};
	}
};

/** Desgaste da tinta: por fora de tudo que veio antes; na pressão desigual só a camada firme o recebe. */
const wearStep: Step = {
	key: 'wear',
	apply(parts, _context, level) {
		return {
			...parts,
			defs: [...parts.defs, wearFilter(level, WEAR_SEED)],
			art: `<g filter="url(#${wearId(level)})">${parts.art}</g>`
		};
	}
};

/** A ordem é fixa: forma (retícula, tinta espalhada), pressão e, por último, desgaste. */
const STEPS: readonly Step[] = [bleedStep, halftoneStep, pressureStep, wearStep];

/**
 * Aplica os efeitos de impressão à logo desenhada: render → retícula → tinta espalhada → pressão → desgaste.
 * Cada passo só roda se o nível for maior que 0; sem nenhum efeito além do desgaste a saída é a de `applyWear`.
 * Os ids criados levam um sufixo derivado do SVG de entrada e dos níveis: vários SVGs convivem no mesmo
 * documento e as máscaras e a camada fraca carregam cópias da arte, que é diferente em cada logo.
 */
export function applyEffects(svg: string, settings: EffectSettings): string {
	const shaped = STEPS.some((step) => step.key !== 'wear' && settings[step.key]);
	const parts = shaped ? split(svg) : null;
	if (!parts) return applyWear(svg, settings.wear);
	const context: Context = {
		id: fnv1a(`${settings.halftone}${settings.bleed}${settings.pressure}${settings.wear}|${svg}`),
		settings
	};
	return assemble(
		STEPS.reduce((current, step) => {
			const level = settings[step.key];
			return level ? step.apply(current, context, level) : current;
		}, parts)
	);
}
