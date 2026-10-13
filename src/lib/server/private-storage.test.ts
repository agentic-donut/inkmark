import {chmodSync, mkdtempSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {openCatalogDatabase} from './catalog/database.ts';
import {preparePrivateFile} from './private-storage.ts';

const dirs: string[] = [];
afterEach(() => dirs.splice(0).forEach((dir) => rmSync(dir, {recursive: true, force: true})));
const temp = () => {
	const dir = mkdtempSync(join(tmpdir(), 'inkmark-perm-'));
	dirs.push(dir);
	return dir;
};
const mode = (path: string) => statSync(path).mode & 0o777;

describe('preparePrivateFile', () => {
	it('cria a pasta (0700) e restringe o arquivo novo (0600), inclusive o banco do catálogo', () => {
		const path = join(temp(), 'dados', 'inkmark.db');
		openCatalogDatabase(path).close();
		expect(mode(join(path, '..'))).toBe(0o700);
		expect(mode(path)).toBe(0o600);
	});

	it('não mexe em pasta nem em arquivo que já existiam', () => {
		const dir = temp();
		const path = join(dir, 'existente.db');
		writeFileSync(path, '');
		chmodSync(path, 0o644);
		chmodSync(dir, 0o755);
		preparePrivateFile(path)();
		expect(mode(path)).toBe(0o644);
		expect(mode(dir)).toBe(0o755);
	});
});
