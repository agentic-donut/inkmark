// Regressão de segurança: texto do usuário (nome, texto superior e complementar) e valores adulterados
// no localStorage nunca viram marcação no SVG, que o app injeta na página com {@html}.
import {readFileSync} from 'node:fs';
import {describe, expect, test} from 'vitest';
import {EFFECT_LEVELS, applyEffects, fonts, registerFont, renderLogo, templates} from './index';
import {DEFAULT_CONFIG, sanitizeConfig} from '../editor/index';
import type {LogoConfig} from '../editor/types';

for (const font of fonts) {
	const file = readFileSync(new URL(`../../../../static/fonts/${font.id}.ttf`, import.meta.url));
	registerFont(
		font.id,
		file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
	);
}

const PAYLOADS = [
	'<script>window.__pwn=1</script>',
	'"><svg onload=window.__pwn=1>',
	"'><img src=x onerror=window.__pwn=1>",
	'" onmouseover="window.__pwn=1" x="',
	"' onfocus='window.__pwn=1' autofocus='",
	'</title><script>window.__pwn=1</script>',
	'</svg><script>window.__pwn=1</script><svg>',
	']]><script>window.__pwn=1</script>',
	'<![CDATA[<script>window.__pwn=1</script>]]>',
	'<!-- --><script>window.__pwn=1</script>',
	'&lt;script&gt;&amp;#x3C;script&amp;#62;&#60;script&#62;',
	'javascript:window.__pwn=1',
	'<a xlink:href="javascript:window.__pwn=1"><text>x</text></a>',
	'<foreignObject><body onload=window.__pwn=1></foreignObject>',
	'<style>*{background:url(//evil.example/x)}</style>',
	'‮<script>\u0000window.__pwn=1</script>  ',
	'`${window.__pwn=1}`\\"\\\'',
	'A'.repeat(500) + '"><script>'
];

const ATTRIBUTE = String.raw`[^\s"'<>/=]+(?:="[^"]*")?`;
const TAG = new RegExp(String.raw`<([a-zA-Z][\w:-]*)((?:\s+${ATTRIBUTE})*)\s*/?>`, 'g');
const CLOSING_TAG = /<\/([a-zA-Z][\w:-]*)\s*>/g;

/** Nomes de elementos e de atributos usados; qualquer `<` fora de uma marcação bem formada vira `malformed`. */
function inventory(svg: string) {
	const tags = new Set<string>();
	const attributes = new Set<string>();
	let wellFormed = 0;
	for (const match of svg.matchAll(TAG)) {
		wellFormed++;
		tags.add(match[1]);
		for (const attribute of match[2].matchAll(new RegExp(ATTRIBUTE, 'g'))) {
			attributes.add(attribute[0].split('=')[0]);
		}
	}
	wellFormed += [...svg.matchAll(CLOSING_TAG)].length;
	const malformed = (svg.match(/</g) ?? []).length - wellFormed;
	return {tags, attributes, malformed};
}

const allowed = (() => {
	const tags = new Set<string>();
	const attributes = new Set<string>();
	const config: Partial<LogoConfig> = {name: 'Wild Coast', tagline: 'FEITO NO BRASIL'};
	for (const template of templates) {
		for (const variant of ['light', 'dark'] as const) {
			const svg = applyEffects(
				renderLogo({...config, template: template.id, font: template.font}, variant, true),
				{halftone: 3, bleed: 3, pressure: 3, wear: 3}
			);
			const found = inventory(svg);
			found.tags.forEach((tag) => tags.add(tag));
			found.attributes.forEach((attribute) => attributes.add(attribute));
		}
	}
	return {tags, attributes};
})();

