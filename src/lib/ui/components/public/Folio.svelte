<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	interface Props {
		compositions: number;
		/** Página dos classificados que está aberta. */
		page: number;
	}
	let {compositions, page}: Props = $props();
</script>

<div
	class="flex flex-wrap justify-between gap-x-4 gap-y-1.5 pt-3 pb-10 text-[11px] tracking-caps uppercase [@media(width<=640px)]:flex-col [@media(width<=640px)]:items-center [@media(width<=640px)]:text-center [@media(width<=640px)]:tracking-[0.1em]"
>
	<span>{m.folio_page({page})}</span>
	<span>{m.folio_free()}</span>
	<span>{m.folio_compositions({count: compositions})}</span>
</div>
