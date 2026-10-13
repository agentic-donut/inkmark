<script lang="ts">
	import {enhance} from '$app/forms';
	import type {AdminRow} from '#lib/application/admin/index.ts';
	import {CATEGORIES, MAX_NAME_LENGTH} from '#lib/domain/catalog/index.ts';
	import Thumbnail from './Thumbnail.svelte';
	import {adminSubmit} from './submit.ts';

	interface Props {
		row: AdminRow;
		isFirst: boolean;
		isLast: boolean;
		/** Reordenar só faz sentido na lista completa: com filtro, o vizinho pode estar fora da tela. */
		canMove: boolean;
		isDefault: boolean;
		selected: boolean;
		thumbsReady: boolean;
		renderThumb: (id: string) => string | null;
		onselect: (id: string, selected: boolean) => void;
		/** Uma ação do modelo terminou; a lista pode ter se reordenado e levado a linha para outra página. */
		onchanged: (id: string, focusId: string) => void;
	}
	let {
		row,
		isFirst,
		isLast,
		canMove,
		isDefault,
		selected,
		thumbsReady,
		renderThumb,
		onselect,
		onchanged
	}: Props = $props();

	const entry = $derived(row.entry);
	const number = $derived(String(row.number).padStart(3, '0'));
	let saveButton: HTMLButtonElement;

	// Botão de ação com o preenchimento e a quebra de linha da lista.
	const action = 'admin-action px-2.5 py-[7px] whitespace-nowrap';
	// Etiqueta de situação (Oculto, Destaque, Padrão) ao lado do id.
	const tag = 'border border-ink px-1.5 py-px text-[10px] tracking-caps uppercase not-italic';
</script>

<li
	class="border-b border-ink [contain-intrinsic-size:auto_118px] [content-visibility:auto]"
	data-template={entry.id}
>
	<form
		class="grid grid-cols-[28px_62px_120px_minmax(0,1fr)_190px_390px] items-center gap-x-[18px] gap-y-1.5 py-3 [grid-template-areas:'pick_number_thumb_name_category_tools'_'pick_number_thumb_meta_save_tools'] [@media(max-width:1100px)]:grid-cols-[28px_52px_100px_minmax(0,1fr)_160px] [@media(max-width:1100px)]:[grid-template-areas:'pick_number_thumb_name_category'_'pick_number_thumb_meta_save'_'._._tools_tools_tools'] [@media(max-width:720px)]:grid-cols-[28px_86px_minmax(0,1fr)] [@media(max-width:720px)]:[grid-template-areas:'pick_number_number'_'._thumb_name'_'._thumb_category'_'._meta_meta'_'._save_save'_'._tools_tools']"
		method="post"
		action="?/edit"
		use:enhance={adminSubmit((_, focusId) => onchanged(entry.id, focusId))}
	>
		<input type="hidden" name="id" value={entry.id} />

		<input
			class="m-0 size-[18px] accent-ink [grid-area:pick]"
			type="checkbox"
			checked={selected}
			onchange={(event) => onselect(entry.id, event.currentTarget.checked)}
			aria-label={`Selecionar ${entry.name}`}
		/>

		<span
			class="self-start pt-1.5 text-[12px] font-bold tracking-[0.08em] whitespace-nowrap uppercase [grid-area:number]"
			aria-label={`Posição ${row.number}`}>nº {number}</span
		>

		<div class="[grid-area:thumb]" class:opacity-50={entry.hidden}>
			<Thumbnail
				id={entry.id}
				label={`Prévia de ${entry.name}`}
				ready={thumbsReady}
				render={renderThumb}
			/>
		</div>

		<div class="self-end [grid-area:name]">
			<label class="visually-hidden" for={`name-${entry.id}`}>Nome de {row.originalName}</label>
			<input
				class="admin-field font-bold tracking-[0.04em]"
				class:opacity-50={entry.hidden}
				id={`name-${entry.id}`}
				name="name"
				value={entry.name}
				placeholder={row.originalName}
				maxlength={MAX_NAME_LENGTH}
				autocomplete="off"
			/>
		</div>

		<!-- Primeiro botão de envio do formulário: é ele que o Enter no campo de nome aciona. -->
		<button
			class="{action} justify-self-start [grid-area:save]"
			type="submit"
			id={`save-${entry.id}`}
			bind:this={saveButton}
			aria-label={`Salvar nome e categoria de ${entry.name}`}>Salvar</button
		>

		<div class="self-end [grid-area:category]">
			<label class="visually-hidden" for={`cat-${entry.id}`}>Categoria de {entry.name}</label>
			<select
				class="admin-field"
				id={`cat-${entry.id}`}
				name="category"
				value={entry.category}
				onchange={(event) => event.currentTarget.form?.requestSubmit(saveButton)}
			>
				{#each CATEGORIES as category (category)}
					<option value={category}>{category}</option>
				{/each}
			</select>
		</div>

		<p
			class="flex flex-wrap items-center gap-x-2.5 gap-y-1 self-start text-[13px] italic [grid-area:meta]"
		>
			<span>{entry.id}</span>
			{#if entry.hidden}<strong class={tag}>Oculto</strong>{/if}
			{#if entry.featured}<strong class={tag}>Destaque</strong>{/if}
			{#if isDefault}<strong class="{tag} bg-ink text-paper">Padrão</strong>{/if}
			{#if entry.name !== row.originalName}<span class="text-ink/65">era «{row.originalName}»</span
				>{/if}
		</p>

		<div
			class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-1.5 [grid-area:tools] [@media(max-width:720px)]:grid-cols-[repeat(2,1fr)]"
		>
			<button
				type="submit"
				class={action}
				id={`vis-${entry.id}`}
				formaction="?/visibility"
				name="hidden"
				value={entry.hidden ? 'false' : 'true'}
				aria-label={`${entry.hidden ? 'Mostrar' : 'Ocultar'} ${entry.name}`}
				>{entry.hidden ? 'Mostrar' : 'Ocultar'}</button
			>
			<button
				type="submit"
				class={action}
				id={`feat-${entry.id}`}
				formaction="?/feature"
				name="featured"
				value={entry.featured ? 'false' : 'true'}
				class:active={entry.featured}
				aria-label={`${entry.featured ? 'Tirar destaque de' : 'Destacar'} ${entry.name}`}
				>{entry.featured ? 'Tirar destaque' : 'Destacar'}</button
			>
			<button
				type="submit"
				class={action}
				id={`def-${entry.id}`}
				formaction="?/makeDefault"
				disabled={isDefault}
				aria-label={`Definir ${entry.name} como padrão`}
				>{isDefault ? 'É o padrão' : 'Padrão'}</button
			>
			<button
				type="submit"
				class={action}
				id={`reset-${entry.id}`}
				formaction="?/reset"
				disabled={!row.customized}
				aria-label={`Restaurar ${row.originalName} ao original`}>Restaurar</button
			>
			<button
				type="submit"
				class={action}
				id={`up-${entry.id}`}
				formaction="?/move"
				name="direction"
				value="up"
				disabled={!canMove || isFirst}
				title={canMove ? undefined : 'Limpe os filtros para reordenar'}
				aria-label={`Subir ${entry.name}`}>↑</button
			>
			<button
				type="submit"
				class={action}
				id={`down-${entry.id}`}
				formaction="?/move"
				name="direction"
				value="down"
				disabled={!canMove || isLast}
				title={canMove ? undefined : 'Limpe os filtros para reordenar'}
				aria-label={`Descer ${entry.name}`}>↓</button
			>
		</div>
	</form>
</li>
