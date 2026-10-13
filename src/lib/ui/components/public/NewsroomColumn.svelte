<script lang="ts">
	import {m} from '#lib/paraglide/messages.js';
	import {DEFAULT_CONFIG} from '#lib/domain/editor/index.ts';
	import type {LogoConfig, Ornament} from '#lib/domain/editor/index.ts';
	import FontPicker from './FontPicker.svelte';
	import FontUpload from './FontUpload.svelte';
	import Kicker from './Kicker.svelte';
	import OrnamentPicker from './OrnamentPicker.svelte';
	import RangeField from './RangeField.svelte';
	import TextFields from './TextFields.svelte';

	interface Limits {
		size: {min: number; max: number; step: number};
		spacing: {min: number; max: number; step: number};
		tilt: {min: number; max: number; step: number};
		nameLength: number;
		taglineLength: number;
		toplineLength: number;
	}

	interface Props {
		config: LogoConfig;
		fonts: readonly {id: string; name: string}[];
		limits: Limits;
		customFontAvailable: boolean;
		tiltEnabled: boolean;
		ontext: (key: 'name' | 'topline' | 'tagline', value: string) => void;
		onfont: (id: string) => void;
		onnumber: (key: 'size' | 'spacing' | 'tilt', value: number) => void;
		onornament: (ornament: Ornament) => void;
		onfontfile: (file: File) => void;
		onreset: () => void;
	}
	let {
		config,
		fonts,
		limits,
		customFontAvailable,
		tiltEnabled,
		ontext,
		onfont,
		onnumber,
		onornament,
		onfontfile,
		onreset
	}: Props = $props();
</script>

<Kicker>
	{m.newsroom_title()}
	{#snippet aside()}
		<button
			type="button"
			class="cursor-pointer p-0 text-[11px] font-normal tracking-[0.08em] italic underline underline-offset-3 hover:decoration-double"
			onclick={onreset}
		>
			{m.newsroom_reset()}
		</button>
	{/snippet}
</Kicker>
<TextFields
	name={config.name}
	topline={config.topline}
	tagline={config.tagline}
	limits={{name: limits.nameLength, topline: limits.toplineLength, tagline: limits.taglineLength}}
	onchange={ontext}
/>

<div class="h-5"></div>
<Kicker>{m.typefaces_title()}</Kicker>
<FontPicker
	{fonts}
	value={config.font}
	sample={config.name || DEFAULT_CONFIG.name}
	customAvailable={customFontAvailable}
	onselect={onfont}
/>
<RangeField
	id="campo-corpo"
	label={m.range_size()}
	value={config.size}
	{...limits.size}
	format={(v) => `${v}%`}
	onchange={(v) => onnumber('size', v)}
/>
<RangeField
	id="campo-entreletra"
	label={m.range_spacing()}
	value={config.spacing}
	{...limits.spacing}
	onchange={(v) => onnumber('spacing', v)}
/>
{#if tiltEnabled}
	<RangeField
		id="campo-inclinacao"
		label={m.range_tilt()}
		value={config.tilt}
		{...limits.tilt}
		format={(v) => `${v}°`}
		onchange={(v) => onnumber('tilt', v)}
	/>
{/if}

<div class="h-5"></div>
<Kicker>{m.ornament_title()}</Kicker>
<OrnamentPicker value={config.ornament} onselect={onornament} />
<FontUpload onfile={onfontfile} />
