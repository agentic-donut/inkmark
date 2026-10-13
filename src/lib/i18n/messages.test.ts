import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, test} from 'vitest';

const LOCALES = ['pt-BR', 'en', 'es'] as const;
type Messages = Record<string, unknown>;

const load = (locale: string): Messages => {
	const {$schema, ...messages} = JSON.parse(
		readFileSync(join(process.cwd(), 'messages', `${locale}.json`), 'utf8')
	) as Messages;
	void $schema;
	return messages;
};
const catalogs = Object.fromEntries(LOCALES.map((locale) => [locale, load(locale)])) as Record<
	(typeof LOCALES)[number],
	Messages
>;

/** Todos os textos de uma mensagem (simples ou com `match`). */
function texts(message: unknown): string[] {
	if (typeof message === 'string') return [message];
	if (Array.isArray(message)) {
		return message.flatMap((variant: {match: Record<string, string>}) =>
			Object.values(variant.match)
		);
	}
	throw new Error(`Formato de mensagem inesperado: ${JSON.stringify(message)}`);
}

/** Parâmetros de uma mensagem: `{nome}` nos textos e as entradas declaradas nas variantes. */
function paramsOf(message: unknown): string[] {
	const found = new Set<string>();
	for (const text of texts(message)) {
		for (const match of text.matchAll(/(?<!\\)\{(\w+)\}/g)) found.add(match[1]);
	}
	if (Array.isArray(message)) {
		for (const variant of message as {declarations?: string[]}[]) {
			for (const declaration of variant.declarations ?? []) {
				const input = declaration.match(/^input (\w+)$/);
				if (input) found.add(input[1]);
			}
		}
	}
	return [...found].sort();
}

describe('mensagens', () => {
	const baseKeys = Object.keys(catalogs['pt-BR']).sort();

	test('os três idiomas têm exatamente as mesmas chaves', () => {
		for (const locale of LOCALES) {
			expect(Object.keys(catalogs[locale]).sort(), locale).toEqual(baseKeys);
		}
	});

	test('cada chave tem os mesmos parâmetros nos três idiomas', () => {
		for (const key of baseKeys) {
			const expected = paramsOf(catalogs['pt-BR'][key]);
			for (const locale of ['en', 'es'] as const) {
				expect(paramsOf(catalogs[locale][key]), `${locale}/${key}`).toEqual(expected);
			}
		}
	});

	test('mensagens com plural têm a mesma estrutura em todos os idiomas', () => {
		for (const key of baseKeys) {
			const shape = (locale: (typeof LOCALES)[number]) => {
				const message = catalogs[locale][key];
				return Array.isArray(message) ? Object.keys(message[0].match).sort() : 'simples';
			};
			for (const locale of ['en', 'es'] as const) {
				expect(shape(locale), `${locale}/${key}`).toEqual(shape('pt-BR'));
			}
		}
	});

	test('nenhum texto está vazio', () => {
		for (const locale of LOCALES) {
			for (const [key, message] of Object.entries(catalogs[locale])) {
				for (const text of texts(message)) {
					expect(text.trim(), `${locale}/${key}`).not.toBe('');
				}
			}
		}
	});

	// Esquecer de traduzir deixa o texto em português no idioma novo; estas chaves são iguais de propósito.
	const SAME_ON_PURPOSE = new Set([
		'meta_title', // a aba mostra só o nome da marca
		'category_Lettering',
		'category_one_Lettering',
		'export_format_both',
		'folio_page',
		'effect_level_1',
		'effect_option_label', // só junta o nome do efeito e o nível
		'caption_wear_1',
		'language_switcher_label',
		'edition_light',
		'ink_title',
		'field_name',
		'category_all',
		'category_Emblemas',
		'category_one_Emblemas',
		'export_suffix_light',
		'pagefolio_previous',
		'pagefolio_current',
		'pagefolio_page_label',
		'pagefolio_next_short',
		'ornament_title',
		'edition_title',
		'export_format_label'
	]);

	test.each(['en', 'es'] as const)('%s traduz o que não é igual de propósito', (locale) => {
		const untranslated = baseKeys.filter(
			(key) =>
				!SAME_ON_PURPOSE.has(key) &&
				JSON.stringify(catalogs[locale][key]) === JSON.stringify(catalogs['pt-BR'][key])
		);
		expect(untranslated).toEqual([]);
	});

	test('toda mensagem é usada no código', () => {
		const sources: string[] = [];
		const walk = (dir: string) => {
			for (const entry of readdirSync(dir)) {
				const path = join(dir, entry);
				if (statSync(path).isDirectory()) {
					if (entry !== 'paraglide') walk(path);
				} else if (/\.(svelte|ts)$/.test(entry) && !/\.test\./.test(entry)) {
					sources.push(readFileSync(path, 'utf8'));
				}
			}
		};
		walk(join(process.cwd(), 'src'));
		const code = sources.join('\n');
		const unused = baseKeys.filter((key) => !new RegExp(`\\bm\\.${key}\\b`).test(code));
		expect(unused).toEqual([]);
	});
});
