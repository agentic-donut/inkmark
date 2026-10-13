import type {FontLoader} from '../application/ports';
import {CUSTOM_FONT_ID} from '../domain/editor/defaults';

export interface FetchFontLoaderDeps {
	fetch: (url: string) => Promise<Pick<Response, 'ok' | 'arrayBuffer'>>;
	fonts: readonly {id: string; name: string}[];
	registerFont: (id: string, data: ArrayBuffer) => void;
}

export class FetchFontLoader implements FontLoader {
	constructor(private readonly deps: FetchFontLoaderDeps) {}

	async loadBundled(): Promise<void> {
		await Promise.all(this.deps.fonts.map((font) => this.loadOne(font)));
	}

	registerCustom(data: ArrayBuffer): void {
		this.deps.registerFont(CUSTOM_FONT_ID, data);
	}

	private async loadOne(font: {id: string; name: string}): Promise<void> {
		const response = await this.deps.fetch(`/fonts/${font.id}.ttf`);
		if (!response.ok) throw new Error(`Não foi possível carregar ${font.name}.`);
		this.deps.registerFont(font.id, await response.arrayBuffer());
	}
}
