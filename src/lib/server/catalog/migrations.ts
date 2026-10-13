import type {DatabaseSync} from 'node:sqlite';

/**
 * Migrações em ordem; a posição + 1 é a versão gravada em `PRAGMA user_version`.
 * Nunca edite uma migração já publicada: acrescente outra no fim da lista.
 */
export const MIGRATIONS: readonly string[] = [
	`
	CREATE TABLE template_settings (
		template_id TEXT PRIMARY KEY,
		hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
		featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
		sort_order INTEGER NULL,
		name TEXT NULL CHECK (name IS NULL OR length(name) BETWEEN 1 AND 60),
		category TEXT NULL CHECK (category IS NULL OR category IN ('Lettering', 'Selos', 'Emblemas'))
	) STRICT;

	CREATE TABLE catalog_meta (
		key TEXT PRIMARY KEY,
		value TEXT
	) STRICT;
	`
];

function currentVersion(database: DatabaseSync): number {
	const row = database.prepare('PRAGMA user_version').get() as {user_version: number};
	return row.user_version;
}

/** Aplica o que falta, cada migração na própria transação. Rodar de novo não faz nada. */
export function migrate(database: DatabaseSync, migrations: readonly string[] = MIGRATIONS): void {
	if (currentVersion(database) > migrations.length) {
		throw new Error(
			`O banco está na versão ${currentVersion(database)}, mais nova que este código (${migrations.length}).`
		);
	}
	for (let index = 0; index < migrations.length; index++) {
		const version = index + 1;
		// IMMEDIATE trava a escrita antes de reler a versão: dois processos subindo juntos não aplicam a mesma migração.
		database.exec('BEGIN IMMEDIATE');
		try {
			if (currentVersion(database) < version) {
				database.exec(migrations[index]);
				database.exec(`PRAGMA user_version = ${version}`);
			}
			database.exec('COMMIT');
		} catch (error) {
			database.exec('ROLLBACK');
			throw error;
		}
	}
}
