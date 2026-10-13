<script lang="ts">
	import {enhance} from '$app/forms';
	import {resolve} from '$app/paths';

	interface Props {
		/** Sem sessão (admin desativado), não há o que encerrar. */
		showLogout?: boolean;
	}
	let {showLogout = true}: Props = $props();
</script>

<header
	class="grid grid-cols-[1fr_auto_1fr] items-center gap-5 border-b-4 border-double border-ink pt-[18px] pb-3.5 [@media(max-width:800px)]:grid-cols-1 [@media(max-width:800px)]:justify-items-center"
>
	<p class="label-caps tracking-caps [@media(max-width:800px)]:hidden">Uso interno</p>
	<h1
		class="text-center font-masthead text-[56px] leading-none font-normal whitespace-nowrap [@media(max-width:800px)]:text-[38px]"
	>
		<span>The Inkmark</span> <span class="text-[0.78em]">·</span>
		<span class="text-[0.78em]">Redação</span>
	</h1>
	<div class="flex items-center justify-end gap-[18px] label-caps tracking-caps">
		<a href={resolve('/')}>Ver o jornal</a>
		{#if showLogout}
			<form method="post" action="/admin/logout" use:enhance>
				<button
					type="submit"
					class="ink-button border border-ink px-4 py-2 text-[11px] tracking-caps">Sair</button
				>
			</form>
		{/if}
	</div>
</header>
