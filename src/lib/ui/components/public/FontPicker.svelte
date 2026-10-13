<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	interface FontOption {
		id: string;
		name: string;
	}

	interface Props {
		fonts: readonly FontOption[];
		value: string;
		/** Texto mostrado em cada opção, no desenho da própria fonte. */
		sample: string;
		customAvailable: boolean;
		onselect: (id: string) => void;
	}
	let {fonts, value, sample, customAvailable, onselect}: Props = $props();

	const COLLAPSED_COUNT = 5;
	// Ordem de vitrine: as fontes que mais mudam o caráter da marca vêm primeiro.
	const SHOWCASE = [
		'BarlowCondensed',
		'PirataOne',
		'Lobster',
		'AlfaSlabOne',
		'BebasNeue',
		'Yellowtail'
	];

	let expanded = $state(false);

	const label = (font: FontOption) => font.name.replace(' Bold', '');
	const ordered = $derived.by(() => {
		const rank = (id: string) => {
			const index = SHOWCASE.indexOf(id);
			return index === -1 ? SHOWCASE.length : index;
		};
		const list: FontOption[] = [...fonts].sort((a, b) => rank(a.id) - rank(b.id));
		return customAvailable ? [{id: 'custom', name: m.font_custom()}, ...list] : list;
	});
	// A fonte escolhida nunca fica escondida, mesmo com a lista recolhida.
	const shown = $derived(
		expanded ? ordered : ordered.filter((font, i) => i < COLLAPSED_COUNT || font.id === value)
	);
	const hiddenCount = $derived(ordered.length - shown.length);
</script>

<fieldset class="my-3 min-w-0 border-y border-ink py-1.5">
	<legend class="visually-hidden">{m.fonts_legend()}</legend>
	<div id="lista-de-tipos">
		{#each shown as font (font.id)}
			<label
				class={[
					'flex cursor-pointer items-baseline justify-between gap-2 text-[21px] has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-ink',
					font.id === value
						? '-mx-1.5 bg-ink px-1.5 py-[3px] text-paper'
						: 'py-[3px] hover:ink-wash'
				]}
			>
				<input
					type="radio"
					class="visually-hidden"
					name="tipo"
					value={font.id}
					checked={font.id === value}
					onchange={() => onselect(font.id)}
				/>
				<span
					class="min-w-0 flex-1 truncate"
					style:font-family={font.id === 'custom' ? null : `'${font.id}'`}>{sample}</span
				>
				<small class="flex-none text-[10px] tracking-[0.05em] uppercase">{label(font)}</small>
			</label>
		{/each}
	</div>
	{#if hiddenCount > 0 || expanded}
		<button
			type="button"
			class="mt-1.5 block w-full cursor-pointer border-t border-dotted border-ink px-0 pt-[5px] pb-[3px] text-center text-[11px] tracking-[0.08em] uppercase italic hover:underline hover:underline-offset-3"
			aria-expanded={expanded}
			aria-controls="lista-de-tipos"
			onclick={() => (expanded = !expanded)}
		>
			{expanded ? m.fonts_less() : m.fonts_more({count: hiddenCount})}
		</button>
	{/if}
</fieldset>
