import type {LogoConfig} from './types';

export const DEFAULT_CONFIG: Readonly<LogoConfig> = Object.freeze({
	name: 'Inkmark',
	tagline: 'INDEPENDENT GOODS',
	topline: 'EST. 2026',
	font: 'PirataOne',
	template: 'gothic',
	ornament: 'stars',
	size: 100,
	spacing: 0,
	tilt: -6,
	wear: 1,
	halftone: 0,
	pressure: 0,
	bleed: 0
});

export interface NumericLimit {
	min: number;
	max: number;
	step: number;
}

export const LIMITS = Object.freeze({
	size: {min: 65, max: 130, step: 1},
	spacing: {min: -2, max: 8, step: 0.5},
	tilt: {min: -15, max: 15, step: 1},
	wear: {min: 0, max: 3, step: 1},
	nameLength: 40,
	taglineLength: 50,
	toplineLength: 35
});

export const CUSTOM_FONT_ID = 'custom';
