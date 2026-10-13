import {exportLogo, type ExportDeps, type ExportOptions} from '../../application/export-logo';
import type {LogoConfig} from '../../domain/editor/types';

const DEFAULT_EXPORT_OPTIONS: Readonly<ExportOptions> = Object.freeze({
	variants: 'both',
	formats: 'both',
	width: 2400,
	transparent: true
});

/** Em que ponto está a exportação; quem mostra a tela traduz o código em texto. */
export type ExportStatus = 'idle' | 'preparing' | 'done' | 'failed';

export class ExportState {
	open = $state(false);
	options = $state<ExportOptions>({...DEFAULT_EXPORT_OPTIONS});
	status = $state<ExportStatus>('idle');
	busy = $state(false);

	failed = $derived(this.status === 'failed');

	/** O PNG só tem resolução quando o formato inclui PNG. */
	resolutionEnabled = $derived(this.options.formats !== 'svg');

	readonly #deps: ExportDeps;
	readonly #getConfig: () => LogoConfig;

	constructor(deps: ExportDeps, getConfig: () => LogoConfig) {
		this.#deps = deps;
		this.#getConfig = getConfig;
	}

	openDialog(): void {
		this.open = true;
	}

	closeDialog(): void {
		this.open = false;
	}

	setOption<K extends keyof ExportOptions>(key: K, value: ExportOptions[K]): void {
		this.options[key] = value;
	}

	async run(): Promise<boolean> {
		if (this.busy) return false;
		this.busy = true;
		this.status = 'preparing';
		try {
			await exportLogo(this.#getConfig(), $state.snapshot(this.options), this.#deps);
			this.status = 'done';
			return true;
		} catch (error) {
			console.error(error);
			this.status = 'failed';
			return false;
		} finally {
			this.busy = false;
		}
	}
}
