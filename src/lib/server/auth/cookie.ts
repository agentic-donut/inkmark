/**
 * Opções do cookie de sessão do admin. `secure` segue o protocolo real do pedido (atrás de proxy,
 * vem de `PROTOCOL_HEADER`): com HTTPS o navegador só devolve o cookie por HTTPS; num servidor da
 * rede local servido por HTTP, um cookie `secure` nem seria guardado e o login nunca funcionaria.
 */
export function sessionCookieOptions(url: URL) {
	return {
		path: '/admin',
		httpOnly: true,
		sameSite: 'strict' as const,
		secure: url.protocol === 'https:'
	};
}
