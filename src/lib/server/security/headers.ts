/** Cabeçalhos de segurança que valem para toda resposta que passa pelo `handle`. */

const PERMISSIONS_POLICY = [
	'camera=()',
	'microphone=()',
	'geolocation=()',
	'payment=()',
	'usb=()',
	'browsing-topics=()'
].join(', ');

/** 180 dias. Sem `includeSubDomains` nem `preload`: são decisões de domínio, não do app. */
export const HSTS_VALUE = 'max-age=15552000';

export interface SecurityHeaderOptions {
	/** Pedido chegou por HTTPS (a URL do pedido, que o adapter monta com PROTOCOL_HEADER). */
	secureTransport: boolean;
	/** Desenvolvimento: nunca envia HSTS (o navegador guardaria a regra para o localhost). */
	dev: boolean;
	/** Rotas do admin: não vazam nem o endereço de origem para fora. */
	admin: boolean;
}

/** O Response de `Response.redirect()` e de `fetch()` tem cabeçalhos imutáveis; nesse caso copia. */
function mutable(response: Response): Response {
	try {
		response.headers.set('x-content-type-options', 'nosniff');
		return response;
	} catch {
		return new Response(response.body, response);
	}
}

export function applySecurityHeaders(response: Response, options: SecurityHeaderOptions): Response {
	const target = mutable(response);
	const {headers} = target;
	headers.set('x-content-type-options', 'nosniff');
	headers.set('x-frame-options', 'DENY');
	headers.set('referrer-policy', options.admin ? 'same-origin' : 'strict-origin-when-cross-origin');
	headers.set('permissions-policy', PERMISSIONS_POLICY);
	headers.set('cross-origin-opener-policy', 'same-origin');
	if (options.secureTransport && !options.dev) headers.set('strict-transport-security', HSTS_VALUE);
	return target;
}
