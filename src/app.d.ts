// Tipos globais do SvelteKit (locals, page state etc.) entram aqui quando forem necessários.
declare global {
	namespace App {
		interface Locals {
			/** Preenchido pelo hook em toda requisição sob /admin. */
			admin: {enabled: boolean; authenticated: boolean};
		}
	}
}

export {};
