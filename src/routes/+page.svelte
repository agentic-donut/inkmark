<script lang="ts">
	import {browser} from '$app/env';
	import {page as route} from '$app/state';
	import {onMount, tick, untrack} from 'svelte';
	import {cardConfig, downloadContactSheet} from '#lib/application/index.ts';
	import type {CatalogEntry} from '#lib/domain/catalog/index.ts';
	import {DEFAULT_CONFIG, LIMITS, type LogoConfig} from '#lib/domain/editor/index.ts';
	import {EFFECT_LEVELS, fonts, templates, type EffectKey} from '#lib/domain/logo/index.ts';
	import {alternateLinks, localePath} from '#lib/i18n/routing.ts';
	import {m} from '#lib/paraglide/messages.js';
	import {getLocale} from '#lib/paraglide/runtime.js';
	import Classifieds from '#lib/ui/components/public/Classifieds.svelte';
	import Dateline from '#lib/ui/components/public/Dateline.svelte';
	import EditionToggle from '#lib/ui/components/public/EditionToggle.svelte';
	import EffectPicker from '#lib/ui/components/public/EffectPicker.svelte';
	import ExportAd from '#lib/ui/components/public/ExportAd.svelte';
	import ExportDialog from '#lib/ui/components/public/ExportDialog.svelte';
	import Folio from '#lib/ui/components/public/Folio.svelte';
	import Headline from '#lib/ui/components/public/Headline.svelte';
	import Kicker from '#lib/ui/components/public/Kicker.svelte';
	import LanguageSwitcher from '#lib/ui/components/public/LanguageSwitcher.svelte';
	import LeadPhoto from '#lib/ui/components/public/LeadPhoto.svelte';
	import Masthead from '#lib/ui/components/public/Masthead.svelte';
	import NewsroomColumn from '#lib/ui/components/public/NewsroomColumn.svelte';
	import Toast from '#lib/ui/components/public/Toast.svelte';
	import {captionText} from '#lib/ui/components/public/caption.ts';
	import {effectSwatch} from '#lib/ui/components/public/effect-swatch.ts';
	import {inertServices} from '#lib/ui/components/public/inert-services.ts';
	import {clientServices} from '#lib/ui/composition.ts';
	import {readPageParam, writePageParam} from '#lib/ui/page-url.ts';
	import {isNarrowLayout, scrollToElement} from '#lib/ui/scroll.ts';
	import {CatalogState, EditorState, ExportState, ToastState} from '#lib/ui/state/index.ts';
	import type {PageData} from './$types';

	let {data}: {data: PageData} = $props();

	// As configurações do admin chegam uma vez por carregamento da página; a rota é a raiz de composição.
	const catalog = untrack(() => new CatalogState(templates, data.settings, readPageParam()));
	const services = browser ? clientServices() : inertServices;

	const editor = new EditorState({
		renderer: services.renderer,
		fontLoader: services.fontLoader,
		store: services.store,
		templates: catalog.visible.length ? catalog.visible : catalog.entries,
		fonts,
		defaultTemplate: catalog.defaultTemplate
	});
	const locale = getLocale();
	const exporter = new ExportState(
		{...services, variantLabels: {light: m.export_suffix_light(), dark: m.export_suffix_dark()}},
		() => editor.config
	);
	const toast = new ToastState();

	const numbers = Object.fromEntries(
		templates.map((template, index) => [template.id, String(index + 1).padStart(3, '0')])
	);
	const LEVEL_NAME = {
		0: m.effect_level_0,
		1: m.effect_level_1,
		2: m.effect_level_2,
		3: m.effect_level_3
	} as const;
	const effectOptions = (effect: EffectKey) =>
		EFFECT_LEVELS.map((level) => ({
			level,
			name: LEVEL_NAME[level](),
			swatch: effectSwatch(effect, level)
		}));
	// Na ordem do painel; os quatro são independentes e valem juntos.
	const effectControls = (
		[
			['wear', m.ink_title(), m.wear_title()],
			['halftone', m.halftone_title(), m.halftone_title()],
			['pressure', m.pressure_title(), m.pressure_title()],
			['bleed', m.bleed_title(), m.bleed_title()]
		] as const
	).map(([key, kicker, label]) => ({key, kicker, label, options: effectOptions(key)}));

	// Colunas laterais da grade principal (a central tem o próprio preenchimento).
	const side = 'min-w-0 px-[22px] pt-5 pb-[26px]';

	let leadSection: HTMLElement;
	let today = $state('');
	let sheetBusy = $state(false);

	// O nome da marca nos cards é adiado: digitar não redesenha centenas de cards a cada tecla.
	const CARD_TEXT_DELAY_MS = 200;
	let cardText = $state({
		name: editor.config.name,
		topline: editor.config.topline,
		tagline: editor.config.tagline
	});
	const name = $derived(editor.config.name);
	const topline = $derived(editor.config.topline);
	const tagline = $derived(editor.config.tagline);
	$effect(() => {
		const next = {name, topline, tagline};
		const timer = setTimeout(() => (cardText = next), CARD_TEXT_DELAY_MS);
		return () => clearTimeout(timer);
	});

	const cardBase = $derived<LogoConfig>({
		...DEFAULT_CONFIG,
		...(catalog.useMyName ? cardText : {}),
		wear: editor.config.wear,
		halftone: editor.config.halftone,
		pressure: editor.config.pressure,
		bleed: editor.config.bleed
	});
	const renderCard = (entry: CatalogEntry) =>
		editor.fontsReady
			? services.renderer.render(cardConfig(entry, cardBase, catalog.useMyName), 'light')
			: '';

	// A URL acompanha a página aberta (já ajustada aos limites), sem recarregar nem empilhar histórico.
	$effect(() => writePageParam(catalog.paged.page));

	const night = $derived(editor.variant === 'dark');
	const templateName = $derived(
		catalog.entries.find((entry) => entry.id === editor.config.template)?.name ??
			editor.template?.name ??
			''
	);
	const caption = $derived(captionText(editor.config.name, templateName, editor.config));
	const origin = $derived(route.url.origin);

	onMount(() => {
		today = new Date().toLocaleDateString(locale, {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
		void editor.init().then(() => {
			cardText = {
				name: editor.config.name,
				topline: editor.config.topline,
				tagline: editor.config.tagline
			};
			if (editor.fontsError) toast.show(m.toast_fonts_failed());
		});
	});

	async function importFont(file: File) {
		try {
			const ok = editor.registerCustomFont(await file.arrayBuffer());
			toast.show(ok ? m.toast_font_imported() : m.toast_font_invalid());
		} catch {
			toast.show(m.toast_file_unreadable());
		}
	}

	function reset() {
		editor.reset();
		toast.show(m.toast_reset());
	}

	function selectTemplate(entry: CatalogEntry) {
		editor.selectTemplate(entry);
		toast.show(m.toast_template_selected({name: entry.name}));
		// Em tela estreita a prova fica no topo, longe do cartão tocado: leva a pessoa até o resultado.
		if (isNarrowLayout()) scrollToElement(leadSection);
	}

	async function runExport() {
		if (await exporter.run()) toast.show(m.toast_export_done());
	}

	async function downloadSheet() {
		if (sheetBusy || !editor.fontsReady) return;
		sheetBusy = true;
		// Dá um quadro para a página mostrar "Montando…" antes de o desenho das pranchas travar a thread.
		await tick();
		await new Promise((resolve) => setTimeout(resolve, 0));
		try {
			downloadContactSheet(
				catalog.filtered,
				editor.config,
				{useMyName: catalog.useMyName, filename: m.contact_sheet_filename()},
				services
			);
			toast.show(m.toast_sheet_done());
		} catch (error) {
			console.error(error);
			toast.show(m.toast_sheet_failed());
		} finally {
			sheetBusy = false;
		}
	}
</script>

<svelte:head>
	<title>{m.meta_title()}</title>
	<meta name="description" content={m.meta_description()} />
	<link rel="canonical" href={origin + localePath(locale)} />
	{#each alternateLinks(origin) as alternate (alternate.hreflang)}
		<link rel="alternate" hreflang={alternate.hreflang} href={alternate.href} />
	{/each}
</svelte:head>

<div
	class="page-shell [@media(640px<width<=1000px)]:[--page-gutter:24px] [@media(width<=640px)]:[--page-gutter:16px]"
>
	<header class="relative">
		<LanguageSwitcher class="absolute top-1 right-0.5 z-1" page={catalog.paged.page} />
		<Masthead compositions={catalog.counts.Todos} fontCount={fonts.length} />
		<Dateline issue={catalog.counts.Todos} date={today} {night} />
	</header>

	<main>
		<Headline />

		<div
			class="grid grid-cols-[270px_1fr_270px] [@media(640px<width<=1000px)]:grid-cols-[1fr_1fr] [@media(width<=640px)]:grid-cols-[1fr]"
		>
			<section
				class="{side} [@media(width<=1000px)]:border-t [@media(width<=1000px)]:border-ink [@media(width<=1000px)]:pl-0 [@media(width<=640px)]:pr-0"
				aria-label={m.newsroom_title()}
			>
				<NewsroomColumn
					config={editor.config}
					{fonts}
					limits={LIMITS}
					customFontAvailable={editor.customFontAvailable}
					tiltEnabled={editor.template?.tilt === true}
					ontext={(key, value) => editor.setField(key, value)}
					onfont={(id) => editor.setField('font', id)}
					onnumber={(key, value) => editor.setField(key, value)}
					onornament={(ornament) => editor.setField('ornament', ornament)}
					onfontfile={importFont}
					onreset={reset}
				/>
			</section>

			<section
				class="min-w-0 scroll-mt-3 border-l border-ink px-[26px] py-5 [@media(width<=1000px)]:-order-1 [@media(width<=1000px)]:col-span-full [@media(width<=1000px)]:border-l-0 [@media(width<=1000px)]:px-0"
				aria-label={m.live_proof_title()}
				bind:this={leadSection}
			>
				<LeadPhoto
					svg={editor.previewSvg}
					{night}
					loading={!editor.fontsReady}
					error={editor.fontsError}
					{caption}
					label={m.lead_photo_label({name: editor.config.name})}
				/>
				<ExportAd disabled={!editor.canExport} onopen={() => exporter.openDialog()} />
			</section>

			<div
				class="{side} border-l border-ink [@media(width<=1000px)]:border-t [@media(width<=1000px)]:border-ink [@media(width<=1000px)]:pr-0 [@media(width<=640px)]:border-l-0 [@media(width<=640px)]:pl-0"
			>
				<Kicker>{m.edition_title()}</Kicker>
				<EditionToggle value={editor.variant} onselect={(variant) => editor.setVariant(variant)} />
				{#each effectControls as control (control.key)}
					<Kicker>{control.kicker}</Kicker>
					<EffectPicker
						label={control.label}
						options={control.options}
						value={editor.config[control.key]}
						onselect={(level) => editor.setField(control.key, level)}
					/>
				{/each}
			</div>
		</div>

		<Classifieds
			counts={catalog.counts}
			category={catalog.category}
			paged={catalog.paged}
			{numbers}
			selectedId={editor.config.template}
			useMyName={catalog.useMyName}
			{sheetBusy}
			sheetDisabled={!editor.fontsReady}
			render={renderCard}
			oncategory={(category) => catalog.setCategory(category)}
			onusemyname={(value) => catalog.setUseMyName(value)}
			onselect={selectTemplate}
			onpage={(page) => catalog.setPage(page)}
			onsheet={downloadSheet}
		/>
	</main>

	<footer>
		<Folio compositions={catalog.counts.Todos} page={catalog.paged.page} />
	</footer>
</div>

<ExportDialog
	open={exporter.open}
	options={exporter.options}
	resolutionEnabled={exporter.resolutionEnabled}
	status={exporter.status}
	failed={exporter.failed}
	busy={exporter.busy}
	canExport={editor.canExport}
	onchange={(key, value) => exporter.setOption(key, value)}
	onsubmit={runExport}
	onclose={() => exporter.closeDialog()}
/>
<Toast message={toast.message} visible={toast.visible} />
