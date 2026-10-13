<script lang="ts">
	import type {Snippet} from 'svelte';

	interface Props {
		children: Snippet;
		aside?: Snippet;
	}
	let {children, aside}: Props = $props();
</script>

<h3 class="mb-2.5 flex items-baseline justify-between gap-2 kicker-label">
	<span>{@render children()}</span>
	{#if aside}{@render aside()}{/if}
</h3>
