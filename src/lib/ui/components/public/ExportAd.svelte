<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	interface Props {
		disabled: boolean;
		onopen: () => void;
	}
	let {disabled, onopen}: Props = $props();
</script>

<!-- Anúncio de meia página embaixo da foto: título à esquerda, chamada e botão à direita; empilha em tela estreita. -->
<aside
	class="mt-6 grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-center gap-x-5 border-4 border-double border-ink px-4 py-3.5 text-center [@media(width<=640px)]:mt-5 [@media(width<=640px)]:grid-cols-1 [@media(width<=640px)]:gap-y-2"
	aria-label={m.ad_label()}
>
	<div>
		<small class="text-[10px] font-bold tracking-[0.24em]">{m.ad_kicker()}</small>
		<h4 class="mt-1.5 font-masthead text-[46px] leading-[0.95] font-normal">{m.ad_title()}</h4>
	</div>
	<div
		class="border-l border-ink pl-5 [@media(width<=640px)]:border-t [@media(width<=640px)]:border-l-0 [@media(width<=640px)]:pt-3 [@media(width<=640px)]:pl-0"
	>
		<p class="mb-3 text-[14px] leading-[1.4] whitespace-pre-line italic">{m.ad_text()}</p>
		<button
			type="button"
			class="block w-full ink-button p-2.5 text-[12px] tracking-[0.2em] hover:enabled:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-45"
			{disabled}
			onclick={onopen}
		>
			{m.ad_button()}
		</button>
		{#if disabled}
			<p class="mt-2 text-[12px] leading-[1.4] italic">{m.ad_hint()}</p>
		{/if}
	</div>
</aside>
