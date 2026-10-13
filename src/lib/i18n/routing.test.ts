import {describe, expect, test} from 'vitest';
import {
	alternateLinks,
	isAdminPath,
	localeCookie,
	localePath,
	rememberedLocaleRedirect,
	rerouteTarget
} from './routing';

const url = (path: string) => new URL(path, 'https://inkmark.test');

describe('localePath', () => {
	test('português na raiz; inglês e espanhol com prefixo e sem barra final', () => {
		expect(localePath('pt-BR')).toBe('/');
		expect(localePath('en')).toBe('/en');
		expect(localePath('es')).toBe('/es');
	});

	test('mantém a página dos classificados em todos os idiomas', () => {
		expect(localePath('pt-BR', 3)).toBe('/?pagina=3');
		expect(localePath('en', 3)).toBe('/en?pagina=3');
		expect(localePath('es', 12)).toBe('/es?pagina=12');
	});

	test('a página 1 é o endereço limpo', () => {
		expect(localePath('en', 1)).toBe('/en');
	});
});

describe('alternateLinks', () => {
	test('um link por idioma e o x-default na raiz', () => {
		expect(alternateLinks('https://inkmark.test')).toEqual([
			{hreflang: 'pt-BR', href: 'https://inkmark.test/'},
			{hreflang: 'en', href: 'https://inkmark.test/en'},
			{hreflang: 'es', href: 'https://inkmark.test/es'},
			{hreflang: 'x-default', href: 'https://inkmark.test/'}
		]);
	});
});

describe('rerouteTarget', () => {
	test('tira o prefixo de idioma', () => {
		expect(rerouteTarget(url('/en'))).toBe('/');
		expect(rerouteTarget(url('/en/'))).toBe('/');
		expect(rerouteTarget(url('/es?pagina=3'))).toBe('/');
		expect(rerouteTarget(url('/'))).toBe('/');
	});

	test('o admin não tem prefixo e continua igual', () => {
		expect(rerouteTarget(url('/admin'))).toBe('/admin');
		expect(rerouteTarget(url('/admin/login'))).toBe('/admin/login');
	});

	test('/en/admin e /es/admin ficam como estão (sem rota: 404) em vez de virar /admin', () => {
		expect(rerouteTarget(url('/en/admin'))).toBe('/en/admin');
		expect(rerouteTarget(url('/es/admin/login'))).toBe('/es/admin/login');
		expect(rerouteTarget(url('/en/%61dmin'))).toBe('/en/%61dmin');
	});
});

describe('isAdminPath', () => {
	test('reconhece o admin, inclusive com letras codificadas', () => {
		expect(isAdminPath('/admin')).toBe(true);
		expect(isAdminPath('/admin/login')).toBe(true);
		expect(isAdminPath('/%61dmin')).toBe(true);
		expect(isAdminPath('/%61dmin/x')).toBe(true);
	});

	test('o resto não é admin', () => {
		expect(isAdminPath('/')).toBe(false);
		expect(isAdminPath('/en')).toBe(false);
		expect(isAdminPath('/en/admin')).toBe(false);
		expect(isAdminPath('/administrator')).toBe(false);
		expect(isAdminPath('/%E0%A4%A')).toBe(false);
	});
});

describe('rememberedLocaleRedirect', () => {
	test('a raiz vai para o idioma escolhido antes, com a query', () => {
		expect(rememberedLocaleRedirect(url('/'), 'en')).toBe('/en');
		expect(rememberedLocaleRedirect(url('/?pagina=3'), 'es')).toBe('/es?pagina=3');
	});

	test('sem cookie, com português ou com valor inválido não redireciona', () => {
		expect(rememberedLocaleRedirect(url('/'), undefined)).toBeNull();
		expect(rememberedLocaleRedirect(url('/'), 'pt-BR')).toBeNull();
		expect(rememberedLocaleRedirect(url('/'), 'fr')).toBeNull();
	});

	test('só a raiz redireciona', () => {
		expect(rememberedLocaleRedirect(url('/en'), 'es')).toBeNull();
		expect(rememberedLocaleRedirect(url('/admin'), 'en')).toBeNull();
	});
});

test('localeCookie grava o idioma no cookie do Paraglide', () => {
	expect(localeCookie('en')).toMatch(/^PARAGLIDE_LOCALE=en; path=\/; max-age=\d+; SameSite=Lax$/);
});
