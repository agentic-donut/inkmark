<script lang="ts">
	interface Props {
		message: string | null;
		ok: boolean;
		ondismiss: () => void;
	}
	let {message, ok, ondismiss}: Props = $props();
</script>

<!-- A região fica sempre no DOM para leitores de tela anunciarem cada mudança de texto. -->
<div
	class="fixed bottom-[22px] left-1/2 z-10 max-w-[min(92vw,640px)] -translate-x-1/2"
	role="status"
	aria-live="polite"
>
	{#if message}
		<div
			class="flex items-center gap-3.5 border border-paper bg-ink px-4 py-[11px] text-[15px] text-paper outline-1 outline-ink"
			class:font-bold={!ok}
		>
			<span>{ok ? '' : 'Erro: '}{message}</span>
			<button
				type="button"
				class="cursor-pointer bg-transparent text-[22px] leading-none"
				onclick={ondismiss}
				aria-label="Fechar aviso">×</button
			>
		</div>
	{/if}
</div>
