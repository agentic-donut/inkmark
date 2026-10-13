import {posix} from 'node:path';
import type {Plugin} from 'vite';

/**
 * Arquivos que o SvelteKit gera no desenvolvimento com os valores REAIS das variáveis de ambiente
 * (`set_env({ADMIN_PASSWORD: ..., SESSION_SECRET: ...})`). O Vite serve qualquer arquivo sob a raiz,
 * então com `vite dev --host` qualquer máquina da rede lia a senha e o segredo em
 * `/.svelte-kit/generated/dev/env/config.js`. O navegador nunca importa esses arquivos; só o servidor
 * (que os carrega sem passar por HTTP). A proteção principal é o `server.fs.deny` do Vite com estes
 * padrões (vite.config.ts), que confere o caminho resolvido; este plugin responde 404 antes, como reforço.
 */

/** Padrões (picomatch) dos arquivos gerados com segredos, para o `server.fs.deny` do Vite. */
export const DEV_SECRET_FILES = [
	'**/.svelte-kit/generated/dev/env/config.js',
	'**/.svelte-kit/generated/dev/env/private/**'
];

export function isBlockedDevPath(url: string | undefined): boolean {
	if (!url) return false;
	let pathname: string;
	try {
		// Sem o parser de URL: com `//` no começo ele leria `.svelte-kit` como nome de servidor.
		// Tira consulta e âncora, decodifica, junta barras duplas ou invertidas (o Vite abre o mesmo
		// arquivo) e resolve `.` e `..`.
		const raw = url.split(/[?#]/, 1)[0];
		pathname = posix.normalize(decodeURIComponent(raw).replace(/[\\/]+/g, '/'));
	} catch {
		return true;
	}
	// Sem âncora no começo: `/@fs/<raiz do projeto>/.svelte-kit/...` também é um caminho válido do Vite.
	// Sem diferenciar maiúsculas: no macOS e no Windows `/.SVELTE-KIT/.../CONFIG.JS` abre o mesmo arquivo.
	return /\.svelte-kit\/generated\/dev\/env\/(config|private\/)/i.test(pathname);
}

export function blockDevSecrets(): Plugin {
	return {
		name: 'inkmark:block-dev-secrets',
		apply: 'serve',
		configureServer(server) {
			// Registrado direto (não no retorno do hook): entra antes dos middlewares internos do Vite.
			server.middlewares.use((request, response, next) => {
				if (!isBlockedDevPath(request.url)) return next();
				response.statusCode = 404;
				response.end('Not found');
			});
		}
	};
}
