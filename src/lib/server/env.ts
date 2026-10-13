// Única ponte entre o SvelteKit (`$app/env/private`) e o resto do servidor.
// O restante recebe os valores por parâmetro, o que mantém o núcleo testável sem o SvelteKit.
import {ADMIN_PASSWORD, ADMIN_REQUIRE_HTTPS, DATABASE_PATH, SESSION_SECRET} from '$app/env/private';

export function serverEnv() {
	return {
		adminPassword: ADMIN_PASSWORD,
		sessionSecret: SESSION_SECRET,
		adminRequireHttps: ADMIN_REQUIRE_HTTPS,
		databasePath: DATABASE_PATH
	};
}
