import JSZip from 'jszip';
import {describe, expect, test, vi} from 'vitest';
import {BrowserFileExporter, type BrowserFileExporterDeps} from './browser-file-exporter';

function setup(options: {imageFails?: boolean; blobFails?: boolean; noContext?: boolean} = {}) {
	const urls: string[] = [];
	const revoked: string[] = [];
	const timers: (() => void)[] = [];
	const drawn: unknown[][] = [];
	const clicks: {href: string; download: string}[] = [];

	const canvas = {
		width: 0,
		height: 0,
		getContext: () =>
			options.noContext ? null : {drawImage: (...args: unknown[]) => void drawn.push(args)},
		toBlob: (callback: (blob: Blob | null) => void) =>
			callback(options.blobFails ? null : new Blob(['png'], {type: 'image/png'}))
	};
	const image = {
		onload: null as null | (() => void),
		onerror: null as null | (() => void),
		set src(_value: string) {
			queueMicrotask(() => (options.imageFails ? image.onerror?.() : image.onload?.()));
		}
	};
	const anchor = {
		href: '',
		download: '',
		click() {
			clicks.push({href: this.href, download: this.download});
		}
	};
	let counter = 0;
	const deps: BrowserFileExporterDeps = {
		createImage: () => image as unknown as HTMLImageElement,
		createCanvas: () => canvas as unknown as HTMLCanvasElement,
		createAnchor: () => anchor as unknown as HTMLAnchorElement,
		url: {
			createObjectURL: () => {
				const url = `blob:${++counter}`;
				urls.push(url);
				return url;
			},
			revokeObjectURL: (url: string) => void revoked.push(url)
		},
		setTimeout: vi.fn((callback: () => void) => void timers.push(callback))
	};
	return {exporter: new BrowserFileExporter(deps), canvas, urls, revoked, timers, drawn, clicks};
}

describe('svgToPng', () => {
	test('desenha no canvas com proporção 6:5 e revoga a URL', async () => {
		const {exporter, canvas, drawn, urls, revoked} = setup();
		const blob = await exporter.svgToPng('<svg/>', 2400);
		expect(blob.type).toBe('image/png');
		expect([canvas.width, canvas.height]).toEqual([2400, 2000]);
		expect(drawn[0].slice(1)).toEqual([0, 0, 2400, 2000]);
		expect(revoked).toEqual(urls);
	});

	test('arredonda a altura', async () => {
		const {exporter, canvas} = setup();
		await exporter.svgToPng('<svg/>', 1001);
		expect(canvas.height).toBe(834);
	});

	test.each([
		['imagem não carrega', {imageFails: true}, 'Não foi possível converter o SVG em PNG.'],
		['toBlob devolve null', {blobFails: true}, 'Não foi possível gerar o PNG.'],
		['canvas sem contexto', {noContext: true}, 'Não foi possível gerar o PNG.']
	])('%s: rejeita e ainda revoga a URL', async (_name, options, message) => {
		const {exporter, urls, revoked} = setup(options);
		await expect(exporter.svgToPng('<svg/>', 100)).rejects.toThrow(message);
		expect(revoked).toEqual(urls);
	});
});

describe('download', () => {
	test('clica na âncora e só revoga a URL depois do atraso', () => {
		const {exporter, clicks, urls, revoked, timers} = setup();
		exporter.download(new Blob(['x']), 'arquivo.svg');
		expect(clicks).toEqual([{href: urls[0], download: 'arquivo.svg'}]);
		expect(revoked).toEqual([]);
		timers[0]();
		expect(revoked).toEqual([urls[0]]);
	});
});

describe('zip', () => {
	test('empacota os arquivos com seus nomes', async () => {
		const {exporter} = setup();
		const blob = await exporter.zip([
			{name: 'a.svg', blob: new Blob(['<svg/>'])},
			{name: 'b.png', blob: new Blob(['png'])}
		]);
		const archive = await JSZip.loadAsync(await blob.arrayBuffer());
		expect(Object.keys(archive.files).sort()).toEqual(['a.svg', 'b.png']);
		expect(await archive.file('a.svg')!.async('string')).toBe('<svg/>');
	});
});
