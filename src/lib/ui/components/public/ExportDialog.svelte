<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import type {ExportStatus} from '#lib/ui/state/index.ts';
	import InkSelect from '../shared/InkSelect.svelte';

	interface Options {
		variants: 'both' | 'light' | 'dark';
		formats: 'both' | 'svg' | 'png';
		width: number;
		transparent: boolean;
	}

	interface Props {
		open: boolean;
		options: Options;
		resolutionEnabled: boolean;
		status: ExportStatus;
		failed: boolean;
		busy: boolean;
		canExport: boolean;
		onchange: <K extends keyof Options>(key: K, value: Options[K]) => void;
		onsubmit: () => void;
		onclose: () => void;
	}
	let {
		open,
		options,
		resolutionEnabled,
		status,
		failed,
		busy,
		canExport,
		onchange,
		onsubmit,
		onclose
	}: Props = $props();

	let dialog: HTMLDialogElement;

	const STATUS_TEXT: Record<ExportStatus, () => string> = {
		idle: () => '',
		preparing: m.export_status_preparing,
		done: m.export_status_done,
		failed: m.export_status_failed
	};
	const statusText = $derived(STATUS_TEXT[status]());

	// Rótulo dos campos em versalete.
	const label = 'label-caps mt-3 mb-1 tracking-[0.14em]';

	// O estado manda; o <dialog> nativo só acompanha (e avisa quando o usuário fecha com Esc).
	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	function clickedBackdrop(event: MouseEvent) {
		if (event.target === dialog) onclose();
	}
</script>

<!-- O clique no fundo escurecido fecha; o teclado já fecha com Esc, nativo do <dialog>. -->
<dialog
	class="max-h-[calc(100dvh_-_24px)] w-[min(460px,calc(100vw_-_24px))] overflow-auto border-4 border-double border-ink paper-sheet backdrop:bg-[rgb(26_25_24/0.6)]"
	bind:this={dialog}
	aria-labelledby="exportar-titulo"
	{onclose}
	onclick={clickedBackdrop}
>
	<form
		class="relative flex flex-col px-7 pt-6 pb-[22px]"
		onsubmit={(event) => {
			event.preventDefault();
			onsubmit();
		}}
	>
		<button
			type="button"
			class="absolute top-2 right-3 size-8 cursor-pointer text-[28px] leading-none focus-visible:outline-offset-2"
			aria-label={m.export_close()}
			onclick={onclose}
		>
			×
		</button>
		<p class="kicker-label">{m.export_kicker()}</p>
		<h2 id="exportar-titulo" class="mt-3 mb-0.5 font-masthead text-[46px] leading-none font-normal">
			{m.export_title()}
		</h2>
		<p class="mb-3 text-[15px] italic">{m.export_subtitle()}</p>

		<label class={label} for="exportar-versao">{m.export_variant_label()}</label>
		<InkSelect
			id="exportar-versao"
			value={options.variants}
			options={[
				{value: 'both', label: m.export_variant_both()},
				{value: 'light', label: m.export_variant_light()},
				{value: 'dark', label: m.export_variant_dark()}
			]}
			onchange={(value) => onchange('variants', value)}
		/>

		<label class={label} for="exportar-formato">{m.export_format_label()}</label>
		<InkSelect
			id="exportar-formato"
			value={options.formats}
			options={[
				{value: 'both', label: m.export_format_both()},
				{value: 'svg', label: m.export_format_svg()},
				{value: 'png', label: m.export_format_png()}
			]}
			onchange={(value) => onchange('formats', value)}
		/>

		<label class={label} for="exportar-resolucao">{m.export_resolution_label()}</label>
		<InkSelect
			id="exportar-resolucao"
			value={String(options.width)}
			disabled={!resolutionEnabled}
			options={[
				{value: '1200', label: '1200 × 1000 px'},
				{value: '2400', label: '2400 × 2000 px'},
				{value: '3600', label: '3600 × 3000 px'}
			]}
			onchange={(value) => onchange('width', Number(value))}
		/>

		<label class="mt-4 flex cursor-pointer items-center gap-2 text-[14px]">
			<input
				class="m-0 size-4 accent-ink"
				type="checkbox"
				checked={options.transparent}
				onchange={(event) => onchange('transparent', event.currentTarget.checked)}
			/>
			{m.export_transparent()}
		</label>

		<p class="mt-3.5 mb-4 text-[13px] leading-[1.45] text-ink-soft italic">
			{m.export_note()}
		</p>

		<button
			type="submit"
			class="ink-button p-[11px] text-[12px] tracking-[0.2em] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={busy || !canExport}
		>
			{m.export_submit()}
		</button>
		<p class="mt-2.5 min-h-[1.4em] text-center text-[13px]" class:font-bold={failed} role="status">
			{statusText}
		</p>
	</form>
</dialog>
