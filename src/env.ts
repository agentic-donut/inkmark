// Variáveis de ambiente do servidor (SvelteKit 3). Valores lidos de `$app/env/private`.
// Todas são opcionais aqui: sem ADMIN_PASSWORD e SESSION_SECRET válidos o admin fica desativado.
import {defineEnvVars} from '@sveltejs/kit/env';

const optional = (value: string | undefined) => (value?.trim() ? value : undefined);

export const variables = defineEnvVars({
	ADMIN_PASSWORD: {
		schema: optional,
		description: 'Senha única do painel /admin. Sem ela o admin fica desativado.'
	},
	SESSION_SECRET: {
		schema: optional,
		description: 'Segredo (32+ caracteres) que assina o cookie de sessão do admin.'
	},
	ADMIN_REQUIRE_HTTPS: {
		schema: (value) => ['true', '1'].includes(value?.trim().toLowerCase() ?? ''),
		description:
			'Com "true", todo /admin responde 404 a pedidos que não chegaram por HTTPS (o protocolo vem de PROTOCOL_HEADER). Padrão: desligado.'
	},
	DATABASE_PATH: {
		schema: (value) => optional(value) ?? 'data/inkmark.db',
		description: 'Arquivo SQLite com as configurações do catálogo.'
	}
});
