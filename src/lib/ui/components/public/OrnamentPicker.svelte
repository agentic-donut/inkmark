<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import type {Ornament} from '#lib/domain/editor/index.ts';

	interface Props {
		value: Ornament;
		onselect: (ornament: Ornament) => void;
	}
	let {value, onselect}: Props = $props();

	const OPTIONS: {id: Ornament; label: () => string; glyph: string}[] = [
		{id: 'none', label: m.ornament_none, glyph: '—'},
		{id: 'stars', label: m.ornament_stars, glyph: '★'},
		{id: 'diamond', label: m.ornament_diamond, glyph: '◆'},
		{id: 'mountain', label: m.ornament_mountain, glyph: '▲'}
	];
</script>

<div
	class="mb-3 grid grid-cols-[1fr_1fr] border border-ink"
	role="group"
	aria-label={m.ornament_title()}
>
	{#each OPTIONS as option (option.id)}
		<button
			type="button"
			class="cursor-pointer px-1 pt-[7px] pb-[5px] label-caps tracking-[0.12em] even:border-l even:border-ink hover:not-aria-pressed:ink-wash focus-visible:-outline-offset-4 aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:focus-visible:outline-paper nth-[n+3]:border-t nth-[n+3]:border-ink"
			aria-pressed={option.id === value}
			onclick={() => onselect(option.id)}
		>
			<span class="mr-1" aria-hidden="true">{option.glyph}</span>
			{option.label()}
		</button>
	{/each}
</div>
