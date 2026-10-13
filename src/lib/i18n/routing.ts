// Rotas e endereços por idioma. Regras de roteamento do site público ficam aqui, testáveis,
// em cima do runtime que o Paraglide gera (a configuração de padrões está em paraglide.options.ts).
import {PAGE_PARAM} from '#lib/domain/pagination/index.ts';
import {
	baseLocale,
	cookieMaxAge,
	cookieName,
	deLocalizeUrl,
	isLocale,
	locales,
	localizeHref,
	type Locale
} from '#lib/paraglide/runtime.js';

export type {Locale};

export interface LocaleInfo {
	locale: Locale;
	/** Sigla curta do seletor ("PT", "EN", "ES"). */
	code: string;
	/** Nome do idioma na própria língua (vai no `aria-label` dos links). */
	name: string;
}

const LOCALE_INFO: Record<Locale, Omit<LocaleInfo, 'locale'>> = {
	'pt-BR': {code: 'PT', name: 'Português'},
	en: {code: 'EN', name: 'English'},
	es: {code: 'ES', name: 'Español'}
};

/** Idiomas na ordem em que aparecem no seletor. */
export const localeInfos: readonly LocaleInfo[] = locales.map((locale) => ({
	locale,
	...LOCALE_INFO[locale]
}));

function decoded(pathname: string): string {
	try {
		return decodeURIComponent(pathname);
	} catch {
		return pathname;
	}
}

/** O admin é só em português. Decodifica antes: o roteador também decodifica (`/%61dmin` chega a `/admin`). */
export function isAdminPath(pathname: string): boolean {
	const path = decoded(pathname);
	return path === '/admin' || path.startsWith('/admin/');
}

/**
 * Caminho que o roteador usa no lugar do endereço de verdade (hook `reroute`): tira o prefixo do idioma.
 * `/en/admin` não existe — sem esta guarda o prefixo seria removido, a rota do admin responderia e o
 * hook de autenticação (que olha o endereço original) deixaria passar. Fica como está e dá 404.
 */
export function rerouteTarget(url: URL): string {
	const target = deLocalizeUrl(url).pathname;
	if (isAdminPath(target) && !isAdminPath(url.pathname)) return url.pathname;
	return target;
}

/** Endereço da página inicial em um idioma ("/", "/en", "/es"), com `?pagina=N` quando N > 1. */
export function localePath(locale: Locale, page = 1): string {
	const localized = localizeHref('/', {locale});
	// O SvelteKit usa `trailingSlash: never`; "/en/" só causaria um redirecionamento.
	const path = localized.length > 1 ? localized.replace(/\/$/, '') : localized;
	return page > 1 ? `${path}?${PAGE_PARAM}=${page}` : path;
}

export interface AlternateLink {
	/** Valor do atributo `hreflang`. */
	hreflang: string;
	href: string;
}

/** Links `rel="alternate"` da página inicial: um por idioma e o `x-default` (a raiz, em português). */
export function alternateLinks(origin: string): AlternateLink[] {
	return [
		...locales.map((locale) => ({hreflang: locale, href: origin + localePath(locale)})),
		{hreflang: 'x-default', href: origin + localePath(baseLocale)}
	];
}

/**
 * A raiz (`/`) é sempre o português, para crawlers e para quem chega pela primeira vez: o
 * Accept-Language não redireciona. Só quem escolheu outro idioma no seletor (cookie) volta para ele.
 * Devolve o destino (com a query) ou null quando não há o que redirecionar.
 */
export function rememberedLocaleRedirect(url: URL, saved: string | undefined): string | null {
	if (url.pathname !== '/') return null;
	if (!isLocale(saved) || saved === baseLocale) return null;
	return localePath(saved) + url.search;
}

/** Valor para `document.cookie` (e `Set-Cookie`) que guarda a escolha do seletor. */
export function localeCookie(locale: Locale): string {
	return `${cookieName}=${locale}; path=/; max-age=${cookieMaxAge}; SameSite=Lax`;
}

export {cookieName as LOCALE_COOKIE};
