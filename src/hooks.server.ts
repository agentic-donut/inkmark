import {dev} from '$app/env';
import {sequence} from '@sveltejs/kit/hooks';
import type {Handle} from '@sveltejs/kit/hooks';
import {LOCALE_COOKIE, isAdminPath, rememberedLocaleRedirect} from '#lib/i18n/routing.ts';
import {paraglideMiddleware} from '#lib/paraglide/server.js';
import {getAdminAuth} from '#lib/server/auth/index.ts';
import {serverEnv} from '#lib/server/env.ts';
import {createAdminHandle} from '#lib/server/auth/admin-guard.ts';
import {applySecurityHeaders} from '#lib/server/security/headers.ts';

/**
 * Cabeçalhos de segurança em toda resposta do app (páginas, dados, redirects e erros), inclusive as
 * que o hook do admin devolve sem passar pelo SvelteKit. Os arquivos de `static/` e `/_app/` quem serve
 * é o adapter-node antes do `handle`, então eles não passam por aqui (o tipo de conteúdo vem certo, mas
 * sem `nosniff`: se precisar, ponha no proxy).
 */
const securityHeadersHandle: Handle = async ({event, resolve}) =>
	applySecurityHeaders(await resolve(event), {
		secureTransport: event.url.protocol === 'https:',
		dev,
		admin: isAdminPath(event.url.pathname)
	});

/** O admin fica à frente: a autenticação decide antes de qualquer lógica de idioma. */
const adminHandle = createAdminHandle(getAdminAuth, {
	requireHttps: () => serverEnv().adminRequireHttps
});

/** Quem escolheu inglês ou espanhol no seletor volta para ele ao abrir a raiz; a primeira visita não é redirecionada. */
const rememberedLocaleHandle: Handle = ({event, resolve}) => {
	const isRead = event.request.method === 'GET' || event.request.method === 'HEAD';
	if (!isRead || event.isDataRequest) return resolve(event);
	const target = rememberedLocaleRedirect(event.url, event.cookies.get(LOCALE_COOKIE));
	if (!target) return resolve(event);
	// A resposta depende do cookie: nenhum cache compartilhado pode guardá-la para outras pessoas.
	return new Response(null, {
		status: 302,
		headers: {location: target, vary: 'Cookie', 'cache-control': 'private, no-store'}
	});
};

/**
 * Descobre o idioma do pedido (URL, depois cookie) e o deixa disponível para as mensagens durante a
 * renderização; escreve o idioma em `<html lang>`. O prefixo da URL não é tirado aqui: no SvelteKit 3
 * o `event.request` é somente leitura, e quem acha a rota é o hook `reroute` (src/hooks.ts).
 */
const paraglideHandle: Handle = ({event, resolve}) =>
	paraglideMiddleware(event.request, ({locale}) =>
		resolve(event, {
			transformPageChunk: ({html}) => html.replace('%paraglide.lang%', locale)
		})
	);

export const handle: Handle = sequence(
	securityHeadersHandle,
	adminHandle,
	rememberedLocaleHandle,
	paraglideHandle
);
