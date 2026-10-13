<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	interface Props {
		onfile: (file: File) => void;
	}
	let {onfile}: Props = $props();

	let input: HTMLInputElement;

	function picked(event: Event & {currentTarget: HTMLInputElement}) {
		const file = event.currentTarget.files?.[0];
		if (file) onfile(file);
		// Limpa para que escolher o mesmo arquivo de novo também dispare o evento.
		event.currentTarget.value = '';
	}
</script>

<p
	class="mt-3.5 mb-2 text-justify text-[13px] leading-[1.45] hyphens-auto first-letter:float-left first-letter:mt-1.5 first-letter:mr-1.5 first-letter:text-[50px] first-letter:leading-[0.8] first-letter:font-bold"
>
	<i>{m.font_upload_question()}</i>
	{m.font_upload_text()}
</p>
<input
	bind:this={input}
	type="file"
	accept=".ttf,.otf"
	class="visually-hidden"
	tabindex="-1"
	aria-label={m.font_upload_input_label()}
	onchange={picked}
/>
<button
	type="button"
	class="block w-full cursor-pointer border border-ink px-1 pt-[7px] pb-[5px] label-caps tracking-[0.12em] hover:bg-ink hover:text-paper"
	onclick={() => input.click()}
>
	{m.font_upload_button()}
</button>
