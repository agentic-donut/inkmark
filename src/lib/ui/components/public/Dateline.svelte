<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	interface Props {
		issue: number;
		/** Vazio até o navegador saber a data de hoje (evita diferença entre servidor e cliente). */
		date: string;
		night: boolean;
	}
	let {issue, date, night}: Props = $props();
</script>

<div
	class="flex justify-between gap-3 border-t border-ink px-0.5 pt-1.5 pb-[5px] label-caps tracking-caps rule-b-double [@media(width<=640px)]:tracking-[0.1em]"
>
	<span class="[@media(width<=640px)]:hidden">{m.dateline_issue({issue})}</span>
	<time class="text-center [@media(width<=640px)]:text-left">{date || ' '}</time>
	<span class="text-right whitespace-nowrap"
		>{night ? m.dateline_edition_dark() : m.dateline_edition_light()}</span
	>
</div>
