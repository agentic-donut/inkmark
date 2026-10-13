<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import {tick} from 'svelte';
	import type {CatalogEntry, CategoryFilter} from '#lib/domain/catalog/index.ts';
	import type {Page} from '#lib/domain/pagination/index.ts';
	import PageFolio from '#lib/ui/components/shared/PageFolio.svelte';
	import {scrollToElement} from '#lib/ui/scroll.ts';
	import ClassifiedCard from './ClassifiedCard.svelte';
	import ClassifiedsBand from './ClassifiedsBand.svelte';
	import {pageFolioLabels} from './page-folio-labels.ts';

	interface Props {
		counts: Record<CategoryFilter, number>;
		category: CategoryFilter;
		/** A página atual dos anúncios (já filtrada pela categoria). */
		paged: Page<CatalogEntry>;
		/** Número de série por id do modelo. */
		numbers: Readonly<Record<string, string>>;
		selectedId: string;
		useMyName: boolean;
		sheetBusy: boolean;
		sheetDisabled: boolean;
		render: (entry: CatalogEntry) => string;
		oncategory: (category: CategoryFilter) => void;
		onusemyname: (value: boolean) => void;
		onselect: (entry: CatalogEntry) => void;
		onpage: (page: number) => void;
		onsheet: () => void;
	}
	let {
		counts,
		category,
		paged,
		numbers,
		selectedId,
		useMyName,
		sheetBusy,
		sheetDisabled,
		render,
		oncategory,
		onusemyname,
		onselect,
		onpage,
		onsheet
	}: Props = $props();

	let section: HTMLElement;

	// Quem folheia está no pé da página: ao virar, a nova página começa no topo da faixa.
	async function turn(page: number) {
		onpage(page);
		await tick();
		scrollToElement(section);
	}
</script>

<section class="mt-[30px] scroll-mt-3" aria-label={m.classifieds_title()} bind:this={section}>
	<ClassifiedsBand {counts} {category} {sheetBusy} {sheetDisabled} {oncategory} {onsheet} />
	<div
		class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-ink px-1 py-2 text-[12px] italic"
	>
		<label class="inline-flex cursor-pointer items-center gap-2 text-[13px] not-italic">
			<input
				class="m-0 size-[15px] accent-ink"
				type="checkbox"
				checked={useMyName}
				onchange={(event) => onusemyname(event.currentTarget.checked)}
			/>
			{m.classifieds_use_my_name()}
		</label>
		<span aria-live="polite"
			>{paged.pageCount > 1
				? m.classifieds_range({first: paged.first, last: paged.last, total: paged.total})
				: m.classifieds_total({count: paged.total})}</span
		>
	</div>
	<!-- Cada card traz só a borda de cima e a da direita; o recorte esconde as que sobram nas bordas. -->
	<div class="overflow-hidden rule-b-double">
		{#if paged.items.length}
			<div
				class="-mt-px -mr-px grid grid-cols-[repeat(4,1fr)] [@media(520px<width<=800px)]:grid-cols-[repeat(2,1fr)] [@media(800px<width<=1100px)]:grid-cols-[repeat(3,1fr)] [@media(width<=520px)]:grid-cols-[1fr]"
			>
				{#each paged.items as entry (entry.id)}
					<ClassifiedCard
						{entry}
						number={numbers[entry.id] ?? ''}
						selected={entry.id === selectedId}
						{render}
						{onselect}
					/>
				{/each}
			</div>
		{:else}
			<p class="py-10 text-center italic">{m.classifieds_empty()}</p>
		{/if}
	</div>
	<PageFolio
		page={paged.page}
		pageCount={paged.pageCount}
		label={m.classifieds_pages_label()}
		labels={pageFolioLabels()}
		onpage={turn}
	/>
</section>
