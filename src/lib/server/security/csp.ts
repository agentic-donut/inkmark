// Política de conteúdo (CSP) do site. É consumida pelo `vite.config.ts` (opção `csp` do SvelteKit),
// que acrescenta sozinho o nonce de cada <script> e <style> que ele mesmo gera. Sem imports de
// propósito (só um import de tipo): o arquivo roda no Node pelo Vite antes de qualquer alias existir.
//
// Por que cada exceção existe:
// - `style-src-attr 'unsafe-inline'`: o Svelte e o motor de logos usam `style="..."` (fonte da prévia,
//   `color:` do SVG). Atributo de estilo não executa script; o que importa, <style> e <link>, segue com nonce.
// - `img-src data: blob:`: a exportação em PNG desenha o SVG de um `blob:` no canvas.
// - Nada de `unsafe-eval` nem `unsafe-inline` em script-src.
import type {sveltekit} from '@sveltejs/kit/vite';

type KitOptions = NonNullable<Parameters<typeof sveltekit>[0]>;

export const cspDirectives: NonNullable<NonNullable<KitOptions['csp']>['directives']> = {
	'default-src': ['self'],
	'script-src': ['self'],
	'style-src': ['self'],
	'style-src-attr': ['unsafe-inline'],
	'img-src': ['self', 'data:', 'blob:'],
	'font-src': ['self'],
	'connect-src': ['self'],
	'object-src': ['none'],
	'base-uri': ['self'],
	'form-action': ['self'],
	'frame-ancestors': ['none'],
	'manifest-src': ['self'],
	'worker-src': ['self']
};
