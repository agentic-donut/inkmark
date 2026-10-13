// Pranchas dos efeitos de impressão (níveis e combinações): node scripts/review-finishes.mjs [medir]
// Importa o domínio TypeScript direto (o Node 24 remove os tipos) e desenha no Chromium, como o app.
// Precisa do playwright-core: defina PLAYWRIGHT_CORE com o caminho do pacote se ele não estiver instalado
// e CHROME_PATH com o executável do Chromium.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fonts, registerFont, templates, renderLogo} from '../src/lib/domain/logo/registry.js';
import {applyEffects} from '../src/lib/domain/logo/effects.ts';

for (const f of fonts) {
	const b = readFileSync(new URL(`../static/fonts/${f.id}.ttf`, import.meta.url));
	registerFont(f.id, b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_CORE ?? 'playwright-core');
const CHROME =
	process.env.CHROME_PATH ??
	`${process.env.HOME}/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const OUT = new URL('../docs/review/acabamentos/', import.meta.url);

const NONE = {halftone: 0, bleed: 0, pressure: 0, wear: 1};
const IDS = ['hex-solid', 'arched-seal', 'sunset'];
const base = (id) => {
	const t = templates.find((t) => t.id === id);
	return renderLogo(
		{template: id, font: t.font, ornament: t.ornament ?? 'stars', name: 'Inkmark', topline: 'EST. 2026', tagline: 'MARCAS IMPRESSAS'},
		'light',
		false
	);
};
const level = (n) => ['Sem', 'Leve', 'Médio', 'Forte'][n];
const render = (id, fx) => applyEffects(base(id), {...NONE, ...fx});

function sheet(columns, {cell, title}) {
	const head = columns.map(([name]) => `<div class="h">${name}</div>`).join('');
	const rows = IDS.map(
		(id) => columns.map(([, fx]) => `<div class="c">${render(id, fx)}</div>`).join('')
	).join('');
	return `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#e3e0d6;color:#1a1918;font:600 17px Georgia,serif}
.g{display:grid;grid-template-columns:repeat(${columns.length},${cell}px);gap:0}
.h{padding:14px 6px;text-align:center}.c{height:${cell * 0.83}px}.c svg{width:100%;height:100%;display:block}
.t{padding:12px 16px;font-size:20px}
</style><div class="t">${title}</div><div class="g">${head}${rows}</div>`;
}

async function shoot(browser, html, file, width, height) {
	const page = await browser.newPage({viewport: {width, height}, deviceScaleFactor: 2});
	await page.setContent(html);
	await page.screenshot({path: new URL(file, OUT).pathname, fullPage: true});
	await page.close();
	console.log('Prancha:', `docs/review/acabamentos/${file}`);
}

/** Tinta nas metades esquerda e direita (canal vermelho < 90), medida num canvas como no app. */
async function inkRatio(browser, svg) {
	const page = await browser.newPage();
	const ratio = await page.evaluate(async (markup) => {
		const sized = markup.replace('width="1200" height="1000"', 'width="600" height="500"');
		const url = URL.createObjectURL(new Blob([sized], {type: 'image/svg+xml'}));
		const img = new Image();
		await new Promise((ok) => ((img.onload = ok), (img.src = url)));
		const canvas = Object.assign(document.createElement('canvas'), {width: 600, height: 500});
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = '#fff';
		ctx.fillRect(0, 0, 600, 500);
		ctx.drawImage(img, 0, 0, 600, 500);
		const {data} = ctx.getImageData(0, 0, 600, 500);
		let left = 0, right = 0;
		for (let i = 0; i < data.length; i += 4) if (data[i] < 90) ((i / 4) % 600 < 300 ? left++ : right++);
		return right / left;
	}, svg);
	await page.close();
	return ratio;
}

const browser = await chromium.launch({executablePath: CHROME});
mkdirSync(OUT, {recursive: true});

if (process.argv[2] === 'medir') {
	for (const id of IDS)
		console.log(id, 'razão direita/esquerda, pressão 0-3:', (await Promise.all([0, 1, 2, 3].map((n) => inkRatio(browser, render(id, {pressure: n}))))).map((r) => r.toFixed(3)).join('  '));
} else {
	const single = [
		['Sem efeito', {}],
		...[1, 2, 3].map((n) => [`Retícula · ${level(n)}`, {halftone: n}]),
		...[1, 2, 3].map((n) => [`Pressão desigual · ${level(n)}`, {pressure: n}])
	];
	await shoot(browser, sheet(single, {cell: 340, title: 'Níveis da retícula e da pressão desigual (tinta leve)'}), 'niveis.png', 340 * single.length, 800);
	const combos = [
		['Retícula médio + pressão leve + tinta leve', {halftone: 2, pressure: 1, wear: 1}],
		['Tinta espalhada leve + pressão médio', {bleed: 1, pressure: 2}],
		['Os quatro em médio', {halftone: 2, pressure: 2, bleed: 2, wear: 2}],
		['Retícula forte + tinta espalhada forte', {halftone: 3, bleed: 3}]
	];
	await shoot(browser, sheet(combos, {cell: 520, title: 'Combinações'}), 'combinacoes.png', 520 * combos.length, 800);
}
await browser.close();
