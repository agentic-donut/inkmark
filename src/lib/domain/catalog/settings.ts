import {CATEGORIES} from './catalog';
import type {CatalogEntry, CatalogSettings, Category, TemplateSettings} from './types';

export const MAX_NAME_LENGTH = 60;

export type Clock = () => string;

function asRecord(raw: unknown): Record<string, unknown> {
	return typeof raw === 'object' && raw !== null && !Array.isArray(raw)
		? (raw as Record<string, unknown>)
		: {};
}

function sanitizeTemplateSettings(raw: unknown): TemplateSettings {
	const input = asRecord(raw);
	const result: TemplateSettings = {};
	if (typeof input.hidden === 'boolean') result.hidden = input.hidden;
	if (typeof input.featured === 'boolean') result.featured = input.featured;
	if (typeof input.order === 'number' && Number.isInteger(input.order)) result.order = input.order;
	if (typeof input.name === 'string') {
		const name = input.name.trim().slice(0, MAX_NAME_LENGTH).trim();
		if (name) result.name = name;
	}
	if (CATEGORIES.includes(input.category as Category)) result.category = input.category as Category;
	return result;
}

/** Valida o JSON vindo do disco ou de um formulário; descarta tudo que não faz sentido. */
export function sanitizeSettings(raw: unknown, definitionIds: readonly string[]): CatalogSettings {
	const input = asRecord(raw);
	const rawTemplates = asRecord(input.templates);
	const templates: Record<string, TemplateSettings> = {};
	for (const id of definitionIds) {
		if (!Object.hasOwn(rawTemplates, id)) continue;
		const clean = sanitizeTemplateSettings(rawTemplates[id]);
		if (Object.keys(clean).length > 0) templates[id] = clean;
	}
	const defaultTemplate =
		typeof input.defaultTemplate === 'string' && definitionIds.includes(input.defaultTemplate)
			? input.defaultTemplate
			: null;
	return {
		defaultTemplate,
		templates,
		updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : null
	};
}

function stamp(settings: CatalogSettings, now: Clock, changes: Partial<CatalogSettings>) {
	return {...settings, ...changes, updatedAt: now()};
}

/** Aplica um patch ao modelo; valor `undefined` remove a chave. Modelo sem chaves é removido. */
/**
 * O que a página pública precisa dos ajustes do admin: modelo oculto vira só `{hidden: true}`
 * (nome e categoria internos não saem do servidor) e a data da última edição fica de fora.
 */
export function publicSettings(settings: CatalogSettings): CatalogSettings {
	const templates: Record<string, TemplateSettings> = {};
	for (const [id, override] of Object.entries(settings.templates)) {
		templates[id] = override.hidden ? {hidden: true} : override;
	}
	return {defaultTemplate: settings.defaultTemplate, templates, updatedAt: null};
}

export function setTemplateSettings(
	settings: CatalogSettings,
	id: string,
	patch: Partial<TemplateSettings>,
	now: Clock
): CatalogSettings {
	const merged: TemplateSettings = {...settings.templates[id], ...patch};
	for (const key of Object.keys(merged) as (keyof TemplateSettings)[]) {
		if (merged[key] === undefined) delete merged[key];
	}
	const templates = {...settings.templates};
	if (Object.keys(merged).length > 0) templates[id] = merged;
	else delete templates[id];
	return stamp(settings, now, {templates});
}

/** Grava `order` = posição para todos os ids informados. */
export function reorder(
	settings: CatalogSettings,
	orderedIds: readonly string[],
	now: Clock
): CatalogSettings {
	const templates = {...settings.templates};
	orderedIds.forEach((id, index) => {
		templates[id] = {...templates[id], order: index};
	});
	return stamp(settings, now, {templates});
}

/** Troca o modelo de lugar com o vizinho. Na borda da lista não há o que mover: devolve `settings`. */
export function moveTemplate(
	settings: CatalogSettings,
	entries: readonly CatalogEntry[],
	id: string,
	direction: 'up' | 'down',
	now: Clock
): CatalogSettings {
	const ids = entries.map((entry) => entry.id);
	const from = ids.indexOf(id);
	const to = direction === 'up' ? from - 1 : from + 1;
	if (from === -1 || to < 0 || to >= ids.length) return settings;
	[ids[from], ids[to]] = [ids[to], ids[from]];
	return reorder(settings, ids, now);
}

export function setDefaultTemplate(
	settings: CatalogSettings,
	id: string | null,
	now: Clock
): CatalogSettings {
	return stamp(settings, now, {defaultTemplate: id});
}
