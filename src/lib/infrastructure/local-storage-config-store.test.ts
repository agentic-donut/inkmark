import {describe, expect, test} from 'vitest';
import {DEFAULT_CONFIG} from '../domain/editor/defaults';
import {CONFIG_STORAGE_KEY, LocalStorageConfigStore} from './local-storage-config-store';

function memoryStorage(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		data,
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => void data.set(key, value)
	};
}

describe('LocalStorageConfigStore', () => {
	test('usa a chave mono-config', () => {
		expect(CONFIG_STORAGE_KEY).toBe('mono-config');
		const storage = memoryStorage();
		new LocalStorageConfigStore(storage).save(DEFAULT_CONFIG);
		expect([...storage.data.keys()]).toEqual(['mono-config']);
	});

	test('salva e recarrega a configuração', () => {
		const store = new LocalStorageConfigStore(memoryStorage());
		const config = {...DEFAULT_CONFIG, name: 'Acme'};
		store.save(config);
		expect(store.load()).toEqual(config);
	});

	test('lê o que a versão original gravou', () => {
		const storage = memoryStorage({'mono-config': JSON.stringify({name: 'Antigo', size: 90})});
		expect(new LocalStorageConfigStore(storage).load()).toEqual({name: 'Antigo', size: 90});
	});

	test('nada salvo, JSON quebrado ou formato inesperado dão null', () => {
		for (const stored of [undefined, '{quebrado', '"texto"', '[1]', 'null', '']) {
			const storage = memoryStorage(stored === undefined ? {} : {'mono-config': stored});
			expect(new LocalStorageConfigStore(storage).load()).toBeNull();
		}
	});

	test('nunca lança, mesmo com storage que falha ou ausente', () => {
		const broken = {
			getItem: () => {
				throw new Error('negado');
			},
			setItem: () => {
				throw new Error('cheio');
			}
		};
		const store = new LocalStorageConfigStore(broken);
		expect(store.load()).toBeNull();
		expect(() => store.save(DEFAULT_CONFIG)).not.toThrow();
		const none = new LocalStorageConfigStore(null);
		expect(none.load()).toBeNull();
		expect(() => none.save(DEFAULT_CONFIG)).not.toThrow();
	});
});
