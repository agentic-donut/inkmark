import type {
	ConfigStore,
	ExportFile,
	FileExporter,
	FontLoader,
	LogoRenderer
} from '../application/ports';
import type {CatalogEntry, TemplateDefinition, Variant} from '../domain/catalog/types';
import type {LogoConfig} from '../domain/editor/types';

export function definition(
	id: string,
	overrides: Partial<TemplateDefinition> = {}
): TemplateDefinition {
	return {id, name: id.toUpperCase(), category: 'Lettering', font: 'Oswald', ...overrides};
}

export function entry(id: string, overrides: Partial<CatalogEntry> = {}): CatalogEntry {
	return {...definition(id), hidden: false, featured: false, order: 0, ...overrides};
}

export class FakeRenderer implements LogoRenderer {
	calls: {config: LogoConfig; variant: Variant; background?: boolean}[] = [];

	render(config: LogoConfig, variant: Variant, options?: {background?: boolean}): string {
		this.calls.push({config, variant, background: options?.background});
		return `<svg width="1200" height="1000" data-name="${config.name}" data-variant="${variant}" data-template="${config.template}" data-bg="${options?.background ?? true}"></svg>`;
	}
}

export class FakeFontLoader implements FontLoader {
	loaded = false;
	custom: ArrayBuffer[] = [];
	failLoad: Error | null = null;
	failCustom = false;

	async loadBundled(): Promise<void> {
		if (this.failLoad) throw this.failLoad;
		this.loaded = true;
	}

	registerCustom(data: ArrayBuffer): void {
		if (this.failCustom) throw new Error('fonte inválida');
		this.custom.push(data);
	}
}

export class FakeConfigStore implements ConfigStore {
	saved: LogoConfig[] = [];

	constructor(private stored: Partial<LogoConfig> | null = null) {}

	load(): Partial<LogoConfig> | null {
		return this.stored;
	}

	save(config: LogoConfig): void {
		this.saved.push(config);
	}
}

export class FakeFileExporter implements FileExporter {
	downloads: {name: string; blob: Blob}[] = [];
	zipped: ExportFile[][] = [];
	pngWidths: number[] = [];
	failPng = false;

	async svgToPng(svg: string, width: number): Promise<Blob> {
		if (this.failPng) throw new Error('png');
		this.pngWidths.push(width);
		return new Blob([`png:${svg}`], {type: 'image/png'});
	}

	async zip(files: ExportFile[]): Promise<Blob> {
		this.zipped.push(files);
		return new Blob(['zip']);
	}

	download(blob: Blob, name: string): void {
		this.downloads.push({name, blob});
	}
}
