<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	interface Props {
		compositions: number;
		fontCount: number;
	}
	let {compositions, fontCount}: Props = $props();

	const ear =
		'border border-ink px-3 py-[9px] text-center text-[12px] leading-[1.35] [@media(width<=940px)]:px-2 [@media(width<=940px)]:py-[7px] [@media(width<=940px)]:text-[11px]';
	const tag = 'label-caps mb-[3px] block tracking-[0.14em]';
</script>

<div
	class="grid grid-cols-[220px_1fr_220px] items-center gap-4 pt-[26px] pb-2 [@media(480px<width<=940px)]:grid-cols-[1fr_1fr] [@media(width<=480px)]:grid-cols-[1fr] [@media(width<=940px)]:gap-2.5 [@media(width<=940px)]:pt-[18px]"
>
	<p class={ear}>
		<b class={tag}>{m.masthead_this_edition()}</b>
		{m.masthead_contents({
			compositions: m.count_compositions({count: compositions}),
			fonts: m.count_typefaces({count: fontCount})
		})}
	</p>
	<h1
		class="text-center font-masthead text-[clamp(52px,9.2vw,118px)] leading-none font-normal tracking-[0.01em] whitespace-nowrap [@media(width<=940px)]:-order-1 [@media(width<=940px)]:col-span-full"
	>
		The Inkmark
	</h1>
	<p class="{ear} [@media(width<=480px)]:hidden">
		<b class={tag}>{m.masthead_price_label()}</b>
		{m.masthead_price_text()}
	</p>
</div>
