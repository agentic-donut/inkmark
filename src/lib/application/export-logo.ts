import {fileSlug} from '../domain/editor/file-slug';
import type {LogoConfig} from '../domain/editor/types';
import type {Variant} from '../domain/catalog/types';
import type {ExportFile, FileExporter, LogoRenderer} from './ports';

export interface ExportOptions {
	variants: 'both' | 'light' | 'dark';
	formats: 'both' | 'svg' | 'png';
	/** Largura do PNG em pixels; a altura segue a proporção 6:5 da logo. */
	width: number;
	transparent: boolean;
}

/** Trecho do nome do arquivo que identifica a versão (`marca-clara.svg`); muda com o idioma. */
export type VariantLabels = Readonly<Record<Variant, string>>;

const DEFAULT_VARIANT_LABELS: VariantLabels = {light: 'clara', dark: 'escura'};

export interface ExportDeps {
	renderer: LogoRenderer;
	exporter: FileExporter;
	/** Nomes das versões nos arquivos; o padrão é o português. */
	variantLabels?: VariantLabels;
}

export interface ExportResult {
	/** Nomes dos arquivos gerados, antes de qualquer compactação. */
	files: string[];
	/** Nome do arquivo que foi baixado (o próprio arquivo ou o ZIP). */
	downloaded: string;
	zipped: boolean;
}

type Format = 'svg' | 'png';

function variantsOf(choice: ExportOptions['variants']): Variant[] {
	return choice === 'both' ? ['light', 'dark'] : [choice];
}

function formatsOf(choice: ExportOptions['formats']): Format[] {
	return choice === 'both' ? ['svg', 'png'] : [choice];
}

async function buildFile(
	svg: string,
	name: string,
	format: Format,
	width: number,
	exporter: FileExporter
): Promise<ExportFile> {
	const blob =
		format === 'svg'
			? new Blob([svg], {type: 'image/svg+xml'})
			: await exporter.svgToPng(svg, width);
	return {name, blob};
}

export async function exportLogo(
	config: LogoConfig,
	options: ExportOptions,
	{renderer, exporter, variantLabels = DEFAULT_VARIANT_LABELS}: ExportDeps
): Promise<ExportResult> {
	const slug = fileSlug(config.name);
	const files: ExportFile[] = [];
	for (const variant of variantsOf(options.variants)) {
		const svg = renderer.render(config, variant, {background: !options.transparent});
		for (const format of formatsOf(options.formats)) {
			const name = `${slug}-${variantLabels[variant]}.${format}`;
			files.push(await buildFile(svg, name, format, options.width, exporter));
		}
	}

	const names = files.map((file) => file.name);
	if (files.length === 1) {
		exporter.download(files[0].blob, files[0].name);
		return {files: names, downloaded: files[0].name, zipped: false};
	}
	const zipName = `${slug}-logos.zip`;
	exporter.download(await exporter.zip(files), zipName);
	return {files: names, downloaded: zipName, zipped: true};
}
