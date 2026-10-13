/** Aceita só caminhos internos do admin como destino pós-login (evita open redirect). */
export function safeNextPath(next: string | null | undefined): string {
	const fallback = '/admin';
	if (!next || !next.startsWith('/admin')) return fallback;
	if (next.includes('\\') || [...next].some((char) => char.charCodeAt(0) < 32)) return fallback;
	const rest = next.slice('/admin'.length);
	if (rest && !/^[/?#]/.test(rest)) return fallback;
	if (rest.startsWith('/login') || rest.startsWith('/logout')) return fallback;
	return next;
}
