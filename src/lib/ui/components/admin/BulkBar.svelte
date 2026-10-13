<script lang="ts">
	import {enhance} from '$app/forms';
	import {adminSubmit} from './submit.ts';

	interface Props {
		/** Ids marcados entre os que passam pelos filtros, em qualquer página: é o que o formulário envia. */
		selectedIds: readonly string[];
		/** Modelos que passam pelos filtros, em todas as páginas. */
		shown: number;
		paged: boolean;
		allSelected: boolean;
		ontoggleall: (selected: boolean) => void;
		onsubmitted: (succeeded: boolean) => void;
	}
	let {selectedIds, shown, paged, allSelected, ontoggleall, onsubmitted}: Props = $props();
	const selectedCount = $derived(selectedIds.length);
</script>

<!-- Os checkboxes da lista apontam para este formulário pelo atributo `form`. -->
<form
	id="bulk-form"
	class="flex flex-wrap items-center gap-x-6 gap-y-2.5 border-b border-ink py-2.5"
	method="post"
	use:enhance={adminSubmit(onsubmitted)}
>
	{#each selectedIds as id (id)}
		<input type="hidden" name="ids" value={id} />
	{/each}
	<label class="inline-flex items-center gap-2.5 text-[12px] font-bold tracking-[0.1em] uppercase">
		<input
			type="checkbox"
			class="m-0 size-[18px] accent-ink"
			checked={allSelected}
			disabled={shown === 0}
			onchange={(event) => ontoggleall(event.currentTarget.checked)}
		/>
		{#if paged}
			Selecionar os {shown} da lista, em todas as páginas
		{:else}
			Selecionar os {shown} da lista
		{/if}
	</label>
	<span class="text-[14px] italic" aria-live="polite"
		>{selectedCount === 0
			? 'Nenhum selecionado'
			: `${selectedCount} ${selectedCount === 1 ? 'selecionado' : 'selecionados'}`}</span
	>
	<span class="ml-auto flex gap-2">
		<button
			type="submit"
			class="admin-action px-3.5 py-[7px]"
			id="bulk-hide"
			formaction="?/bulkVisibility"
			name="hidden"
			value="true"
			disabled={selectedCount === 0}>Ocultar selecionados</button
		>
		<button
			type="submit"
			class="admin-action px-3.5 py-[7px]"
			id="bulk-show"
			formaction="?/bulkVisibility"
			name="hidden"
			value="false"
			disabled={selectedCount === 0}>Mostrar selecionados</button
		>
	</span>
</form>
