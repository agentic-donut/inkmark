import {chmodSync, existsSync, mkdirSync} from 'node:fs';
import {dirname} from 'node:path';

/**
 * Prepara o lugar de um arquivo de dados do servidor: a pasta nasce só do dono (0700) e o arquivo,
 * se for novo, também (0600). Pasta e arquivo que já existem não são tocados: quem os criou escolheu
 * as permissões, e mudar o que não é nosso seria pior que deixar como está.
 * Devolve uma função para chamar depois de abrir o banco (é quando o arquivo passa a existir).
 */
export function preparePrivateFile(path: string): () => void {
	mkdirSync(dirname(path), {recursive: true, mode: 0o700});
	const existed = existsSync(path);
	return () => {
		if (existed) return;
		try {
			chmodSync(path, 0o600);
		} catch {
			// Sistemas de arquivos sem permissões Unix (ex.: alguns volumes montados): segue sem restringir.
		}
	};
}
