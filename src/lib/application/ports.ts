import type {CatalogSettings, Variant} from '../domain/catalog/types';
import type {LogoConfig} from '../domain/editor/types';

export interface ExportFile {
	name: string;
	blob: Blob;
}

export interface LogoRenderer {
	render(config: LogoConfig, variant: Variant, options?: {background?: boolean}): string;
}

export interface FontLoader {
	loadBundled(): Promise<void>;
	registerCustom(data: ArrayBuffer): void;
}

export interface ConfigStore {
	load(): Partial<LogoConfig> | null;
	save(config: LogoConfig): void;
}

export interface FileExporter {
	svgToPng(svg: string, width: number): Promise<Blob>;
	zip(files: ExportFile[]): Promise<Blob>;
	download(blob: Blob, name: string): void;
}

export interface CatalogSettingsRepository {
	load(): Promise<CatalogSettings>;
	save(settings: CatalogSettings): Promise<void>;
}
