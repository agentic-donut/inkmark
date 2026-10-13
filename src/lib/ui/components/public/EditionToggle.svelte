<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import type {Variant} from '#lib/domain/catalog/index.ts';

	interface Props {
		value: Variant;
		onselect: (variant: Variant) => void;
	}
	let {value, onselect}: Props = $props();

	// Opção ativa em tinta cheia; as outras ganham o véu ao passar o mouse. O foco fica por dentro do botão.
	const option =
		'label-caps flex-1 cursor-pointer px-0 pt-[7px] pb-[5px] text-center tracking-[0.14em] hover:not-aria-pressed:ink-wash aria-pressed:bg-ink aria-pressed:text-paper focus-visible:-outline-offset-4 aria-pressed:focus-visible:outline-paper';
</script>

<div class="panel">
	<div class="flex border border-ink" role="group" aria-label={m.edition_title()}>
		<button
			type="button"
			class={option}
			aria-pressed={value === 'light'}
			onclick={() => onselect('light')}>{m.edition_light()}</button
		>
		<button
			type="button"
			class={option}
			aria-pressed={value === 'dark'}
			onclick={() => onselect('dark')}>{m.edition_dark()}</button
		>
	</div>
</div>
