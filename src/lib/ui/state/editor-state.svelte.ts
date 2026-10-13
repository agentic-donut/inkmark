import type {ConfigStore, FontLoader, LogoRenderer} from '../../application/ports';
import type {TemplateDefinition, Variant} from '../../domain/catalog/types';
import {applyTemplate, type TemplateChoice} from '../../domain/editor/apply-template';
import {CUSTOM_FONT_ID, DEFAULT_CONFIG} from '../../domain/editor/defaults';
import {
	migrateLegacyConfig,
	sanitizeConfig,
	type SanitizeContext
} from '../../domain/editor/sanitize-config';
import type {LogoConfig} from '../../domain/editor/types';

/** Texto de prova da fonte importada: maiúsculas, minúsculas, acentos, números e pontuação. */
const FONT_PROBE = 'AaZz ÁéÍõÜç Ññ 0123456789 &.-';

export interface EditorStateDeps {
	renderer: LogoRenderer;
	fontLoader: FontLoader;
	store: ConfigStore;
	templates: readonly TemplateDefinition[];
	fonts: readonly {id: string}[];
	/** Modelo inicial (o padrão do admin) quando não há configuração salva. */
	defaultTemplate?: TemplateChoice;
}

export class EditorState {
	config = $state.raw<LogoConfig>({...DEFAULT_CONFIG});
	variant = $state<Variant>('light');
	fontsReady = $state(false);
	/** Mensagem técnica da falha (para log); a tela mostra um texto traduzido no lugar dela. */
	fontsError = $state<string | null>(null);
	customFontAvailable = $state(false);

	readonly #deps: EditorStateDeps;

	/** O modelo em uso: nome, descrição e se aceita inclinação. */
	readonly template: TemplateDefinition | undefined;
	readonly canExport: boolean;
	readonly lightSvg: string;
	readonly darkSvg: string;
	readonly previewSvg: string;

	// Os derivados ficam no construtor porque dependem de `deps`, que só existe depois dele.
	constructor(deps: EditorStateDeps) {
		this.#deps = deps;
		this.template = $derived(deps.templates.find((t) => t.id === this.config.template));
		this.canExport = $derived(this.fontsReady && this.config.name.trim() !== '');
		this.lightSvg = $derived(this.#renderIfReady('light'));
		this.darkSvg = $derived(this.#renderIfReady('dark'));
		this.previewSvg = $derived(this.variant === 'dark' ? this.darkSvg : this.lightSvg);
	}

	/** Roda no navegador: recupera a configuração salva e carrega as fontes. */
	async init(): Promise<void> {
		this.config = this.#initialConfig();
		this.fontsError = null;
		try {
			await this.#deps.fontLoader.loadBundled();
			this.fontsReady = true;
		} catch (error) {
			this.fontsError =
				error instanceof Error ? error.message : 'Failed to load the bundled fonts.';
		}
	}

	setField<K extends keyof LogoConfig>(key: K, value: LogoConfig[K]): void {
		this.#update(sanitizeConfig({...this.config, [key]: value}, this.#context()));
	}

	selectTemplate(entry: TemplateChoice): void {
		this.#update(applyTemplate(this.config, entry));
	}

	setVariant(variant: Variant): void {
		this.variant = variant;
	}

	reset(): void {
		this.#update(this.#baseConfig());
	}

	/** Devolve false quando o arquivo não é uma fonte legível. */
	registerCustomFont(data: ArrayBuffer): boolean {
		try {
			this.#deps.fontLoader.registerCustom(data);
			// Fonte corrompida pode passar na leitura e quebrar só ao desenhar: testa antes de usar.
			this.#deps.renderer.render({...this.config, font: CUSTOM_FONT_ID, name: FONT_PROBE}, 'light');
		} catch {
			return false;
		}
		this.customFontAvailable = true;
		this.setField('font', CUSTOM_FONT_ID);
		return true;
	}

	#baseConfig(): LogoConfig {
		const {defaultTemplate} = this.#deps;
		return defaultTemplate
			? applyTemplate({...DEFAULT_CONFIG}, defaultTemplate)
			: {...DEFAULT_CONFIG};
	}

	/** Sem configuração salva, ou com um modelo que não existe mais, vale o modelo padrão. */
	#initialConfig(): LogoConfig {
		const saved = this.#deps.store.load();
		const base = this.#baseConfig();
		const known = saved?.template && this.#deps.templates.some((t) => t.id === saved.template);
		const migrated = migrateLegacyConfig(saved);
		const raw = known ? migrated : {...base, ...withoutTemplate(migrated)};
		return sanitizeConfig(raw, this.#context());
	}

	#renderIfReady(variant: Variant): string {
		return this.fontsReady
			? this.#deps.renderer.render(this.config, variant, {background: false})
			: '';
	}

	#context(): SanitizeContext {
		return {
			templateIds: this.#deps.templates.map((t) => t.id),
			fontIds: this.#deps.fonts.map((f) => f.id),
			customFontAvailable: this.customFontAvailable
		};
	}

	#update(config: LogoConfig): void {
		this.config = config;
		this.#deps.store.save(this.#persistable(config));
	}

	/** A fonte importada não sobrevive ao recarregamento; guarda a do modelo no lugar. */
	#persistable(config: LogoConfig): LogoConfig {
		if (config.font !== CUSTOM_FONT_ID) return config;
		const font = this.template?.font ?? DEFAULT_CONFIG.font;
		return {...config, font};
	}
}

function withoutTemplate(saved: Record<string, unknown>): Record<string, unknown> {
	const rest = {...saved};
	delete rest.template;
	delete rest.font;
	delete rest.ornament;
	return rest;
}
