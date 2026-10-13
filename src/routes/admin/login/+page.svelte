<script lang="ts">
	import {onMount} from 'svelte';
	import {enhance} from '$app/forms';
	import {resolve} from '$app/paths';
	import type {PageProps} from './$types';

	let {data, form}: PageProps = $props();
	let pending = $state(false);
	let passwordField: HTMLInputElement;

	onMount(() => passwordField.focus());
</script>

<svelte:head>
	<title>Redação · The Inkmark</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="grid min-h-screen content-center justify-items-center gap-7 px-5 py-10">
	<header class="w-[min(100%,420px)] border-y-4 border-double border-ink pt-3.5 pb-3 text-center">
		<p class="label-caps tracking-caps">Acesso restrito</p>
		<h1 class="mt-1 mb-0.5 font-masthead text-[64px] leading-none font-normal">The Inkmark</h1>
		<p class="label-caps tracking-caps">Redação</p>
	</header>

	<form
		class="grid w-[min(100%,420px)] gap-2.5 border border-ink px-6 pt-[22px] pb-6 outline-1 outline-offset-4 outline-ink"
		method="post"
		use:enhance={() => {
			pending = true;
			return async ({update}) => {
				await update({reset: false});
				pending = false;
			};
		}}
	>
		<input type="hidden" name="next" value={form?.next ?? data.next} />
		<label class="label-caps tracking-caps" for="password">Senha da redação</label>
		<input
			id="password"
			class="border border-ink bg-transparent px-3 py-2.5 text-[18px]"
			name="password"
			type="password"
			autocomplete="current-password"
			required
			bind:this={passwordField}
			aria-describedby={form?.message ? 'login-error' : undefined}
			aria-invalid={form?.message ? 'true' : undefined}
		/>
		{#if form?.message}
			<p id="login-error" class="border-l-[3px] border-ink pl-2.5 italic" role="alert">
				{form.message}
			</p>
		{/if}
		<button
			type="submit"
			class="mt-1.5 ink-button border border-ink px-4 py-3 text-[12px] tracking-caps disabled:cursor-progress disabled:opacity-60"
			disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button
		>
	</form>

	<p class="text-[13px] italic"><a href={resolve('/')}>Voltar ao jornal</a></p>
</main>
