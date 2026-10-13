// Gera src/lib/paraglide/ (mensagens e runtime) sem passar pelo Vite.
// Usado antes do svelte-check e do ESLint, que leem os arquivos gerados.
import {compile} from '@inlang/paraglide-js';
import {paraglideOptions} from '../paraglide.options.ts';

await compile({...paraglideOptions, strategy: [...paraglideOptions.strategy]});
