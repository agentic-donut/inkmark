import {describe, expect, it} from 'vitest';
import {safeNextPath} from './safe-next.ts';

describe('safeNextPath', () => {
	it('mantém caminhos internos do admin', () => {
		expect(safeNextPath('/admin')).toBe('/admin');
		expect(safeNextPath('/admin/algo?x=1#y')).toBe('/admin/algo?x=1#y');
		expect(safeNextPath('/admin?q=1')).toBe('/admin?q=1');
	});

	it('cai no /admin para qualquer outra coisa', () => {
		for (const next of [
			null,
			undefined,
			'',
			'/',
			'/outra',
			'//evil.com',
			'https://evil.com',
			'/administrador',
			'/admin\\evil',
			'/admin\n/x',
			'/admin/login',
			'/admin/logout'
		]) {
			expect(safeNextPath(next)).toBe('/admin');
		}
	});
});
