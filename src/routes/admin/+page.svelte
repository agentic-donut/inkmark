<script lang="ts">
	import {onMount, tick} from 'svelte';
	import {SvelteSet} from 'svelte/reactivity';
	import {NO_FILTER, filterRows, summarize} from '#lib/application/admin/index.ts';
	import type {RowFilter} from '#lib/application/admin/index.ts';
	import {cardConfig} from '#lib/application/card-config.ts';
	import {DEFAULT_CONFIG} from '#lib/domain/editor/defaults.ts';
	import {countByCategory} from '#lib/domain/catalog/index.ts';
	import {pageOfIndex, paginate} from '#lib/domain/pagination/index.ts';
	import {
		AdminMasthead,
		BulkBar,
		DisabledNotice,
		Feedback,
		FilterBar,
		SummaryBar,
		TemplateRow
	} from '#lib/ui/components/admin/index.ts';
	import PageFolio from '#lib/ui/components/shared/PageFolio.svelte';
	import {clientServices} from '#lib/ui/composition.ts';
	import {readPageParam, writePageParam} from '#lib/ui/page-url.ts';
	import {scrollToElement} from '#lib/ui/scroll.ts';
	import type {PageProps} from './$types';

	let {data, form}: PageProps = $props();

	/** Linhas por página da lista. */
	const PAGE_SIZE = 50;

	let filter = $state<RowFilter>({...NO_FILTER});
	// Página pedida; a efetiva (`view.page`) já vem ajustada, por exemplo se a lista encolheu.
	let requestedPage = $state(readPageParam());
	let listTop = $state<HTMLElement>();
	const selected = new SvelteSet<string>();
	let thumbsReady = $state(false);
	let fontsFailed = $state(false);
	let feedback = $state<{message: string; ok: boolean} | null>(null);

	const rows = $derived(data.enabled ? data.rows : []);
	const defaultTemplate = $derived(data.enabled ? data.defaultTemplate : null);
	const shownRows = $derived(filterRows(rows, filter));
	const view = $derived(paginate(shownRows, requestedPage, PAGE_SIZE));
	const summary = $derived(summarize(rows, defaultTemplate));
	const counts = $derived(countByCategory(rows.map((row) => row.entry)));
	const filtering = $derived(
		filter.category !== NO_FILTER.category ||
			filter.status !== NO_FILTER.status ||
			filter.query.trim() !== ''
	);
	// Só conta o que está na lista: o que o filtro escondeu também não vai no formulário.
	// A seleção vale para a lista filtrada inteira, não só para a página aberta.
	const selectedIds = $derived(
		shownRows.filter((row) => selected.has(row.entry.id)).map((row) => row.entry.id)
	);
	const allSelected = $derived(shownRows.length > 0 && selectedIds.length === shownRows.length);

	$effect(() => writePageParam(view.page));

	// Cada modelo é desenhado uma vez por visita: o texto de exemplo só depende do id.
	const svgCache: Record<string, string> = {};
	function renderThumb(id: string): string | null {
		const cached = svgCache[id];
		if (cached) return cached;
		const row = rows.find((candidate) => candidate.entry.id === id);
		if (!row) return null;
		try {
			const {renderer} = clientServices();
			const svg = renderer.render(cardConfig(row.entry, DEFAULT_CONFIG, false), 'light', {
				background: false
			});
			svgCache[id] = svg;
			return svg;
		} catch (error) {
			console.error(`Não foi possível desenhar ${id}`, error);
			return null;
		}
	}

	onMount(() => {
		clientServices()
			.fontLoader.loadBundled()
			.then(() => (thumbsReady = true))
			.catch(() => (fontsFailed = true));
	});

	$effect(() => {
		if (form?.message) feedback = {message: form.message, ok: form.ok};
	});
	$effect(() => {
		if (!feedback?.ok) return;
		const timer = setTimeout(() => (feedback = null), 5000);
		return () => clearTimeout(timer);
	});

	function select(id: string, checked: boolean) {
		if (checked) selected.add(id);
		else selected.delete(id);
	}
	function toggleAll(checked: boolean) {
		for (const row of shownRows) select(row.entry.id, checked);
	}
	function goToPage(pageNumber: number) {
		requestedPage = pageNumber;
		void tick().then(() => listTop && scrollToElement(listTop));
	}
	function filterChanged() {
		requestedPage = 1;
	}
	function clearFilters() {
		filter = {...NO_FILTER};
		filterChanged();
	}
	// Mover a primeira linha de uma página para cima a leva para a página anterior: acompanha a linha.
	async function followRow(id: string, focusId: string) {
		await tick();
		const index = shownRows.findIndex((row) => row.entry.id === id);
		if (index === -1) return;
		const target = pageOfIndex(index, PAGE_SIZE);
		if (target === view.page) return;
		requestedPage = target;
		await tick();
		document.getElementById(focusId)?.focus();
	}
	function afterBulk(succeeded: boolean) {
		if (succeeded) selected.clear();
	}
</script>

<svelte:head>
	<title>Redação · The Inkmark</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="page-shell pb-[90px] [@media(max-width:720px)]:[--page-gutter:16px]">
	<AdminMasthead showLogout={data.enabled} />

	{#if !data.enabled}
		<DisabledNotice problems={data.problems} />
	{:else}
		<main>
			<SummaryBar {summary} updatedAt={data.updatedAt} {thumbsReady} {renderThumb} />

			<FilterBar
				bind:filter
				{counts}
				shown={shownRows.length}
				total={rows.length}
				first={view.first}
				last={view.last}
				onchange={filterChanged}
				onclear={clearFilters}
			/>

			{#if fontsFailed}
				<p class="mt-3 text-center font-bold italic" role="alert">
					Não foi possível carregar as fontes; as miniaturas ficam em branco. Recarregue a página.
				</p>
			{/if}

			<BulkBar
				{selectedIds}
				shown={shownRows.length}
				paged={view.pageCount > 1}
				{allSelected}
				ontoggleall={toggleAll}
				onsubmitted={afterBulk}
			/>

			{#if shownRows.length === 0}
				<p class="my-7 text-center italic">Nenhum modelo corresponde aos filtros.</p>
			{:else}
				<div class="scroll-mt-3" bind:this={listTop}>
					<PageFolio
						page={view.page}
						pageCount={view.pageCount}
						label="Páginas da lista (topo)"
						onpage={goToPage}
					/>
				</div>
				<ol aria-label="Modelos do catálogo">
					{#each view.items as row (row.entry.id)}
						<TemplateRow
							{row}
							isFirst={row.entry.order === 0}
							isLast={row.entry.order === rows.length - 1}
							canMove={!filtering}
							isDefault={defaultTemplate === row.entry.id}
							selected={selected.has(row.entry.id)}
							{thumbsReady}
							{renderThumb}
							onselect={select}
							onchanged={followRow}
						/>
					{/each}
				</ol>
				<PageFolio
					page={view.page}
					pageCount={view.pageCount}
					label="Páginas da lista"
					onpage={goToPage}
				/>
			{/if}
		</main>

		<footer
			class="flex justify-between gap-4 border-t-4 border-double border-ink pt-2.5 text-[11px] tracking-caps uppercase"
		>
			<span>The Inkmark · Redação</span>
			<span>As mudanças valem no site na hora, sem republicar</span>
		</footer>
	{/if}
</div>

<Feedback
	message={feedback?.message ?? null}
	ok={feedback?.ok ?? true}
	ondismiss={() => (feedback = null)}
/>
