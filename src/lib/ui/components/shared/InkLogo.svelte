<script lang="ts">
	// Logo impressa no papel: o SVG multiplica com a textura (ou fica opaco na versão noturna).
	interface Props {
		svg: string;
		night?: boolean;
		label?: string;
	}
	let {svg, night = false, label}: Props = $props();
</script>

<div class="ink" class:night role={label ? 'img' : undefined} aria-label={label}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- o SVG vem do motor, que escapa todo texto do usuário (coberto por teste). -->
	{@html svg}
</div>
