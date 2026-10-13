import {describe, expect, test} from 'vitest';
import {definition} from '../../testing/fakes';
import {sampleNames, sampleText} from './samples';

describe('sampleText', () => {
	test('usa o nome de exemplo do mapa', () => {
		expect(sampleText(definition('gothic', {sample: 'Outro'})).name).toBe(sampleNames.gothic);
		expect(sampleNames.gothic).toBe('Wile Out');
	});

	test('sem entrada no mapa usa o sample do modelo, ou vazio', () => {
		expect(sampleText(definition('novo', {sample: 'Novinho'})).name).toBe('Novinho');
		expect(sampleText(definition('novo')).name).toBe('');
	});

	test('textos padrão de topo e rodapé', () => {
		const text = sampleText(definition('novo'));
		expect(text.topline).toBe('PREMIUM QUALITY');
		expect(text.tagline).toBe('AUTHENTIC GOODS');
	});

	test('topo e rodapé do modelo têm prioridade', () => {
		const text = sampleText(definition('novo', {topline: 'SINCE 1999', tagline: 'MADE HERE'}));
		expect(text).toMatchObject({topline: 'SINCE 1999', tagline: 'MADE HERE'});
	});
});
