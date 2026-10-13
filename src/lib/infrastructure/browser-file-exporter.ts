import JSZip from 'jszip';
import type {ExportFile, FileExporter} from '../application/ports';

const REVOKE_DELAY_MS = 5000;
const PROPORTION = 5 / 6;

/** Partes do navegador que o exportador usa; os testes entregam versões falsas. */
export interface BrowserFileExporterDeps {
	createImage: () => HTMLImageElement;
	createCanvas: () => HTMLCanvasElement;
	createAnchor: () => HTMLAnchorElement;
	url: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>;
	setTimeout: (callback: () => void, ms: number) => unknown;
}

export function browserDeps(): BrowserFileExporterDeps {
	return {
		createImage: () => new Image(),
		createCanvas: () => document.createElement('canvas'),
		createAnchor: () => document.createElement('a'),
		url: URL,
		setTimeout: (callback, ms) => window.setTimeout(callback, ms)
	};
}

function loadImage(image: HTMLImageElement, url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		image.onload = () => resolve();
		image.onerror = () => reject(new Error('Não foi possível converter o SVG em PNG.'));
		image.src = url;
	});
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível gerar o PNG.'))),
			'image/png'
		)
	);
}

export class BrowserFileExporter implements FileExporter {
	constructor(private readonly deps: BrowserFileExporterDeps) {}

	async svgToPng(svg: string, width: number): Promise<Blob> {
		const {url} = this.deps;
		const objectUrl = url.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
		try {
			const image = this.deps.createImage();
			await loadImage(image, objectUrl);
			const canvas = this.deps.createCanvas();
			canvas.width = width;
			canvas.height = Math.round(width * PROPORTION);
			const context = canvas.getContext('2d');
			if (!context) throw new Error('Não foi possível gerar o PNG.');
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			return await canvasToBlob(canvas);
		} finally {
			url.revokeObjectURL(objectUrl);
		}
	}

	async zip(files: ExportFile[]): Promise<Blob> {
		const archive = new JSZip();
		for (const file of files) archive.file(file.name, file.blob);
		return archive.generateAsync({type: 'blob'});
	}

	download(blob: Blob, name: string): void {
		const {url} = this.deps;
		const objectUrl = url.createObjectURL(blob);
		const anchor = this.deps.createAnchor();
		anchor.href = objectUrl;
		anchor.download = name;
		anchor.click();
		// Revogar na hora cancelaria o download em alguns navegadores.
		this.deps.setTimeout(() => url.revokeObjectURL(objectUrl), REVOKE_DELAY_MS);
	}
}
