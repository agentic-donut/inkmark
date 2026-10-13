import {describe, expect, test, vi} from 'vitest';
import {FetchFontLoader} from './fetch-font-loader';

const fonts = [
	{id: 'Lobster', name: 'Lobster'},
	{id: 'Oswald', name: 'Oswald'}
];
const buffer = (n: number) => new ArrayBuffer(n);

function setup(ok: (url: string) => boolean = () => true) {
	const requested: string[] = [];
	const registered: [string, ArrayBuffer][] = [];
	const fetch = vi.fn(async (url: string) => {
		requested.push(url);
		return {ok: ok(url), arrayBuffer: async () => buffer(url.length)};
	});
	const registerFont = (id: string, data: ArrayBuffer) => void registered.push([id, data]);
	return {loader: new FetchFontLoader({fetch, fonts, registerFont}), requested, registered};
}

describe('FetchFontLoader', () => {
	test('baixa e registra todas as fontes de /fonts/<id>.ttf', async () => {
		const {loader, requested, registered} = setup();
		await loader.loadBundled();
		expect(requested.sort()).toEqual(['/fonts/Lobster.ttf', '/fonts/Oswald.ttf']);
		expect(registered.map(([id]) => id).sort()).toEqual(['Lobster', 'Oswald']);
		expect(registered[0][1]).toBeInstanceOf(ArrayBuffer);
	});

	test('resposta com erro rejeita citando a fonte', async () => {
		const {loader} = setup((url) => !url.includes('Oswald'));
		await expect(loader.loadBundled()).rejects.toThrow('Não foi possível carregar Oswald.');
	});

	test('falha de rede propaga', async () => {
		const loader = new FetchFontLoader({
			fetch: async () => {
				throw new Error('offline');
			},
			fonts,
			registerFont: () => {}
		});
		await expect(loader.loadBundled()).rejects.toThrow('offline');
	});

	test('registerCustom registra com o id custom', () => {
		const {loader, registered} = setup();
		const data = buffer(8);
		loader.registerCustom(data);
		expect(registered).toEqual([['custom', data]]);
	});
});
