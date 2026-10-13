// Opções do compilador do Paraglide, compartilhadas pelo plugin do Vite (vite.config.ts)
// e pelo script `scripts/paraglide-compile.mjs`, para os dois gerarem exatamente o mesmo runtime.
import type {CompilerOptions} from '@inlang/paraglide-js';

export const paraglideOptions = {
	project: './project.inlang',
	outdir: './src/lib/paraglide',
	emitTsDeclarations: true,
	// Na URL, o locale do próprio endereço vale primeiro; depois o cookie da escolha explícita
	// (o seletor de idioma), o Accept-Language e, por fim, o português.
	strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
	// Português na raiz (/); inglês e espanhol com prefixo (/en, /es).
	urlPatterns: [
		{
			pattern: '/:path(.*)?',
			localized: [
				['en', '/en/:path(.*)?'],
				['es', '/es/:path(.*)?'],
				['pt-BR', '/:path(.*)?']
			]
		}
	],
	// O admin é só em português: sem prefixo, sem redirecionamento, sempre pt-BR.
	routeStrategies: [{match: '/admin/:path(.*)?', exclude: true}]
} satisfies Partial<CompilerOptions>;
