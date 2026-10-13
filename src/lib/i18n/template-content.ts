// Descrições dos modelos por idioma. Cada idioma é um dicionário `id → descrição` em
// src/lib/i18n/templates/{locale}.json; o nome do modelo não se traduz (é nome de marca).
// Os dicionários não passam pelo Paraglide: são 300 textos de catálogo, editados em bloco.

export type TemplateDictionary = Readonly<Record<string, string>>;
export type TemplateDictionaries = Readonly<Record<string, TemplateDictionary | undefined>>;

const FALLBACK_LOCALE = 'pt-BR';

/** Monta a consulta sobre os dicionários dados; idioma sem arquivo cai no português e depois no texto do motor. */
export function createTemplateContent(dictionaries: TemplateDictionaries) {
	return function templateDescription(
		id: string,
		locale: string,
		definitionDesc?: string
	): string | undefined {
		return (
			dictionaries[locale]?.[id] ??
			dictionaries[FALLBACK_LOCALE]?.[id] ??
			definitionDesc ??
			undefined
		);
	};
}

// Cada arquivo vira um módulo; o que não existir (ainda) simplesmente não entra.
const modules = import.meta.glob<TemplateDictionary>('./templates/*.json', {
	eager: true,
	import: 'default'
});

const bundled: Record<string, TemplateDictionary> = {};
for (const [path, dictionary] of Object.entries(modules)) {
	const locale = path.match(/\/([^/]+)\.json$/)?.[1];
	if (locale) bundled[locale] = dictionary;
}

/** Descrição do modelo `id` no idioma `locale`; sem tradução, a do português e, por fim, `definitionDesc`. */
export const templateDescription = createTemplateContent(bundled);
