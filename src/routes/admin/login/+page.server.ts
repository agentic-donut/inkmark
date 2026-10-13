import {fail, redirect} from '@sveltejs/kit';
import {
	SESSION_COOKIE,
	getAdminAuth,
	normalizeClientKey,
	safeNextPath,
	sessionCookieOptions
} from '#lib/server/auth/index.ts';
import type {Actions, PageServerLoad} from './$types';

export const load: PageServerLoad = ({locals, url}) => {
	const next = safeNextPath(url.searchParams.get('next'));
	if (locals.admin.authenticated) redirect(303, next);
	return {next};
};

export const actions: Actions = {
	default: async ({request, cookies, url, getClientAddress}) => {
		const form = await request.formData();
		const password = form.get('password');
		const next = safeNextPath(
			typeof form.get('next') === 'string' ? (form.get('next') as string) : null
		);
		if (typeof password !== 'string' || password === '') {
			return fail(400, {message: 'Informe a senha.', next});
		}

		let clientKey = 'unknown';
		try {
			// IPv6 conta pelo /64: quem tem um bloco inteiro não ganha tentativas novas a cada endereço.
			clientKey = normalizeClientKey(getClientAddress());
		} catch {
			// Sem endereço (ex.: certos proxies): todos caem na mesma cota, o que só deixa o limite mais rígido.
		}

		const result = getAdminAuth().login(password, clientKey);
		if (!result.ok && result.reason === 'rate-limited') {
			const minutes = Math.ceil(result.retryAfterSeconds / 60);
			return fail(429, {
				message: `Muitas tentativas. Tente de novo em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`,
				next
			});
		}
		if (!result.ok) return fail(401, {message: 'Senha incorreta.', next});

		cookies.set(SESSION_COOKIE, result.token, {
			...sessionCookieOptions(url),
			maxAge: result.maxAgeSeconds
		});
		redirect(303, next);
	}
};
