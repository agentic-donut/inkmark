import {resolve} from 'node:path';
import type {CatalogSettingsRepository} from '#lib/application/ports.ts';
import {createCatalogAdmin} from '#lib/application/admin/index.ts';
import type {CatalogAdmin} from '#lib/application/admin/index.ts';
import {templates} from '#lib/domain/logo/index.ts';
import {serverEnv} from '../env.ts';
import {createSqliteCatalogRepository} from './database.ts';

export {SqliteCatalogSettingsRepository} from './sqlite-repository.ts';
export {createSqliteCatalogRepository, openCatalogDatabase} from './database.ts';

/** Onde a versão anterior (arquivo JSON) guardava as configurações; lido uma vez, se existir. */
const LEGACY_JSON_PATH = 'data/catalog-settings.json';

let repository: CatalogSettingsRepository | undefined;
let admin: CatalogAdmin | undefined;

/** Troque a implementação aqui (Supabase…) para mudar onde o catálogo é guardado. */
export function getCatalogSettingsRepository(): CatalogSettingsRepository {
	repository ??= createSqliteCatalogRepository(
		resolve(serverEnv().databasePath),
		templates.map((template) => template.id),
		{legacyJsonPath: resolve(LEGACY_JSON_PATH)}
	);
	return repository;
}

export function getCatalogAdmin(): CatalogAdmin {
	admin ??= createCatalogAdmin({
		repository: getCatalogSettingsRepository(),
		definitions: templates,
		now: () => new Date().toISOString()
	});
	return admin;
}
