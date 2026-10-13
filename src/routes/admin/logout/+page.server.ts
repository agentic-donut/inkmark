import {redirect} from '@sveltejs/kit';
import {SESSION_COOKIE, getAdminAuth, sessionCookieOptions} from '#lib/server/auth/index.ts';
import type {Actions, PageServerLoad} from './$types';

// Sair só por POST (formulário), para um link ou imagem de terceiros não deslogar ninguém.
export const load: PageServerLoad = () => redirect(303, '/admin');

export const actions: Actions = {
	default: ({cookies, url}) => {
		// Apagar o cookie só limpa este navegador; o servidor também encerra a sessão, para uma cópia do cookie não valer mais.
		getAdminAuth().logout(cookies.get(SESSION_COOKIE));
		cookies.delete(SESSION_COOKIE, sessionCookieOptions(url));
		redirect(303, '/admin/login');
	}
};
