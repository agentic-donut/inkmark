import {error, fail} from '@sveltejs/kit';
import {CatalogAdminError, buildRows} from '#lib/application/admin/index.ts';
import {
	parseBoolean,
	parseCategory,
	parseDirection,
	parseName,
	parseTemplateId,
	parseTemplateIds
} from '#lib/application/admin/input.ts';
import type {Parsed} from '#lib/application/admin/input.ts';
import type {CatalogSettings} from '#lib/domain/catalog/index.ts';
import {templates} from '#lib/domain/logo/index.ts';
import {getAdminAuth} from '#lib/server/auth/index.ts';
import {getCatalogAdmin, getCatalogSettingsRepository} from '#lib/server/catalog/index.ts';
import type {Actions, PageServerLoad} from './$types';

const knownIds: ReadonlySet<string> = new Set(templates.map((template) => template.id));

/**
 * Segunda barreira: o hook já barra quem não tem sessão, mas a página não depende só dele
 * (um caminho que escape da comparação do hook não pode abrir o painel).
 */
function requireSession(locals: App.Locals): void {
	if (!locals.admin.authenticated) error(401, 'Sessão do admin necessária.');
}

export const load: PageServerLoad = async ({locals}) => {
	if (!locals.admin.enabled) {
		return {enabled: false as const, problems: [...getAdminAuth().problems]};
	}
	requireSession(locals);
	const settings = await getCatalogSettingsRepository().load();
	return {
		enabled: true as const,
		rows: buildRows(templates, settings),
		defaultTemplate: settings.defaultTemplate,
		updatedAt: settings.updatedAt
	};
};

const invalid = (message: string) => fail(400, {ok: false as const, message});
const done = (message: string) => ({ok: true as const, message});

/** Nome que o modelo tem depois da mudança, para a mensagem de confirmação. */
function labelOf(id: string, settings: CatalogSettings): string {
	const original = templates.find((template) => template.id === id)?.name ?? id;
	return `«${settings.templates[id]?.name ?? original}»`;
}

/** Valida a entrada, executa o caso de uso e transforma erro de domínio em resposta 400. */
function action(
	work: (form: FormData) => Promise<Parsed<string>> | Parsed<string>
): (event: {
	request: Request;
	locals: App.Locals;
}) => Promise<ReturnType<typeof invalid> | ReturnType<typeof done>> {
	return async ({request, locals}) => {
		requireSession(locals);
		try {
			const result = await work(await request.formData());
			return result.ok ? done(result.value) : invalid(result.message);
		} catch (error) {
			if (error instanceof CatalogAdminError) return invalid(error.message);
			throw error;
		}
	};
}

const ok = (value: string): Parsed<string> => ({ok: true, value});

export const actions: Actions = {
	visibility: action(async (form) => {
		const id = parseTemplateId(form, knownIds);
		const hidden = parseBoolean(form, 'hidden');
		if (!id.ok) return id;
		if (!hidden.ok) return hidden;
		const settings = await getCatalogAdmin().setHidden(id.value, hidden.value);
		return ok(`${labelOf(id.value, settings)} ${hidden.value ? 'ocultado' : 'publicado'}.`);
	}),

	feature: action(async (form) => {
		const id = parseTemplateId(form, knownIds);
		const featured = parseBoolean(form, 'featured');
		if (!id.ok) return id;
		if (!featured.ok) return featured;
		const settings = await getCatalogAdmin().setFeatured(id.value, featured.value);
		return ok(
			`${labelOf(id.value, settings)} ${featured.value ? 'em destaque' : 'fora do destaque'}.`
		);
	}),

	edit: action(async (form) => {
		const id = parseTemplateId(form, knownIds);
		const name = parseName(form);
		const category = parseCategory(form);
		if (!id.ok) return id;
		if (!name.ok) return name;
		if (!category.ok) return category;
		const admin = getCatalogAdmin();
		await admin.renameTemplate(id.value, name.value);
		const settings = await admin.changeCategory(id.value, category.value);
		return ok(`${labelOf(id.value, settings)} atualizado.`);
	}),

	move: action(async (form) => {
		const id = parseTemplateId(form, knownIds);
		const direction = parseDirection(form);
		if (!id.ok) return id;
		if (!direction.ok) return direction;
		const admin = getCatalogAdmin();
		const settings =
			direction.value === 'up' ? await admin.moveUp(id.value) : await admin.moveDown(id.value);
		return ok(
			`${labelOf(id.value, settings)} movido para ${direction.value === 'up' ? 'cima' : 'baixo'}.`
		);
	}),

	makeDefault: action(async (form) => {
		const id = parseTemplateId(form, knownIds);
		if (!id.ok) return id;
		const settings = await getCatalogAdmin().setDefault(id.value);
		return ok(`${labelOf(id.value, settings)} é o modelo padrão.`);
	}),

	reset: action(async (form) => {
		const id = parseTemplateId(form, knownIds);
		if (!id.ok) return id;
		const settings = await getCatalogAdmin().resetTemplate(id.value);
		return ok(`${labelOf(id.value, settings)} restaurado ao original.`);
	}),

	bulkVisibility: action(async (form) => {
		const ids = parseTemplateIds(form, knownIds);
		const hidden = parseBoolean(form, 'hidden');
		if (!ids.ok) return ids;
		if (!hidden.ok) return hidden;
		await getCatalogAdmin().bulkSetHidden(ids.value, hidden.value);
		const count = ids.value.length;
		return ok(
			`${count} ${count === 1 ? 'modelo' : 'modelos'} ${hidden.value ? 'ocultado' : 'publicado'}${count === 1 ? '' : 's'}.`
		);
	})
};
