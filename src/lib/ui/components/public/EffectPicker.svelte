<script module lang="ts">
	import type {EffectLevel} from '#lib/domain/editor/index.ts';

	export interface EffectOption {
		level: EffectLevel;
		name: string;
		/** SVG da amostra, já com o efeito neste nível. */
		swatch: string;
	}
</script>

<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';

	interface Props {
		/** Nome do efeito: rotula o grupo para leitores de tela e entra no nome de cada opção. */
		label: string;
		options: readonly EffectOption[];
		value: EffectLevel;
		onselect: (level: EffectLevel) => void;
	}
	let {label, options, value, onselect}: Props = $props();

	// A amostra é um SVG do motor (via {@html}), então o tamanho dela entra por variante no botão.
	const swatch = 'swatch-button [&_svg]:size-[44px]';
</script>

<div class="panel">
	<div class="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-1" role="group" aria-label={label}>
		{#each options as option (option.level)}
			<button
				type="button"
				class={swatch}
				aria-pressed={option.level === value}
				aria-label={m.effect_option_label({effect: label, level: option.name})}
				onclick={() => onselect(option.level)}
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- amostra gerada pelo motor, sem texto do usuário. -->
				{@html option.swatch}
				<span>{option.name}</span>
			</button>
		{/each}
	</div>
</div>
