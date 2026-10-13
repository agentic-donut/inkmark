import {expect, test} from 'vitest';
import {applyTemplate} from './apply-template';
import {DEFAULT_CONFIG} from './defaults';

test('escolher um modelo troca modelo, fonte e ornamento e preserva o resto', () => {
	const config = {...DEFAULT_CONFIG, name: 'Acme', ornament: 'mountain' as const};
	const result = applyTemplate(config, {id: 'brush', font: 'Lobster', ornament: 'diamond'});
	expect(result).toEqual({...config, template: 'brush', font: 'Lobster', ornament: 'diamond'});
	expect(config.template).toBe('gothic');
});

test('escolher um modelo mantém todos os efeitos', () => {
	const effects = {wear: 2, halftone: 1, pressure: 2, bleed: 3} as const;
	const config = {...DEFAULT_CONFIG, ...effects};
	expect(applyTemplate(config, {id: 'brush', font: 'Lobster'})).toMatchObject(effects);
});

test('modelo sem ornamento usa estrelas', () => {
	const result = applyTemplate(DEFAULT_CONFIG, {id: 'x', font: 'Bungee'});
	expect(result.ornament).toBe('stars');
});
