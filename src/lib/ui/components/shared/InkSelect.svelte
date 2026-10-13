<script lang="ts" generics="T extends string">
	// Seletor com a lista desenhada no papel do app, no lugar do menu nativo do sistema.
	// Segue o padrão ARIA de listbox: botão com aria-haspopup, lista com o foco nas opções
	// (setas, Home/End, Enter/Espaço escolhem, Esc e Tab fecham, letras saltam pela inicial).

	interface Option {
		value: T;
		label: string;
	}

	interface Props {
		id: string;
		value: T;
		options: readonly Option[];
		disabled?: boolean;
		/** Com `name`, o valor também vai num campo oculto, para formulários sem JavaScript de envio próprio. */
		name?: string;
		class?: string;
		onchange: (value: T) => void;
	}
	let {
		id,
		value,
		options,
		disabled = false,
		name,
		class: className = '',
		onchange
	}: Props = $props();

	let open = $state(false);
	let active = $state(0);
	let button: HTMLButtonElement;
	let list = $state<HTMLUListElement>();

	const selected = $derived(options.find((option) => option.value === value) ?? options[0]);
	const listId = $derived(`${id}-lista`);
	const optionId = (index: number) => `${id}-opcao-${index}`;

	function show() {
		if (disabled) return;
		active = Math.max(0, options.indexOf(selected));
		open = true;
	}

	function hide(refocus = true) {
		open = false;
		if (refocus) button.focus();
	}

	function choose(index: number) {
		const option = options[index];
		hide();
		if (option && option.value !== value) onchange(option.value);
	}

	// A lista recebe o foco ao abrir e acompanha a opção ativa quando ela sai da área visível.
	$effect(() => {
		if (!open || !list) return;
		list.focus();
		list.querySelector(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({block: 'nearest'});
	});

	function onButtonKey(event: KeyboardEvent) {
		if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
			event.preventDefault();
			show();
		}
	}

	function onListKey(event: KeyboardEvent) {
		const last = options.length - 1;
		const moves: Record<string, () => number> = {
			ArrowDown: () => Math.min(last, active + 1),
			ArrowUp: () => Math.max(0, active - 1),
			Home: () => 0,
			End: () => last
		};
		if (moves[event.key]) {
			event.preventDefault();
			active = moves[event.key]();
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			choose(active);
		} else if (event.key === 'Escape') {
			// Sem isto, o Esc também fecharia o <dialog> em volta.
			event.preventDefault();
			event.stopPropagation();
			hide();
		} else if (event.key === 'Tab') {
			hide(false);
		} else if (event.key.length === 1) {
			const letter = event.key.toLowerCase();
			const next = options.findIndex(
				(option, index) => index > active && option.label.toLowerCase().startsWith(letter)
			);
			const first = options.findIndex((option) => option.label.toLowerCase().startsWith(letter));
			if (next >= 0 || first >= 0) active = next >= 0 ? next : first;
		}
	}

	// Clique fora fecha sem escolher.
	function onWindowPointer(event: PointerEvent) {
		if (open && !button.parentElement?.contains(event.target as Node)) hide(false);
	}
</script>

<svelte:window onpointerdown={onWindowPointer} />

<div class="relative {className}">
	<button
		bind:this={button}
		{id}
		type="button"
		class="w-full cursor-pointer border border-ink bg-transparent select-caret pt-2 pr-8 pb-1.5 pl-2.5 text-left text-[15px] disabled:cursor-not-allowed disabled:opacity-45"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={listId}
		{disabled}
		onclick={() => (open ? hide() : show())}
		onkeydown={onButtonKey}
	>
		{selected?.label}
	</button>
	{#if name}<input type="hidden" {name} {value} />{/if}

	{#if open}
		<ul
			bind:this={list}
			id={listId}
			role="listbox"
			tabindex="-1"
			aria-labelledby={id}
			aria-activedescendant={optionId(active)}
			class="absolute inset-x-0 top-[calc(100%_-_1px)] z-10 m-0 max-h-60 list-none overflow-auto border border-ink p-0 paper-sheet shadow-[3px_3px_0_var(--color-ink)] outline-none"
			onkeydown={onListKey}
		>
			{#each options as option, index (option.value)}
				<!-- O teclado fica com a lista (aria-activedescendant); a opção só responde ao ponteiro. -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id={optionId(index)}
					role="option"
					aria-selected={option.value === value}
					class="flex cursor-pointer items-center gap-2 border-t border-dotted border-ink/40 px-2.5 pt-2 pb-1.5 text-[15px] first:border-t-0 aria-selected:font-bold"
					class:bg-ink={index === active}
					class:text-paper={index === active}
					onpointermove={() => (active = index)}
					onclick={() => choose(index)}
				>
					<span class="w-3 shrink-0 text-[10px]" aria-hidden="true"
						>{option.value === value ? '◆' : ''}</span
					>
					<span>{option.label}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>
