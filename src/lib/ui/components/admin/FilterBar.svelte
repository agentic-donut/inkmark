<script lang="ts">
	import type {RowFilter, StatusFilter} from '#lib/application/admin/index.ts';
	import {ALL_CATEGORIES, CATEGORIES} from '#lib/domain/catalog/index.ts';
	import type {CategoryFilter} from '#lib/domain/catalog/index.ts';

	interface Props {
		filter: RowFilter;
		counts: Record<CategoryFilter, number>;
		/** Modelos que passam pelos filtros (todas as páginas). */
		shown: number;
		total: number;
		/** Posição do primeiro e do último modelo da página aberta dentro dos que passam pelos filtros. */
		first: number;
		last: number;
		/** Avisa que um filtro mudou, para a lista voltar à primeira página. */
		onchange: () => void;
		onclear: () => void;
	}
	let {
		filter = $bindable(),
		counts,
		shown,
		total,
		first,
		last,
		onchange,
		onclear
	}: Props = $props();

	const categories: CategoryFilter[] = [ALL_CATEGORIES, ...CATEGORIES];
	const statuses: {value: StatusFilter; label: string}[] = [
		{value: 'todos', label: 'Todos'},
		{value: 'visiveis', label: 'Visíveis'},
		{value: 'ocultos', label: 'Ocultos'},
		{value: 'destaques', label: 'Destaques'}
	];
	const filtered = $derived(
		filter.category !== ALL_CATEGORIES || filter.status !== 'todos' || filter.query.trim() !== ''
	);
</script>

<section
	class="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 bg-ink px-[18px] py-2.5 text-paper"
	aria-label="Filtros"
>
	<h2 class="font-masthead text-[30px] leading-none font-normal">Classificados</h2>

	<div class="flex flex-1 flex-wrap gap-x-7 gap-y-2">
		<div class="flex gap-1" role="group" aria-label="Categoria">
			{#each categories as category (category)}
				<button
					type="button"
					class="cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-2 py-1 label-caps tracking-caps focus-visible:outline-paper aria-pressed:border-b-paper"
					aria-pressed={filter.category === category}
					onclick={() => {
						filter.category = category;
						onchange();
					}}>{category} ({counts[category]})</button
				>
			{/each}
		</div>
		<div class="flex gap-1" role="group" aria-label="Situação">
			{#each statuses as status (status.value)}
				<button
					type="button"
					class="cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-2 py-1 label-caps tracking-caps focus-visible:outline-paper aria-pressed:border-b-paper"
					aria-pressed={filter.status === status.value}
					onclick={() => {
						filter.status = status.value;
						onchange();
					}}>{status.label}</button
				>
			{/each}
		</div>
	</div>

	<div>
		<label class="visually-hidden" for="admin-search">Buscar por nome ou id</label>
		<input
			id="admin-search"
			type="search"
			class="w-[230px] border border-paper bg-transparent px-2.5 py-[7px] text-[15px] text-paper placeholder:text-paper/65 focus-visible:outline-paper"
			placeholder="Buscar nome ou id"
			bind:value={filter.query}
			oninput={onchange}
			autocomplete="off"
		/>
	</div>
</section>
<p class="mt-2 text-[13px] italic" role="status">
	{#if last - first + 1 < shown}
		Mostrando {first} a {last} de {shown} modelos{shown === total
			? ''
			: ` (o catálogo tem ${total})`}.
	{:else}
		Mostrando {shown} de {total} modelos.
	{/if}
	{#if filtered}<button
			type="button"
			class="ml-2 cursor-pointer bg-transparent p-0 not-italic underline"
			onclick={onclear}>Limpar filtros</button
		>{/if}
</p>
