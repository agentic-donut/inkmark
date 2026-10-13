<script lang="ts">
	import {onMount} from 'svelte';
	import InkLogo from '../shared/InkLogo.svelte';

	// Miniatura sob demanda: só desenha quando entra na tela e as fontes já carregaram.
	interface Props {
		id: string;
		label: string;
		ready: boolean;
		render: (id: string) => string | null;
	}
	let {id, label, ready, render}: Props = $props();

	let host: HTMLElement;
	let visible = $state(false);
	const svg = $derived(visible && ready ? render(id) : null);

	onMount(() => {
		const observer = new IntersectionObserver(
			(observed) => {
				if (observed.some((item) => item.isIntersecting)) {
					visible = true;
					observer.disconnect();
				}
			},
			{rootMargin: '400px 0px'}
		);
		observer.observe(host);
		return () => observer.disconnect();
	});
</script>

<div
	class="grid aspect-[6/5] w-full items-center border border-ink/35 p-1"
	bind:this={host}
	aria-busy={svg === null}
>
	{#if svg}
		<InkLogo {svg} {label} />
	{:else}
		<span
			class="block h-full bg-[repeating-linear-gradient(135deg,transparent_0_5px,color-mix(in_srgb,var(--color-ink)_10%,transparent)_5px_6px)]"
			aria-hidden="true"
		></span>
	{/if}
</div>
