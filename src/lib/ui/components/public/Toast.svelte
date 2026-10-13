<script lang="ts">
	interface Props {
		message: string;
		visible: boolean;
	}
	let {message, visible}: Props = $props();
</script>

<div
	class={[
		'pointer-events-none fixed bottom-6 left-1/2 z-20 max-w-[min(90vw,520px)] bg-ink px-5 pt-[11px] pb-[9px] text-center text-[14px] text-paper italic transition-[opacity,translate] duration-200 ease-[ease] motion-reduce:transition-none',
		visible ? '-translate-x-1/2 opacity-100' : '-translate-x-1/2 translate-y-3 opacity-0'
	]}
	role="status"
>
	{message}
</div>
