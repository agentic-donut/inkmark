<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import type {CatalogEntry} from '#lib/domain/catalog/index.ts';
	import {templateDescription} from '#lib/i18n/template-content.ts';
	import {getLocale} from '#lib/paraglide/runtime.js';
	import InkLogo from '#lib/ui/components/shared/InkLogo.svelte';
	import {inView} from './in-view.ts';

	interface Props {
		entry: CatalogEntry;
		/** Número de série do modelo, já formatado (ex.: "049"). */
		number: string;
		selected: boolean;
		/** Desenha a logo do card; só roda depois que o card chega perto da tela. */
		render: (entry: CatalogEntry) => string;
		onselect: (entry: CatalogEntry) => void;
	}
	let {entry, number, selected, render, onselect}: Props = $props();
	const description = $derived(templateDescription(entry.id, getLocale(), entry.desc));

	const CATEGORY_LABEL = {
		Lettering: m.category_one_Lettering,
		Selos: m.category_one_Selos,
		Emblemas: m.category_one_Emblemas
	} as const;

	// Selos de canto: "Destaque" à esquerda, "Em uso" à direita (as cores e o lado vêm de quem usa).
	const flag =
		'absolute top-3 z-1 border border-ink px-1.5 pt-0.5 pb-px text-[9px] font-bold tracking-caps uppercase';

	let seen = $state(false);
	const svg = $derived(seen ? render(entry) : '');
</script>

<button
	type="button"
	class={[
		'relative flex w-full cursor-pointer flex-col justify-start border-t border-r border-ink px-[18px] pt-4 pb-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-6 focus-visible:outline-ink',
		selected
			? 'bg-[color-mix(in_srgb,var(--ink)_9%,transparent)] shadow-[inset_0_0_0_3px_var(--paper)] outline-1 -outline-offset-8 outline-ink'
			: 'hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]'
	]}
	aria-pressed={selected}
	onclick={() => onselect(entry)}
	use:inView={() => (seen = true)}
>
	{#if entry.featured}<span class="{flag} left-3.5">{m.card_featured()}</span>{/if}
	{#if selected}<span class="{flag} right-3.5 bg-ink text-paper">{m.card_selected()}</span>{/if}
	<span class="block aspect-[6/5]" aria-hidden="true">
		{#if svg}<InkLogo {svg} />{/if}
	</span>
	<span class="mt-1 mb-0.5 block text-[15px] font-bold tracking-[0.12em] uppercase"
		>{entry.name}</span
	>
	<span class="block text-[12px] italic"
		>{m.card_meta({category: CATEGORY_LABEL[entry.category](), number})}</span
	>
	{#if description}<span class="mt-0.5 block text-[13.5px] leading-[1.35] text-ink-soft"
			>{description}</span
		>{/if}
</button>
