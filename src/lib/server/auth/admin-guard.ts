import type {Handle} from '@sveltejs/kit/hooks';
import {isAdminPath} from '#lib/i18n/routing.ts';
import type {AdminAuth} from './admin-auth.ts';
import {SESSION_COOKIE} from './session.ts';

export const LOGIN_PATH = '/admin/login';

function redirectResponse(location: string): Response {
	return new Response(null, {status: 303, headers: {location}});
}

/** Resposta para quem não tem sessão: formulário comum recebe redirect; `enhance` recebe o resultado em JSON. */
function denyAnonymous(request: Request, url: URL): Response {
	const next = url.pathname + url.search;
	const location = `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
	if (request.headers.has('x-sveltekit-action')) {
		return Response.json({type: 'redirect', status: 303, location});
	}
	return redirectResponse(location);
}

function hardenAdminResponse(response: Response): Response {
	response.headers.set('cache-control', 'no-store');
	response.headers.set('x-robots-tag', 'noindex, nofollow');
	return response;
}

export interface AdminHandleOptions {
	/** Lida a cada pedido (o valor vem do ambiente). Verdadeiro: `/admin` só responde por HTTPS. */
	requireHttps?: () => boolean;
}

/**
 * Barreira de entrada de `/admin`: sem sessão só o login passa. Roda antes de qualquer lógica de idioma.
 * `isAdminPath` decodifica o caminho, então `/%61dmin` cai aqui; `/en/admin` nem chega a existir (o
 * `reroute` não tira o prefixo). Cada rota ainda confere a sessão por conta própria (`requireSession`).
 */
export function createAdminHandle(
	getAuth: () => AdminAuth,
	options: AdminHandleOptions = {}
): Handle {
	return async ({event, resolve}) => {
		const {pathname} = event.url;
		if (!isAdminPath(pathname)) return resolve(event);

		// Pelo caminho que chegou sem HTTPS (a rede local) o admin nem existe: 404, e não redirecionamento,
		// para não apontar onde ele está. O protocolo é o do pedido real (`PROTOCOL_HEADER` atrás de proxy).
		// Vem antes de tudo: nem a página de aviso do admin desativado aparece. É uma resposta, não um
		// `error(404)`: lançado aqui, o erro passaria por cima do hook de cabeçalhos de segurança.
		if (options.requireHttps?.() && event.url.protocol !== 'https:') {
			return hardenAdminResponse(
				new Response('Not Found', {status: 404, headers: {'content-type': 'text/plain'}})
			);
		}

		const auth = getAuth();
		const authenticated = auth.isAuthenticated(event.cookies.get(SESSION_COOKIE));
		event.locals.admin = {enabled: auth.enabled, authenticated};

		if (!auth.enabled) {
			// Só a página de aviso em /admin; qualquer outra rota ou escrita fica fechada.
			const isRead = event.request.method === 'GET' || event.request.method === 'HEAD';
			if (pathname === '/admin' && isRead) return hardenAdminResponse(await resolve(event));
			return hardenAdminResponse(
				isRead ? redirectResponse('/admin') : new Response('Admin desativado.', {status: 503})
			);
		}

		if (!authenticated && pathname !== LOGIN_PATH) {
			return hardenAdminResponse(denyAnonymous(event.request, event.url));
		}

		return hardenAdminResponse(await resolve(event));
	};
}
