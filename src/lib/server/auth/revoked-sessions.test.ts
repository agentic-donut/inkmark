import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {
	InMemoryRevokedSessions,
	SqliteRevokedSessions,
	revokedSessionsPath
} from './revoked-sessions.ts';

describe('InMemoryRevokedSessions', () => {
	it('lembra do sid até a data de expiração e limita o tamanho', () => {
		const clock = {now: 1000};
		const store = new InMemoryRevokedSessions(() => clock.now, 3);
		store.add('a', 5000);
		expect(store.has('a')).toBe(true);
		expect(store.has('b')).toBe(false);
		clock.now = 5000;
		expect(store.has('a')).toBe(false);
		for (const sid of ['1', '2', '3', '4']) store.add(sid, 9000);
		expect(['1', '2', '3', '4'].filter((sid) => store.has(sid))).toEqual(['2', '3', '4']);
	});
});

describe('SqliteRevokedSessions', () => {
	const dirs: string[] = [];
	afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, {recursive: true, force: true})));
	const tempFile = () => {
		const dir = mkdtempSync(join(tmpdir(), 'inkmark-sessions-'));
		dirs.push(dir);
		return join(dir, 'sub', 'sessoes.db');
	};

	it('sobrevive a uma reabertura do arquivo (reinício do servidor) e expira', () => {
		const path = tempFile();
		const clock = {now: 1000};
		new SqliteRevokedSessions(path, () => clock.now).add('sid-1', 5000);
		const reopened = new SqliteRevokedSessions(path, () => clock.now);
		expect(reopened.has('sid-1')).toBe(true);
		expect(reopened.has('sid-2')).toBe(false);
		clock.now = 5000;
		expect(reopened.has('sid-1')).toBe(false);
		reopened.add('sid-3', 9000); // limpa as vencidas
		expect(new SqliteRevokedSessions(path, () => 0).has('sid-1')).toBe(false);
	});

	it('não abre nem cria o arquivo antes do primeiro uso', () => {
		const path = tempFile();
		new SqliteRevokedSessions(path);
		expect(() => new SqliteRevokedSessions(path)).not.toThrow();
	});

	it('usa parâmetros: um sid hostil é só texto', () => {
		const store = new SqliteRevokedSessions(':memory:');
		store.add("x'); DROP TABLE revoked_sessions; --", Date.now() + 60_000);
		expect(store.has("x'); DROP TABLE revoked_sessions; --")).toBe(true);
		expect(store.has('outro')).toBe(false);
	});
});

describe('revokedSessionsPath', () => {
	it('fica ao lado do banco do catálogo e nunca é o mesmo arquivo', () => {
		expect(revokedSessionsPath('data/inkmark.db')).toBe('data/inkmark-sessions.db');
		expect(revokedSessionsPath('/var/lib/inkmark/catalogo')).toBe(
			'/var/lib/inkmark/catalogo-sessions.db'
		);
		expect(revokedSessionsPath('x.db')).not.toBe('x.db');
	});
});
