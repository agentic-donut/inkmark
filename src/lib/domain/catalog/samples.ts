import type {TemplateDefinition} from './types';

/** Nomes de exemplo por modelo, para os cards quando o usuário não quer ver o próprio nome. */
export const sampleNames: Readonly<Record<string, string>> = {
	signature: 'Swagstr',
	stack: 'Grand Stage',
	brush: 'Never Lose',
	baseball: 'Siege',
	westcoast: 'West Coast',
	goodlife: 'Good Life',
	scriptseal: 'Hustle Gang',
	speed: 'Formula Drift',
	gothic: 'Wile Out',
	heritage: 'Born Rich',
	seal: 'Vintage',
	ribbon: 'Graphic',
	rosette: 'High Quality',
	premium: 'Premium',
	stamp: 'Brand Craft',
	starbadge: 'Standard',
	sunburst: 'Your Logo',
	scallop: 'Vintage',
	'seal-script': 'Company',
	coin: 'Quality Goods',
	hex: 'Vintage',
	'hex-solid': 'Vintage',
	crest: 'New Adventure',
	pennant: 'Explorer',
	wings: 'Wild Journey',
	diamond: 'Brand Name',
	crown: 'Royal Goods',
	outdoor: 'Everyday Goods',
	coastal: 'Hola Carlito',
	compass: 'North Club',
	arch: 'Motor Works',
	laurel: 'Brand Craft',
	'round-plate': 'DESIGN',
	'bow-hex': 'VINTAGE'
};

const DEFAULT_SAMPLE_TOPLINE = 'PREMIUM QUALITY';
const DEFAULT_SAMPLE_TAGLINE = 'AUTHENTIC GOODS';

export interface SampleText {
	name: string;
	topline: string;
	tagline: string;
}

export function sampleText(
	entry: Pick<TemplateDefinition, 'id' | 'sample' | 'topline' | 'tagline'>
): SampleText {
	return {
		name: sampleNames[entry.id] ?? entry.sample ?? '',
		topline: entry.topline ?? DEFAULT_SAMPLE_TOPLINE,
		tagline: entry.tagline ?? DEFAULT_SAMPLE_TAGLINE
	};
}
