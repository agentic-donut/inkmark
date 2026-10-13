<script lang="ts">
	import type {Summary} from '#lib/application/admin/index.ts';
	import Thumbnail from './Thumbnail.svelte';

	interface Props {
		summary: Summary;
		updatedAt: string | null;
		thumbsReady: boolean;
		renderThumb: (id: string) => string | null;
	}
	let {summary, updatedAt, thumbsReady, renderThumb}: Props = $props();

	const stats = $derived([
		{label: 'Modelos', value: summary.total},
		{label: 'Visíveis', value: summary.visible},
		{label: 'Ocultos', value: summary.hidden},
		{label: 'Destaques', value: summary.featured}
	]);
	const edited = $derived(
		updatedAt
			? new Intl.DateTimeFormat('pt-BR', {dateStyle: 'long', timeStyle: 'short'}).format(
					new Date(updatedAt)
				)
			: null
	);
</script>

<section
	class="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-7 border-b border-ink py-6 [@media(max-width:900px)]:grid-cols-1"
	aria-label="Resumo do catálogo"
>
	<dl
		class="grid grid-cols-[repeat(4,1fr)] border border-ink [@media(max-width:560px)]:grid-cols-[repeat(2,1fr)]"
	>
		{#each stats as stat (stat.label)}
			<div
				class="border-l border-ink px-4 pt-3.5 pb-4 first:border-l-0 [@media(max-width:560px)]:nth-3:border-l-0 [@media(max-width:560px)]:nth-[n+3]:border-t"
			>
				<dt class="label-caps tracking-caps">{stat.label}</dt>
				<dd class="mt-1.5 font-masthead text-[52px] leading-none">{stat.value}</dd>
			</div>
		{/each}
	</dl>

	<div
		class="grid content-start gap-2 border border-ink px-[18px] pt-3.5 pb-3 outline-1 outline-offset-[-5px] outline-ink"
	>
		<p class="label-caps tracking-caps">Modelo padrão do editor</p>
		{#if summary.defaultEntry}
			<div class="grid grid-cols-[96px_1fr] items-center gap-3.5">
				<div>
					<Thumbnail
						id={summary.defaultEntry.id}
						label={`Prévia de ${summary.defaultEntry.name}`}
						ready={thumbsReady}
						render={renderThumb}
					/>
				</div>
				<div>
					<p class="font-text text-[20px] leading-[1.1] font-bold tracking-[0.04em] uppercase">
						{summary.defaultEntry.name}
					</p>
					<p class="mt-0.5 text-[13px] italic">
						{#if summary.defaultIsHidden}
							O modelo escolhido está oculto; o site abre o primeiro visível.
						{:else}
							{summary.defaultEntry.category} · nº {String(summary.defaultEntry.order + 1).padStart(
								3,
								'0'
							)}
						{/if}
					</p>
				</div>
			</div>
		{:else}
			<p class="mt-0.5 text-[13px] italic">Nenhum modelo visível.</p>
		{/if}
		<p class="text-[12px] italic">
			{edited ? `Última edição: ${edited}` : 'Nenhuma edição salva ainda.'}
		</p>
	</div>
</section>
