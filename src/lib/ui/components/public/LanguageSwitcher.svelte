<script lang="ts">
	import {localeCookie, localeInfos, localePath, type Locale} from '#lib/i18n/routing.ts';
	import {m} from '#lib/paraglide/messages.js';
	import {getLocale} from '#lib/paraglide/runtime.js';

	interface Props {
		/** Página dos classificados aberta: o link do outro idioma continua nela (`?pagina=N`). */
		page: number;
		class?: string;
	}
	let {page, class: className}: Props = $props();

	const current = getLocale();

	// A escolha explícita fica em cookie: é ela que faz a raiz (/) lembrar do idioma na próxima visita.
	// Com JavaScript desligado o link funciona do mesmo jeito, só não grava a preferência.
	function remember(locale: Locale) {
		document.cookie = localeCookie(locale);
	}
</script>

<nav class={className} aria-label={m.language_switcher_label()}>
	<ul class="flex items-center gap-1.5 label-caps tracking-[0.14em]">
		{#each localeInfos as info, index (info.locale)}
			{#if index > 0}<li aria-hidden="true">·</li>{/if}
			<li>
				<!-- Troca de idioma recarrega a página: as mensagens e o <html lang> são do idioma da carga. -->
				<!-- eslint-disable svelte/no-navigation-without-resolve -- o endereço já vem localizado (/en, /es) e não é um id de rota do SvelteKit. -->
				<a
					class="underline-offset-4 not-aria-[current=true]:no-underline hover:not-aria-[current=true]:underline hover:not-aria-[current=true]:decoration-dotted aria-[current=true]:font-bold"
					href={localePath(info.locale, page)}
					lang={info.locale}
					hreflang={info.locale}
					aria-label={info.name}
					aria-current={info.locale === current ? 'true' : undefined}
					data-sveltekit-reload
					onclick={() => remember(info.locale)}
				>
					{info.code}
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</li>
		{/each}
	</ul>
</nav>
