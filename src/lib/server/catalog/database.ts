import {existsSync, readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {preparePrivateFile} from '../private-storage.ts';
import {migrate} from './migrations.ts';
import {SqliteCatalogSettingsRepository} from './sqlite-repository.ts';

export interface Logger {
	info(message: string): void;
	error(message: string, detail?: unknown): void;
}

/** Abre (criando pastas e arquivo) e migra o banco. `:memory:` serve para testes. */
export function openCatalogDatabase(path: string): DatabaseSync {
	const restrictNewFile = path === ':memory:' ? () => {} : preparePrivateFile(path);
	const database = new DatabaseSync(path);
	restrictNewFile();
	// busy_timeout primeiro: os PRAGMAs seguintes já podem disputar o arquivo com outro processo.
	database.exec('PRAGMA busy_timeout = 5000');
	database.exec('PRAGMA journal_mode = WAL');
	database.exec('PRAGMA foreign_keys = ON');
	migrate(database);
	return database;
}

/**
 * Importa o JSON da versão anterior uma única vez, só se o banco estiver vazio.
 * A marca é gravada na mesma transação, então apagar tudo depois no admin não traz o arquivo de volta.
 */
export function importLegacyJson(
	repository: SqliteCatalogSettingsRepository,
	legacyPath: string,
	logger: Logger = console
): boolean {
	if (!existsSync(legacyPath) || !repository.isEmpty()) return false;
	let parsed: unknown;
	try {
		parsed = JSON.parse(readFileSync(legacyPath, 'utf8'));
	} catch (error) {
		logger.error(
			`Configurações antigas ilegíveis em ${legacyPath}; ignorando a importação.`,
			error
		);
		return false;
	}
	repository.replaceAll(parsed, () => repository.markLegacyImported(new Date().toISOString()));
	logger.info(`Configurações do catálogo importadas de ${legacyPath} para o banco.`);
	return true;
}

export interface CatalogRepositoryOptions {
	legacyJsonPath?: string;
	logger?: Logger;
}

export function createSqliteCatalogRepository(
	databasePath: string,
	definitionIds: readonly string[],
	options: CatalogRepositoryOptions = {}
): SqliteCatalogSettingsRepository {
	const repository = new SqliteCatalogSettingsRepository(
		openCatalogDatabase(databasePath),
		definitionIds
	);
	if (options.legacyJsonPath) importLegacyJson(repository, options.legacyJsonPath, options.logger);
	return repository;
}
