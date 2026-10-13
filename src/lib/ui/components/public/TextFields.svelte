<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import {DEFAULT_CONFIG} from '#lib/domain/editor/index.ts';

	type TextKey = 'name' | 'topline' | 'tagline';

	interface Props {
		name: string;
		topline: string;
		tagline: string;
		limits: {name: number; topline: number; tagline: number};
		onchange: (key: TextKey, value: string) => void;
	}
	let {name, topline, tagline, limits, onchange}: Props = $props();

	const fields = $derived([
		{
			key: 'name',
			label: m.field_name(),
			hint: '',
			value: name,
			max: limits.name,
			placeholder: DEFAULT_CONFIG.name
		},
		{
			key: 'topline',
			label: m.field_topline(),
			hint: m.field_topline_hint(),
			value: topline,
			max: limits.topline,
			placeholder: 'EST. 2026'
		},
		{
			key: 'tagline',
			label: m.field_tagline(),
			hint: m.field_tagline_hint(),
			value: tagline,
			max: limits.tagline,
			placeholder: 'INDEPENDENT GOODS'
		}
	] as const);
</script>

<div>
	{#each fields as field (field.key)}
		<div class="group mb-[9px] flex items-baseline gap-1.5 text-[14px] whitespace-nowrap">
			<label for="campo-{field.key}"
				>{field.label}{#if field.hint}<span class="visually-hidden">
						({field.hint})</span
					>{/if}</label
			>
			<span
				class="min-w-3 flex-1 -translate-y-1 border-b border-dotted border-ink group-focus-within:border-solid"
				aria-hidden="true"
			></span>
			<!-- O espelho (data-value) faz o campo crescer com o texto, como a linha pontilhada pede. -->
			<span
				class={[
					"inline-grid min-w-[4ch] font-bold after:invisible after:overflow-hidden after:whitespace-pre after:content-[attr(data-value)_'_'] after:[grid-area:1/1]",
					field.key === 'name'
						? 'text-[22px] tracking-[0] italic'
						: 'text-[12.5px] tracking-[0.06em]'
				]}
				data-value={field.value || field.placeholder}
			>
				<input
					class="w-full min-w-0 bg-transparent p-0 text-right tracking-[inherit] text-ellipsis [grid-area:1/1] placeholder:text-ink-soft placeholder:opacity-50 focus-visible:outline-offset-4"
					id="campo-{field.key}"
					type="text"
					value={field.value}
					maxlength={field.max}
					placeholder={field.placeholder}
					autocomplete="off"
					spellcheck="false"
					oninput={(event) => onchange(field.key, event.currentTarget.value)}
				/>
			</span>
		</div>
	{/each}
</div>
