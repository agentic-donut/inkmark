import type {CatalogEntry} from '../domain/catalog/types';
import type {LogoConfig} from '../domain/editor/types';
import {cardConfig} from './card-config';
import type {FileExporter, LogoRenderer} from './ports';

export const CONTACT_SHEET_FILENAME = 'inkmark-prancha.svg';

const COLUMNS = 4;
const CELL_WIDTH = 600;
const CELL_HEIGHT = 550;
const LOGO_HEIGHT = 500;
const LABEL_Y = 528;

const escapeXml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function cell(entry: CatalogEntry, index: number, svg: string): string {
	const x = (index % COLUMNS) * CELL_WIDTH;
	const y = Math.floor(index / COLUMNS) * CELL_HEIGHT;
	// O motor desenha em 1200×1000; cada célula mostra a logo na metade do tamanho.
	const scaled = svg.replace(
		'width="1200" height="1000"',
		`width="${CELL_WIDTH}" height="${LOGO_HEIGHT}"`
	);
	const label = `<text x="${CELL_WIDTH / 2}" y="${LABEL_Y}" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#777">${escapeXml(entry.name)}</text>`;
	return `<g transform="translate(${x},${y})">${scaled}${label}</g>`;
}

/** Uma folha só com todos os modelos, 4 por linha, cada um com o nome embaixo. */
export function buildContactSheet(
	entries: readonly CatalogEntry[],
	config: LogoConfig,
	{useMyName}: {useMyName: boolean},
	renderer: LogoRenderer
): string {
	const rows = Math.ceil(entries.length / COLUMNS);
	const cells = entries
		.map((entry, index) =>
			cell(entry, index, renderer.render(cardConfig(entry, config, useMyName), 'light'))
		)
		.join('');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${COLUMNS * CELL_WIDTH}" height="${rows * CELL_HEIGHT}"><rect width="100%" height="100%" fill="white"/>${cells}</svg>`;
}

export interface ContactSheetDownloadOptions {
	useMyName: boolean;
	/** Nome do arquivo baixado; muda com o idioma. O padrão é o português. */
	filename?: string;
}

export function downloadContactSheet(
	entries: readonly CatalogEntry[],
	config: LogoConfig,
	options: ContactSheetDownloadOptions,
	deps: {renderer: LogoRenderer; exporter: Pick<FileExporter, 'download'>}
): void {
	const svg = buildContactSheet(entries, config, options, deps.renderer);
	const filename = options.filename ?? CONTACT_SHEET_FILENAME;
	deps.exporter.download(new Blob([svg], {type: 'image/svg+xml'}), filename);
}
