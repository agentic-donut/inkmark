<script lang="ts">
	import {ELLIPSIS, pageLinks} from '#lib/domain/pagination/index.ts';
	import {DEFAULT_PAGE_FOLIO_LABELS, type PageFolioLabels} from './page-folio-labels.ts';

	interface Props {
		page: number;
		pageCount: number;
		/** Nome do que está paginado, para os leitores de tela ("Páginas dos classificados"). */
		label: string;
		/** Textos da navegação; o padrão é o português (o admin não é traduzido). */
		labels?: PageFolioLabels;
		onpage: (page: number) => void;
	}
	let {page, pageCount, label, labels = DEFAULT_PAGE_FOLIO_LABELS, onpage}: Props = $props();

	const links = $derived(pageLinks(page, pageCount));

	// Botão sem moldura que herda o tamanho, a caixa e o espaçamento de letras do folio.
	const control = 'cursor-pointer bg-transparent font-bold uppercase tracking-[inherit]';
	const step = `${control} px-1 py-1.5 enabled:hover:underline enabled:hover:decoration-dotted enabled:hover:underline-offset-4 disabled:cursor-default disabled:opacity-40`;
</script>

{#if pageCount > 1}
	<nav
		class="grid grid-cols-[1fr_auto_1fr] items-center gap-x-5 gap-y-2.5 px-1 py-3 text-[11px] tracking-caps uppercase [@media(max-width:700px)]:grid-cols-2 [@media(max-width:700px)]:tracking-[0.1em]"
		aria-label={label}
	>
		<button
			type="button"
			class="{step} justify-self-start"
			disabled={page <= 1}
			aria-label={labels.goTo(page - 1)}
			onclick={() => onpage(page - 1)}
		>
			{labels.previous}
		</button>

		<div
			class="grid justify-items-center gap-1.5 [@media(max-width:700px)]:order-first [@media(max-width:700px)]:col-span-2"
		>
			<p class="font-bold" aria-live="polite">{labels.current(page, pageCount)}</p>
			<ol class="flex flex-wrap justify-center gap-x-1 gap-y-0.5">
				{#each links as link, index (typeof link === 'number' ? link : `gap-${index}`)}
					<li>
						{#if link === ELLIPSIS}
							<span class="inline-block min-w-5 text-center" aria-hidden="true">{ELLIPSIS}</span>
						{:else}
							<button
								type="button"
								class="{control} min-w-[30px] border border-transparent px-1.5 py-[5px] hover:not-aria-[current]:underline hover:not-aria-[current]:decoration-dotted hover:not-aria-[current]:underline-offset-4 aria-[current=page]:cursor-default aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
								aria-current={link === page ? 'page' : undefined}
								aria-label={labels.pageNumber(link)}
								onclick={() => link !== page && onpage(link)}
							>
								{link}
							</button>
						{/if}
					</li>
				{/each}
			</ol>
		</div>

		<button
			type="button"
			class="{step} justify-self-end text-right"
			disabled={page >= pageCount}
			aria-label={page >= pageCount ? undefined : labels.goTo(page + 1)}
			onclick={() => onpage(page + 1)}
		>
			{#if page >= pageCount}
				{labels.end}
			{:else}
				<span class="[@media(max-width:700px)]:hidden">{labels.nextLong(page + 1)}</span>
				<span class="hidden [@media(max-width:700px)]:inline">{labels.nextShort(page + 1)}</span>
			{/if}
		</button>
	</nav>
{/if}
