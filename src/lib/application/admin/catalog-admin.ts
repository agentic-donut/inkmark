import {
	CATEGORIES,
	MAX_NAME_LENGTH,
	mergeCatalog,
	moveTemplate,
	setDefaultTemplate,
	setTemplateSettings
} from '#lib/domain/catalog/index.ts';
import type {
	CatalogSettings,
	Category,
	Clock,
	TemplateDefinition
} from '#lib/domain/catalog/index.ts';
import type {CatalogSettingsRepository} from '../ports.ts';
import {CatalogAdminError} from './errors.ts';
import {SerialQueue} from './serial-queue.ts';

export interface CatalogAdminDeps {
	repository: CatalogSettingsRepository;
	definitions: readonly TemplateDefinition[];
	now: Clock;
}

export interface CatalogAdmin {
	setHidden(id: string, hidden: boolean): Promise<CatalogSettings>;
	toggleHidden(id: string): Promise<CatalogSettings>;
	setFeatured(id: string, featured: boolean): Promise<CatalogSettings>;
	toggleFeatured(id: string): Promise<CatalogSettings>;
	/** Nome vazio (ou igual ao original) volta ao nome original. */
	renameTemplate(id: string, name: string): Promise<CatalogSettings>;
	/** Categoria igual à original remove o override. */
	changeCategory(id: string, category: Category): Promise<CatalogSettings>;
	moveUp(id: string): Promise<CatalogSettings>;
	moveDown(id: string): Promise<CatalogSettings>;
	setDefault(id: string): Promise<CatalogSettings>;
	bulkSetHidden(ids: readonly string[], hidden: boolean): Promise<CatalogSettings>;
	/** Restaura nome, categoria, visibilidade e destaque. A posição na lista é mantida. */
	resetTemplate(id: string): Promise<CatalogSettings>;
}

export function createCatalogAdmin(deps: CatalogAdminDeps): CatalogAdmin {
	const {repository, definitions, now} = deps;
	const byId = new Map(definitions.map((definition) => [definition.id, definition]));
	const queue = new SerialQueue();

	function definitionOf(id: string): TemplateDefinition {
		const definition = byId.get(id);
		if (!definition) throw new CatalogAdminError('unknown-template', `Modelo desconhecido: ${id}`);
		return definition;
	}

	/** Carrega, aplica a mudança e grava, tudo em fila. Se nada mudou, não grava. */
	function update(
		change: (settings: CatalogSettings) => CatalogSettings
	): Promise<CatalogSettings> {
		return queue.run(async () => {
			const current = await repository.load();
			const next = change(current);
			if (next === current) return current;
			await repository.save(next);
			return next;
		});
	}

	async function patch(id: string, changes: Parameters<typeof setTemplateSettings>[2]) {
		definitionOf(id);
		return update((settings) => setTemplateSettings(settings, id, changes, now));
	}

	async function move(id: string, direction: 'up' | 'down') {
		definitionOf(id);
		return update((settings) =>
			moveTemplate(settings, mergeCatalog(definitions, settings), id, direction, now)
		);
	}

	async function toggle(id: string, key: 'hidden' | 'featured') {
		definitionOf(id);
		return update((settings) =>
			setTemplateSettings(
				settings,
				id,
				{[key]: settings.templates[id]?.[key] ? undefined : true},
				now
			)
		);
	}

	return {
		// `false` é o padrão: guardamos só `true`, para o arquivo listar apenas o que foge do original.
		setHidden: (id, hidden) => patch(id, {hidden: hidden || undefined}),
		toggleHidden: (id) => toggle(id, 'hidden'),
		setFeatured: (id, featured) => patch(id, {featured: featured || undefined}),
		toggleFeatured: (id) => toggle(id, 'featured'),

		async renameTemplate(id, name) {
			const original = definitionOf(id).name;
			const trimmed = name.trim();
			if (trimmed.length > MAX_NAME_LENGTH) {
				throw new CatalogAdminError(
					'invalid-name',
					`O nome deve ter no máximo ${MAX_NAME_LENGTH} caracteres.`
				);
			}
			return patch(id, {name: trimmed && trimmed !== original ? trimmed : undefined});
		},

		async changeCategory(id, category) {
			const original = definitionOf(id).category;
			if (!CATEGORIES.includes(category)) {
				throw new CatalogAdminError('invalid-category', `Categoria inválida: ${category}`);
			}
			return patch(id, {category: category === original ? undefined : category});
		},

		moveUp: (id) => move(id, 'up'),
		moveDown: (id) => move(id, 'down'),

		async setDefault(id) {
			definitionOf(id);
			return update((settings) =>
				settings.defaultTemplate === id ? settings : setDefaultTemplate(settings, id, now)
			);
		},

		async bulkSetHidden(ids, hidden) {
			ids.forEach(definitionOf);
			return update((settings) => {
				let next = settings;
				for (const id of new Set(ids)) {
					next = setTemplateSettings(next, id, {hidden: hidden || undefined}, now);
				}
				return next;
			});
		},

		async resetTemplate(id) {
			definitionOf(id);
			return update((settings) =>
				setTemplateSettings(
					settings,
					id,
					{name: undefined, category: undefined, hidden: undefined, featured: undefined},
					now
				)
			);
		}
	};
}
