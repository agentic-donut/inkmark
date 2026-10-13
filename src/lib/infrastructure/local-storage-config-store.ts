import type {ConfigStore} from '../application/ports';
import type {LogoConfig} from '../domain/editor/types';

/** Mesma chave da versão original, para não perder a configuração salva dos usuários. */
export const CONFIG_STORAGE_KEY = 'mono-config';

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

/** Nunca lança: sem storage (SSR, modo privado, cota cheia) o editor segue funcionando sem salvar. */
export class LocalStorageConfigStore implements ConfigStore {
	constructor(
		private readonly storage: StorageLike | null,
		private readonly key: string = CONFIG_STORAGE_KEY
	) {}

	load(): Partial<LogoConfig> | null {
		try {
			const text = this.storage?.getItem(this.key);
			if (!text) return null;
			const parsed: unknown = JSON.parse(text);
			return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
				? (parsed as Partial<LogoConfig>)
				: null;
		} catch {
			return null;
		}
	}

	save(config: LogoConfig): void {
		try {
			this.storage?.setItem(this.key, JSON.stringify(config));
		} catch {
			// Armazenamento indisponível ou cheio: perder o rascunho não deve quebrar o editor.
		}
	}
}
