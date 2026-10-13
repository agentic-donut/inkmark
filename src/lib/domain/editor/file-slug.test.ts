import {expect, test} from 'vitest';
import {fileSlug} from './file-slug';

test.each([
	['Wild Coast', 'wild-coast'],
	['Ação & Café', 'acao-cafe'],
	['  --Olá, Mundo!--  ', 'ola-mundo'],
	['ÇÃO 2026', 'cao-2026'],
	['', 'logo'],
	['***', 'logo'],
	['日本', 'logo']
])('fileSlug(%j) = %j', (input, expected) => {
	expect(fileSlug(input)).toBe(expected);
});