function assertInert(svg: string, context: string) {
	const found = inventory(svg);
	expect(found.malformed, `${context}: '<' solto`).toBe(0);
	expect(
		[...found.tags].filter((tag) => !allowed.tags.has(tag)),
		context
	).toEqual([]);
	expect(
		[...found.attributes].filter((name) => !allowed.attributes.has(name)),
		context
	).toEqual([]);
	// Valores entre aspas e o texto do <title> são dados; o que sobra é a estrutura do SVG.
	const structure = svg
		.replace(/"[^"]*"/g, '""')
		.replace(/<title>[^<]*<\/title>/g, '<title></title>');
	expect(structure, context).not.toMatch(
		/<script|javascript:|\son\w+\s*=|<foreignObject|<style|<!\[CDATA|<!--/i
	);
}

describe('o inventário de referência', () => {
	test('só tem elementos e atributos de desenho (nenhum script, evento ou link)', () => {
		expect([...allowed.tags].sort()).not.toContain('script');
		expect([...allowed.attributes].filter((name) => /^on/i.test(name))).toEqual([]);
		expect([...allowed.attributes].filter((name) => /href/i.test(name))).toEqual([]);
	});
});

describe('texto do usuário no SVG', () => {
	test('nenhum payload cria elemento, atributo ou texto executável em qualquer modelo', () => {
		// Os três campos recebem payloads diferentes a cada volta, então todo payload passa por todo campo.
		for (const template of templates) {
			PAYLOADS.forEach((_, index) => {
				const pick = (shift: number) => PAYLOADS[(index + shift) % PAYLOADS.length];
				const svg = renderLogo(
					{
						...DEFAULT_CONFIG,
						template: template.id,
						font: template.font,
						name: pick(0),
						tagline: pick(1),
						topline: pick(2)
					},
					index % 2 ? 'dark' : 'light',
					true
				);
				assertInert(svg, `${template.id}/${index}`);
			});
		}
		// Exaustivo e lento no servidor de deploy (passou de 60 s lá); o teto só existe para não travar.
	}, 300_000);

	test('o texto que aparece no title e no aria-label sai escapado', () => {
		const svg = renderLogo({...DEFAULT_CONFIG, name: PAYLOADS[1]}, 'light', false);
		expect(svg).toContain('aria-label="&quot;&gt;&lt;svg onload=window.__pwn=1&gt;"');
		expect(svg).toContain('<title>&quot;&gt;&lt;svg onload=window.__pwn=1&gt; — ');
		// Entidades digitadas pelo usuário também são escapadas (viram texto, não caracteres).
		const entities = renderLogo({...DEFAULT_CONFIG, name: '&lt;b&gt; &#60;'}, 'dark', false);
		expect(entities).toContain('aria-label="&amp;lt;b&amp;gt; &amp;#60;"');
	});

	test('os efeitos de impressão também não deixam passar nada', () => {
		for (const level of EFFECT_LEVELS) {
			const svg = applyEffects(
				renderLogo({...DEFAULT_CONFIG, name: PAYLOADS[1], tagline: PAYLOADS[0]}, 'dark', true),
				{halftone: level, bleed: level, pressure: level, wear: level}
			);
			assertInert(svg, `efeitos nível ${level}`);
		}
	});
});

describe('configuração adulterada no localStorage', () => {
	const context = {
		templateIds: templates.map((template) => template.id),
		fontIds: fonts.map((font) => font.id)
	};
	const hostile = {
		name: PAYLOADS[1],
		tagline: PAYLOADS[3],
		topline: PAYLOADS[0],
		template: '"><script>window.__pwn=1</script>',
		font: '"><script>window.__pwn=1</script>',
		ornament: '"/><script>window.__pwn=1</script>',
		size: '100"/><script>window.__pwn=1</script>',
		spacing: '0)"/><script>window.__pwn=1</script>',
		tilt: '0)"><script>window.__pwn=1</script>',
		wear: '3"><script>',
		halftone: {toString: () => '"><script>'},
		bleed: ['"><script>'],
		pressure: null
	};

	test('sanitizeConfig devolve só valores do tipo e do domínio esperados', () => {
		const config = sanitizeConfig(hostile, context);
		expect(typeof config.size).toBe('number');
		expect(typeof config.spacing).toBe('number');
		expect(typeof config.tilt).toBe('number');
		expect(context.templateIds).toContain(config.template);
		expect(context.fontIds).toContain(config.font);
		expect(['none', 'stars', 'diamond', 'mountain']).toContain(config.ornament);
		for (const level of [config.wear, config.halftone, config.bleed, config.pressure]) {
			expect([0, 1, 2, 3]).toContain(level);
		}
		assertInert(renderLogo(config, 'light', true), 'configuração sanitizada');
	});

	test('números fora do limite ou não finitos não chegam ao SVG como NaN nem como texto', () => {
		for (const value of [NaN, Infinity, -Infinity, 1e308, -1e308, '1e999']) {
			const config = sanitizeConfig({size: value, spacing: value, tilt: value}, context);
			const svg = renderLogo(config, 'light', true);
			expect(svg).not.toMatch(/NaN|Infinity/);
			assertInert(svg, `número ${String(value)}`);
		}
	});

	test('a fonte importada só vale quando o usuário importou uma nesta sessão', () => {
		const saved = {template: context.templateIds[0], font: 'custom'};
		expect(sanitizeConfig(saved, context).font).toBe(DEFAULT_CONFIG.font);
		expect(sanitizeConfig(saved, {...context, customFontAvailable: true}).font).toBe('custom');
	});
});
