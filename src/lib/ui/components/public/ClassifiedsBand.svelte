<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import type {CategoryFilter} from '#lib/domain/catalog/index.ts';

	interface Props {
		counts: Record<CategoryFilter, number>;
		category: CategoryFilter;
		sheetBusy: boolean;
		sheetDisabled: boolean;
		oncategory: (category: CategoryFilter) => void;
		onsheet: () => void;
	}
	let {counts, category, sheetBusy, sheetDisabled, oncategory, onsheet}: Props = $props();

	const TABS: CategoryFilter[] = ['Todos', 'Lettering', 'Selos', 'Emblemas'];
	// Os ids das categorias são do domínio (e do admin); só o rótulo muda com o idioma.
	const CATEGORY_LABEL: Record<CategoryFilter, () => string> = {
		Todos: m.category_all,
		Lettering: m.category_Lettering,
		Selos: m.category_Selos,
		Emblemas: m.category_Emblemas
	};

	// Botões de texto sobre a faixa preta: herdam o espaçamento de letras e o foco é claro.
	const control =
		'cursor-pointer px-0 py-1 text-[11px] font-bold tracking-[inherit] uppercase focus-visible:outline-paper';
</script>

<div
	class="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 bg-ink px-3.5 py-2 text-[13px] font-bold tracking-[0.24em] text-paper uppercase [@media(width<=760px)]:tracking-[0.14em]"
>
	<h2
		class="font-masthead text-[30px] font-normal tracking-[0.02em] normal-case [@media(width<=760px)]:flex-[1_0_100%]"
	>
		{m.classifieds_title()}
	</h2>
	<nav class="flex flex-wrap gap-x-5 gap-y-1.5" aria-label={m.classifieds_categories_label()}>
		{#each TABS as tab (tab)}
			<button
				type="button"
				class="{control} hover:not-aria-pressed:underline hover:not-aria-pressed:decoration-dotted hover:not-aria-pressed:underline-offset-4 aria-pressed:underline aria-pressed:underline-offset-4"
				aria-pressed={tab === category}
				onclick={() => oncategory(tab)}
			>
				{CATEGORY_LABEL[tab]()} ({counts[tab]})
			</button>
		{/each}
	</nav>
	<button
		type="button"
		class="{control} hover:enabled:underline hover:enabled:decoration-dotted hover:enabled:underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
		disabled={sheetDisabled || sheetBusy}
		onclick={onsheet}
	>
		{sheetBusy ? m.classifieds_sheet_busy() : m.classifieds_sheet()}
	</button>
</div>
