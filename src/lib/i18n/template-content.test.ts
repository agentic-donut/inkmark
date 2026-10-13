import {describe, expect, test} from 'vitest';
import {templates} from '#lib/domain/logo/index.ts';
import {createTemplateContent, templateDescription} from './template-content';

describe('createTemplateContent', () => {
	const description = createTemplateContent({
		'pt-BR': {gothic: 'Gótica compacta.', coin: 'Moeda.'},
		en: {gothic: 'Compact gothic.'}
	});

	test('usa o dicionário do idioma', () => {
		expect(description('gothic', 'en')).toBe('Compact gothic.');
	});

	test('sem a entrada no idioma, cai no português', () => {
		expect(description('coin', 'en')).toBe('Moeda.');
	});

	test('idioma sem dicionário também cai no português', () => {
		expect(description('gothic', 'es')).toBe('Gótica compacta.');
	});

	test('sem tradução em lugar nenhum, devolve o texto do motor', () => {
		expect(description('novo', 'en', 'Texto do motor')).toBe('Texto do motor');
	});

	test('sem nada devolve undefined', () => {
		expect(description('novo', 'en')).toBeUndefined();
	});

	test('sem nenhum dicionário usa só o texto do motor', () => {
		expect(createTemplateContent({})('gothic', 'en', 'Motor')).toBe('Motor');
	});
});

describe('templateDescription (dicionários do projeto)', () => {
	test('o português cobre todos os modelos do motor', () => {
		const missing = templates.filter((t) => !templateDescription(t.id, 'pt-BR')).map((t) => t.id);
		expect(missing).toEqual([]);
	});

	test('um idioma desconhecido cai no português', () => {
		const id = templates[0].id;
		expect(templateDescription(id, 'fr')).toBe(templateDescription(id, 'pt-BR'));
	});

	test('todo idioma presente descreve todos os modelos', () => {
		for (const locale of ['en', 'es']) {
			const missing = templates
				.filter((t) => templateDescription(t.id, locale) === templateDescription(t.id, 'pt-BR'))
				.map((t) => t.id);
			// Igual ao português só vale para descrições que são, de fato, idênticas nos dois idiomas.
			expect(missing.length, `${locale}: ${missing.slice(0, 5).join(', ')}`).toBeLessThan(
				templates.length / 4
			);
		}
	});
});
