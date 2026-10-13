import {CATEGORIES, MAX_NAME_LENGTH} from '#lib/domain/catalog/index.ts';
import type {Category} from '#lib/domain/catalog/index.ts';

export type Parsed<T> = {ok: true; value: T} | {ok: false; message: string};

const fail = (message: string): {ok: false; message: string} => ({ok: false, message});

/** Máximo de ids aceitos numa ação em lote: o catálogo inteiro cabe com folga. */
const MAX_BULK = 1000;

function text(form: FormData, key: string): string | null {
	const value = form.get(key);
	return typeof value === 'string' ? value : null;
}

export function parseTemplateId(form: FormData, known: ReadonlySet<string>): Parsed<string> {
	const id = text(form, 'id');
	return id !== null && known.has(id) ? {ok: true, value: id} : fail('Modelo não encontrado.');
}

export function parseTemplateIds(form: FormData, known: ReadonlySet<string>): Parsed<string[]> {
	const ids = form.getAll('ids').filter((value): value is string => typeof value === 'string');
	if (ids.length === 0) return fail('Selecione ao menos um modelo.');
	if (ids.length > MAX_BULK) return fail('Seleção grande demais.');
	if (!ids.every((id) => known.has(id))) return fail('Há modelos desconhecidos na seleção.');
	return {ok: true, value: [...new Set(ids)]};
}

export function parseBoolean(form: FormData, key: string): Parsed<boolean> {
	const value = text(form, key);
	if (value === 'true') return {ok: true, value: true};
	if (value === 'false') return {ok: true, value: false};
	return fail('Valor inválido.');
}

export function parseName(form: FormData): Parsed<string> {
	const name = text(form, 'name');
	if (name === null) return fail('Informe o nome.');
	const trimmed = name.trim();
	if (trimmed.length > MAX_NAME_LENGTH) {
		return fail(`O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`);
	}
	return {ok: true, value: trimmed};
}

export function parseCategory(form: FormData): Parsed<Category> {
	const category = text(form, 'category');
	return CATEGORIES.includes(category as Category)
		? {ok: true, value: category as Category}
		: fail('Categoria inválida.');
}

export function parseDirection(form: FormData): Parsed<'up' | 'down'> {
	const direction = text(form, 'direction');
	return direction === 'up' || direction === 'down'
		? {ok: true, value: direction}
		: fail('Direção inválida.');
}
