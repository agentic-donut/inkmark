<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import InkLogo from '#lib/ui/components/shared/InkLogo.svelte';

	interface Props {
		svg: string;
		night: boolean;
		loading: boolean;
		error: string | null;
		caption: string;
		label: string;
	}
	let {svg, night, loading, error, caption, label}: Props = $props();
</script>

<figure>
	<div
		class={[
			'relative border border-ink px-10 pt-[30px] pb-[18px] [@media(width<=640px)]:px-3.5 [@media(width<=640px)]:pt-[18px] [@media(width<=640px)]:pb-2.5',
			night && 'night-sheet'
		]}
		aria-busy={loading && !error}
	>
		<!-- A moldura reserva a proporção da logo (6:5) para a página não pular quando o desenho chega. -->
		<div class="mx-auto grid aspect-[6/5] max-w-[560px] items-center">
			{#if error}
				<p class="text-center text-[16px] italic" role="alert">
					{m.lead_error()}
				</p>
			{:else if loading}
				<p class="text-center text-[16px] italic">{m.lead_loading()}</p>
			{:else}
				<InkLogo {svg} {night} {label} />
			{/if}
		</div>
	</div>
	<figcaption
		class="mt-2 flex justify-between gap-4 text-[14px] italic [@media(width<=640px)]:flex-col [@media(width<=640px)]:gap-1"
	>
		<span>{caption}</span>
		<b class="flex-none label-caps tracking-[0.1em] not-italic">{m.live_proof_title()}</b>
	</figcaption>
</figure>
