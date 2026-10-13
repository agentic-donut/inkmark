import {mkdtemp, rm, writeFile, mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {Mock} from 'vitest';
import {EMPTY_SETTINGS} from '#lib/domain/catalog/index.ts';
import type {CatalogSettings} from '#lib/domain/catalog/index.ts';
import {createSqliteCatalogRepository, importLegacyJson, openCatalogDatabase} from './database.ts';
import {MIGRATIONS, migrate} from './migrations.ts';
import {SqliteCatalogSettingsRepository} from './sqlite-repository.ts';

const ids = ['a', 'b', 'c'];
let dir: string;

beforeEach(async () => {
	dir = await mkdtemp(join(tmpdir(), 'inkmark-db-'));
});
afterEach(() => rm(dir, {recursive: true, force: true}));

function memoryRepository() {
	const database = openCatalogDatabase(':memory:');
	return {database, repository: new SqliteCatalogSettingsRepository(database, ids)};
}

function settings(overrides: Partial<CatalogSettings> = {}): CatalogSettings {
	return {...EMPTY_SETTINGS, ...overrides};
}

const rich = settings({
	defaultTemplate: 'b',
	templates: {
		a: {hidden: true, name: 'Novo nome'},
		b: {featured: true, order: 0, category: 'Selos'},
		c: {order: 2, hidden: true, featured: true, category: 'Emblemas', name: 'Ç'}
	},
	updatedAt: '2026-10-12T12:00:00.000Z'
});

function userVersion(database: DatabaseSync): number {
	return (database.prepare('PRAGMA user_version').get() as {user_version: number}).user_version;
}

describe('migrações', () => {
	it('definem user_version e são idempotentes ao abrir duas vezes', () => {
		const path = join(dir, 'db', 'catalog.db');
		const first = openCatalogDatabase(path);
		expect(userVersion(first)).toBe(MIGRATIONS.length);
		first.close();
		const second = openCatalogDatabase(path);
		expect(userVersion(second)).toBe(MIGRATIONS.length);
		expect(() => migrate(second)).not.toThrow();
		second.close();
	});

	it('aplicam só as migrações novas', () => {
		const database = new DatabaseSync(':memory:');
		migrate(database, ['CREATE TABLE one (id INTEGER)']);
		migrate(database, ['CREATE TABLE one (id INTEGER)', 'CREATE TABLE two (id INTEGER)']);
		expect(userVersion(database)).toBe(2);
	});

	it('desfazem a migração inteira se ela falha', () => {
		const database = new DatabaseSync(':memory:');
		expect(() =>
			migrate(database, ['CREATE TABLE one (id INTEGER); CREATE TABLE one (id INTEGER)'])
		).toThrow();
		expect(userVersion(database)).toBe(0);
		const tables = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
		expect(tables).toEqual([]);
	});

	it('recusam um banco mais novo que o código', () => {
		const database = new DatabaseSync(':memory:');
		database.exec(`PRAGMA user_version = ${MIGRATIONS.length + 1}`);
		expect(() => migrate(database)).toThrow(/mais nova/);
	});

	it('ligam WAL, chaves estrangeiras e busy_timeout em arquivo', () => {
		const database = openCatalogDatabase(join(dir, 'catalog.db'));
		const pragma = (name: string) => Object.values(database.prepare(`PRAGMA ${name}`).get()!)[0];
		expect(pragma('journal_mode')).toBe('wal');
		expect(pragma('foreign_keys')).toBe(1);
		expect(pragma('busy_timeout')).toBe(5000);
		database.close();
	});
});

describe('SqliteCatalogSettingsRepository', () => {
	it('devolve as configurações vazias num banco novo', async () => {
		expect(await memoryRepository().repository.load()).toEqual(EMPTY_SETTINGS);
	});

	it('grava e lê de volta o objeto completo', async () => {
		const {repository} = memoryRepository();
		await repository.save(rich);
		expect(await repository.load()).toEqual(rich);
	});

	it('trata falso e ausente como a mesma coisa', async () => {
		const {repository} = memoryRepository();
		await repository.save(settings({templates: {a: {hidden: false, order: 1}}}));
		expect((await repository.load()).templates).toEqual({a: {order: 1}});
	});

	it('a gravação substitui o estado: overrides removidos somem', async () => {
		const {repository, database} = memoryRepository();
		await repository.save(rich);
		await repository.save(
			settings({templates: {b: {order: 5}}, defaultTemplate: null, updatedAt: null})
		);
		expect(await repository.load()).toEqual(settings({templates: {b: {order: 5}}}));
		expect(database.prepare('SELECT count(*) AS n FROM template_settings').get()).toEqual({n: 1});
		expect(database.prepare('SELECT count(*) AS n FROM catalog_meta').get()).toEqual({n: 0});
	});

	it('descarta ids desconhecidos ao ler (linhas antigas) e ao gravar', async () => {
		const {repository, database} = memoryRepository();
		await repository.save(
			settings({defaultTemplate: 'zzz', templates: {zzz: {hidden: true}, a: {hidden: true}}})
		);
		expect(database.prepare('SELECT template_id FROM template_settings').all()).toEqual([
			{template_id: 'a'}
		]);
		database.exec("INSERT INTO template_settings (template_id, hidden) VALUES ('removido', 1)");
		database.exec("INSERT INTO catalog_meta VALUES ('default_template', 'removido')");
		expect(await repository.load()).toEqual(settings({templates: {a: {hidden: true}}}));
	});

	it('o banco rejeita categoria e nome inválidos', () => {
		const {database} = memoryRepository();
		const insert = database.prepare(
			'INSERT INTO template_settings (template_id, name, category) VALUES (?, ?, ?)'
		);
		expect(() => insert.run('a', null, 'Outra')).toThrow(/CHECK/);
		expect(() => insert.run('a', '', null)).toThrow(/CHECK/);
		expect(() => insert.run('a', 'x'.repeat(61), null)).toThrow(/CHECK/);
		expect(() =>
			database
				.prepare('INSERT INTO template_settings (template_id, hidden) VALUES (?, ?)')
				.run('a', 2)
		).toThrow(/CHECK/);
		expect(() => insert.run('a', 'x'.repeat(60), 'Selos')).not.toThrow();
	});

	it('uma gravação que falha desfaz tudo e não trava a seguinte', async () => {
		const {repository, database} = memoryRepository();
		await repository.save(rich);
		database.exec(`
			CREATE TRIGGER fail_on_c BEFORE INSERT ON template_settings WHEN NEW.template_id = 'c'
			BEGIN SELECT RAISE(ABORT, 'boom'); END;
			CREATE TRIGGER fail_on_c_update BEFORE UPDATE ON template_settings WHEN NEW.template_id = 'c'
			BEGIN SELECT RAISE(ABORT, 'boom'); END;
		`);
		await expect(
			repository.save(settings({defaultTemplate: 'a', templates: {a: {order: 9}, c: {order: 1}}}))
		).rejects.toThrow(/boom/);
		expect(await repository.load()).toEqual(rich);
		database.exec('DROP TRIGGER fail_on_c; DROP TRIGGER fail_on_c_update');
		await expect(repository.save(settings({defaultTemplate: 'c'}))).resolves.toBeUndefined();
		expect((await repository.load()).defaultTemplate).toBe('c');
	});

	it('serializa gravações simultâneas: vale a última', async () => {
		const {repository} = memoryRepository();
		await Promise.all(
			Array.from({length: 25}, (_, index) =>
				repository.save(settings({defaultTemplate: ids[index % 3], updatedAt: String(index)}))
			)
		);
		expect((await repository.load()).updatedAt).toBe('24');
	});

	it('persiste num arquivo entre aberturas', async () => {
		const path = join(dir, 'nested', 'catalog.db');
		const first = createSqliteCatalogRepository(path, ids);
		await first.save(rich);
		const second = createSqliteCatalogRepository(path, ids);
		expect(await second.load()).toEqual(rich);
	});
});

describe('importação do JSON antigo', () => {
	const legacy = {
		defaultTemplate: 'c',
		templates: {a: {hidden: true}, zzz: {hidden: true}},
		updatedAt: '2026-01-01T00:00:00.000Z'
	};
	let legacyPath: string;
	let logger: {info: Mock<(message: string) => void>; error: Mock<(message: string) => void>};

	beforeEach(async () => {
		legacyPath = join(dir, 'catalog-settings.json');
		logger = {info: vi.fn<(message: string) => void>(), error: vi.fn<(message: string) => void>()};
		await mkdir(dir, {recursive: true});
	});

	it('importa uma vez, saneado, e registra no log', async () => {
		await writeFile(legacyPath, JSON.stringify(legacy));
		const path = join(dir, 'catalog.db');
		const first = createSqliteCatalogRepository(path, ids, {legacyJsonPath: legacyPath, logger});
		expect(await first.load()).toEqual(
			settings({
				defaultTemplate: 'c',
				templates: {a: {hidden: true}},
				updatedAt: '2026-01-01T00:00:00.000Z'
			})
		);
		expect(logger.info).toHaveBeenCalledOnce();

		// Zerar o catálogo no admin não pode trazer o arquivo antigo de volta.
		await first.save(settings());
		createSqliteCatalogRepository(path, ids, {legacyJsonPath: legacyPath, logger});
		expect((await first.load()).templates).toEqual({});
		expect(logger.info).toHaveBeenCalledOnce();
	});

	it('não sobrescreve um banco que já tem configurações', async () => {
		await writeFile(legacyPath, JSON.stringify(legacy));
		const {repository} = memoryRepository();
		await repository.save(settings({defaultTemplate: 'b'}));
		expect(importLegacyJson(repository, legacyPath, logger)).toBe(false);
		expect((await repository.load()).defaultTemplate).toBe('b');
	});

	it('ignora arquivo ausente e arquivo corrompido', async () => {
		const {repository} = memoryRepository();
		expect(importLegacyJson(repository, legacyPath, logger)).toBe(false);
		await writeFile(legacyPath, '{"templates": {oops');
		expect(importLegacyJson(repository, legacyPath, logger)).toBe(false);
		expect(logger.error).toHaveBeenCalledOnce();
		expect(await repository.load()).toEqual(EMPTY_SETTINGS);
	});
});
