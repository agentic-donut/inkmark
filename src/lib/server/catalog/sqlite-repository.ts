import type {DatabaseSync, StatementSync} from 'node:sqlite';
import type {CatalogSettingsRepository} from '#lib/application/ports.ts';
import {sanitizeSettings} from '#lib/domain/catalog/index.ts';
import type {CatalogSettings} from '#lib/domain/catalog/index.ts';

interface TemplateRow {
	template_id: string;
	hidden: number;
	featured: number;
	sort_order: number | null;
	name: string | null;
	category: string | null;
}

interface MetaRow {
	key: string;
	value: string | null;
}

const DEFAULT_TEMPLATE = 'default_template';
const UPDATED_AT = 'updated_at';
/** Marca que a importação do JSON antigo já aconteceu, para nunca ressuscitá-lo. */
export const LEGACY_IMPORTED = 'legacy_json_imported';

/** Guarda as configurações do catálogo em SQLite (tabelas normalizadas). */
export class SqliteCatalogSettingsRepository implements CatalogSettingsRepository {
	private readonly selectTemplates: StatementSync;
	private readonly selectMeta: StatementSync;
	private readonly upsertTemplate: StatementSync;
	private readonly deleteTemplate: StatementSync;
	private readonly upsertMeta: StatementSync;
	private readonly deleteMeta: StatementSync;

	constructor(
		private readonly database: DatabaseSync,
		private readonly definitionIds: readonly string[]
	) {
		this.selectTemplates = database.prepare(
			'SELECT template_id, hidden, featured, sort_order, name, category FROM template_settings'
		);
		this.selectMeta = database.prepare('SELECT key, value FROM catalog_meta');
		this.upsertTemplate = database.prepare(`
			INSERT INTO template_settings (template_id, hidden, featured, sort_order, name, category)
			VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT (template_id) DO UPDATE SET
				hidden = excluded.hidden,
				featured = excluded.featured,
				sort_order = excluded.sort_order,
				name = excluded.name,
				category = excluded.category
		`);
		this.deleteTemplate = database.prepare('DELETE FROM template_settings WHERE template_id = ?');
		this.upsertMeta = database.prepare(`
			INSERT INTO catalog_meta (key, value) VALUES (?, ?)
			ON CONFLICT (key) DO UPDATE SET value = excluded.value
		`);
		this.deleteMeta = database.prepare('DELETE FROM catalog_meta WHERE key = ?');
	}

	async load(): Promise<CatalogSettings> {
		const meta = new Map(
			(this.selectMeta.all() as unknown as MetaRow[]).map((row) => [row.key, row.value])
		);
		const templates: Record<string, unknown> = {};
		for (const row of this.selectTemplates.all() as unknown as TemplateRow[]) {
			// Ausente e falso significam o mesmo no domínio; só o verdadeiro vira chave.
			const settings: Record<string, unknown> = {};
			if (row.hidden === 1) settings.hidden = true;
			if (row.featured === 1) settings.featured = true;
			if (row.sort_order !== null) settings.order = row.sort_order;
			if (row.name !== null) settings.name = row.name;
			if (row.category !== null) settings.category = row.category;
			templates[row.template_id] = settings;
		}
		// Passa pelo saneamento para descartar modelos que não existem mais no código.
		return sanitizeSettings(
			{
				defaultTemplate: meta.get(DEFAULT_TEMPLATE) ?? null,
				templates,
				updatedAt: meta.get(UPDATED_AT) ?? null
			},
			this.definitionIds
		);
	}

	/** O driver é síncrono: a transação inteira roda sem intercalar com outra chamada. */
	async save(settings: CatalogSettings): Promise<void> {
		this.replaceAll(settings);
	}

	/** Sem configuração nenhuma, nem marca de importação: banco recém-criado. */
	isEmpty(): boolean {
		const row = this.database
			.prepare(
				`SELECT (SELECT count(*) FROM template_settings) + (SELECT count(*) FROM catalog_meta) AS total`
			)
			.get() as {total: number};
		return row.total === 0;
	}

	/** Troca o estado inteiro numa transação; `extra` roda dentro dela (usado pela importação). */
	replaceAll(settings: unknown, extra?: () => void): void {
		const clean = sanitizeSettings(settings, this.definitionIds);
		this.transaction(() => {
			const wanted = new Set(Object.keys(clean.templates));
			const stored = this.selectTemplates.all() as unknown as TemplateRow[];
			for (const {template_id} of stored) {
				if (!wanted.has(template_id)) this.deleteTemplate.run(template_id);
			}
			for (const [id, template] of Object.entries(clean.templates)) {
				this.upsertTemplate.run(
					id,
					template.hidden ? 1 : 0,
					template.featured ? 1 : 0,
					template.order ?? null,
					template.name ?? null,
					template.category ?? null
				);
			}
			this.writeMeta(DEFAULT_TEMPLATE, clean.defaultTemplate);
			this.writeMeta(UPDATED_AT, clean.updatedAt);
			extra?.();
		});
	}

	/** Grava a marca de importação; chamar dentro de `replaceAll(…, extra)`. */
	markLegacyImported(timestamp: string): void {
		this.upsertMeta.run(LEGACY_IMPORTED, timestamp);
	}

	private writeMeta(key: string, value: string | null): void {
		if (value === null) this.deleteMeta.run(key);
		else this.upsertMeta.run(key, value);
	}

	private transaction(work: () => void): void {
		this.database.exec('BEGIN IMMEDIATE');
		try {
			work();
			this.database.exec('COMMIT');
		} catch (error) {
			this.database.exec('ROLLBACK');
			throw error;
		}
	}
}
