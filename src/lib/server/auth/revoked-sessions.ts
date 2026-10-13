import {DatabaseSync} from 'node:sqlite';
import {preparePrivateFile} from '../private-storage.ts';

/**
 * Sessões encerradas pelo logout. O cookie é assinado e sem estado, então "sair" só vale de verdade
 * se o servidor lembrar do `sid` até a data em que o cookie expiraria de qualquer forma.
 */
export interface RevokedSessions {
	has(sid: string): boolean;
	add(sid: string, expiresAtMs: number): void;
}

/** Em memória: o padrão dos testes. Reiniciar o servidor esquece as revogações. */
export class InMemoryRevokedSessions implements RevokedSessions {
	private readonly entries = new Map<string, number>();

	constructor(
		private readonly now: () => number = Date.now,
		private readonly maxEntries = 10_000
	) {}

	has(sid: string): boolean {
		const expiresAt = this.entries.get(sid);
		return expiresAt !== undefined && expiresAt > this.now();
	}

	add(sid: string, expiresAtMs: number): void {
		const now = this.now();
		for (const [key, expiresAt] of this.entries) if (expiresAt <= now) this.entries.delete(key);
		if (this.entries.size >= this.maxEntries) {
			const oldest = this.entries.keys().next().value;
			if (oldest !== undefined) this.entries.delete(oldest);
		}
		this.entries.set(sid, expiresAtMs);
	}
}

/** Arquivo irmão do banco do catálogo: o banco do catálogo não ganha tabela nem migração por causa do login. */
export function revokedSessionsPath(databasePath: string): string {
	return databasePath.replace(/(\.db)?$/, '-sessions.db');
}

/** SQLite aberto só na primeira necessidade (primeiro login ou logout), para não tocar o disco à toa. */
export class SqliteRevokedSessions implements RevokedSessions {
	private database: DatabaseSync | undefined;

	constructor(
		private readonly path: string,
		private readonly now: () => number = Date.now
	) {}

	has(sid: string): boolean {
		const row = this.open()
			.prepare('SELECT 1 AS found FROM revoked_sessions WHERE sid = ? AND expires_at > ?')
			.get(sid, this.now());
		return row !== undefined;
	}

	add(sid: string, expiresAtMs: number): void {
		const database = this.open();
		database.prepare('DELETE FROM revoked_sessions WHERE expires_at <= ?').run(this.now());
		database
			.prepare('INSERT OR REPLACE INTO revoked_sessions (sid, expires_at) VALUES (?, ?)')
			.run(sid, expiresAtMs);
	}

	private open(): DatabaseSync {
		if (this.database) return this.database;
		const restrictNewFile = this.path === ':memory:' ? () => {} : preparePrivateFile(this.path);
		const database = new DatabaseSync(this.path);
		restrictNewFile();
		database.exec('PRAGMA busy_timeout = 5000');
		database.exec('PRAGMA journal_mode = WAL');
		database.exec(
			'CREATE TABLE IF NOT EXISTS revoked_sessions (sid TEXT PRIMARY KEY, expires_at INTEGER NOT NULL) STRICT'
		);
		this.database = database;
		return database;
	}
}
