<script lang="ts">
	interface Props {
		id: string;
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
		format?: (value: number) => string;
		onchange: (value: number) => void;
	}
	let {id, label, value, min, max, step, format = String, onchange}: Props = $props();

	// Filete de 1px com marcador redondo; cada navegador tem o próprio pseudo-elemento da trilha e do marcador.
	// O anel de foco vai no marcador, não no campo todo.
	const slider = [
		'm-0 h-6 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent focus-visible:outline-none',
		'[&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-ink',
		'[&::-moz-range-track]:h-px [&::-moz-range-track]:bg-ink',
		'[&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-[13px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-ink',
		'[&::-moz-range-thumb]:size-[13px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink',
		'[&:focus-visible::-webkit-slider-thumb]:outline-2 [&:focus-visible::-webkit-slider-thumb]:outline-offset-3 [&:focus-visible::-webkit-slider-thumb]:outline-ink',
		'[&:focus-visible::-moz-range-thumb]:outline-2 [&:focus-visible::-moz-range-thumb]:outline-offset-3 [&:focus-visible::-moz-range-thumb]:outline-ink'
	].join(' ');
</script>

<div class="my-1.5 flex items-center gap-2 text-[12px] tracking-[0.06em] uppercase">
	<label class="flex-none" for={id}>{label}</label>
	<input
		class={slider}
		{id}
		type="range"
		{min}
		{max}
		{step}
		{value}
		oninput={(event) => onchange(event.currentTarget.valueAsNumber)}
	/>
	<output class="min-w-[3.4ch] text-right" for={id}>{format(value)}</output>
</div>
