import {describe, expect, test} from 'vitest';
import {entry} from '../testing/fakes';
import {DEFAULT_CONFIG} from '../domain/editor/defaults';
import {cardConfig} from './card-config';

const config = {
	...DEFAULT_CONFIG,
	name: 'Acme',
	topline: 'TOP',
	tagline: 'TAG',
	size: 80,
	spacing: 4,
	tilt: 9,
	wear: 3 as const,
	ornament: 'mountain' as const
};

describe('cardConfig', () => {
	test('com o nome do usuário usa os textos dele e fixa tamanho, espaçamento e inclinação', () => {
		const result = cardConfig(entry('gothic', {font: 'Bungee'}), config, true);
		expect(result).toMatchObject({
			name: 'Acme',
			topline: 'TOP',
			tagline: 'TAG',
			template: 'gothic',
			font: 'Bungee',
			size: 100,
			spacing: 0,
			tilt: -6,
			wear: 3
		});
	});

	test('os efeitos da configuração valem também nos cards', () => {
		const effects = {halftone: 1, pressure: 2, bleed: 3} as const;
		const result = cardConfig(entry('gothic'), {...config, ...effects}, true);
		expect(result).toMatchObject(effects);
	});

	test('nome vazio do usuário cai no nome padrão (Inkmark)', () => {
		expect(cardConfig(entry('x'), {...config, name: ''}, true).name).toBe('Inkmark');
	});

	test('sem o nome do usuário usa os textos de exemplo', () => {
		const result = cardConfig(entry('gothic'), config, false);
		expect(result).toMatchObject({
			name: 'Wile Out',
			topline: 'PREMIUM QUALITY',
			tagline: 'AUTHENTIC GOODS'
		});
	});

	test('ornamento do modelo ou, na falta, o da configuração', () => {
		expect(cardConfig(entry('x', {ornament: 'diamond'}), config, true).ornament).toBe('diamond');
		expect(cardConfig(entry('x'), config, true).ornament).toBe('mountain');
	});

	test('não altera a configuração original', () => {
		cardConfig(entry('x'), config, false);
		expect(config.name).toBe('Acme');
		expect(config.size).toBe(80);
	});
});
