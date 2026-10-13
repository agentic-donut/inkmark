// Apresentações de direções de design (páginas estáticas com logos reais).
// node scripts/design-mockups.mjs  → docs/review/design/*.html (abrir pelo Vite: /docs/review/design/...)
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fonts,registerFont} from '../src/lib/domain/logo/engine.js';
import {templates,renderLogo} from '../src/lib/domain/logo/registry.js';
import {applyWear,wearFilter} from '../src/lib/domain/logo/ink.js';
for(const f of fonts){const b=readFileSync(new URL(`../static/fonts/${f.id}.ttf`,import.meta.url));registerFont(f.id,b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
const out=new URL('../docs/review/design/',import.meta.url);mkdirSync(out,{recursive:true});

const brand={name:'Wild Coast',tagline:'AUTHENTIC GOODS',topline:'PREMIUM QUALITY'};
const hero='arched-seal';
const gallery=['crown-seal','shield-banner','postage','sheriff','laurel-ring','hex-solid','gothic','masthead','winged','sunset','french-crown','rosette-solid'];
const byId=id=>templates.find(t=>t.id===id);
function logo(id,{variant='light',wear=1,own=false}={}){
 const t=byId(id);
 const c={template:id,font:t.font,ornament:t.ornament??'stars',...(own?brand:{name:t.sample??brand.name,topline:t.topline??'PREMIUM QUALITY',tagline:t.tagline??'EST. 2026'})};
 return applyWear(renderLogo(c,variant,false),wear).replace('width="1200" height="1000"','');
}
const counts={Todos:templates.length};for(const t of templates)counts[t.category]=(counts[t.category]??0)+1;
const number=id=>String(templates.findIndex(t=>t.id===id)+1).padStart(3,'0');
const label=c=>({Lettering:'Lettering',Selos:'Selo',Emblemas:'Emblema'})[c];
// Amostra de desgaste: um carimbo redondo maciço com o filtro de cada nível.
const swatch=(level,color='#1d1b18')=>`<svg viewBox="150 75 300 300" aria-hidden="true">${level?`<defs>${wearFilter(level,7)}</defs>`:''}<g fill="${color}" ${level?`filter="url(#ink-wear-${level}-7)"`:''}><circle cx="300" cy="225" r="120"/></g></svg>`;
const fontFaces=[
 ...fonts.map(f=>`@font-face{font-family:'${f.id}';src:url('/fonts/${f.id}.ttf')}`),
 `@font-face{font-family:Fraunces;src:url('/fonts/ui/Fraunces.ttf');font-weight:100 900}`,
 `@font-face{font-family:Fraunces;src:url('/fonts/ui/Fraunces-Italic.ttf');font-style:italic;font-weight:100 900}`,
 `@font-face{font-family:Garamond;src:url('/fonts/ui/EBGaramond.ttf');font-weight:400 800}`,
 `@font-face{font-family:Garamond;src:url('/fonts/ui/EBGaramond-Italic.ttf');font-style:italic;font-weight:400 800}`,
 `@font-face{font-family:Plex;src:url('/fonts/ui/PlexMono.ttf')}`,`@font-face{font-family:Plex;src:url('/fonts/ui/PlexMono-Medium.ttf');font-weight:500}`,
 `@font-face{font-family:Courier;src:url('/fonts/ui/CourierPrime.ttf')}`,`@font-face{font-family:Courier;src:url('/fonts/ui/CourierPrime-Bold.ttf');font-weight:700}`,
 `@font-face{font-family:Elite;src:url('/fonts/ui/SpecialElite.ttf')}`,
 `@font-face{font-family:OldStandard;src:url('/fonts/ui/OldStandard-Regular.ttf')}`,`@font-face{font-family:OldStandard;src:url('/fonts/ui/OldStandard-Bold.ttf');font-weight:700}`,`@font-face{font-family:OldStandard;src:url('/fonts/ui/OldStandard-Italic.ttf');font-style:italic}`,
].join('');
// Tinta: a logo multiplica com o papel e deixa um pouco do dente aparecer, como tinta de verdade.
const inkCss=`.ink>svg{display:block;width:100%;height:auto;mix-blend-mode:multiply}.ink>svg>g{opacity:.94}.ink.white>svg{mix-blend-mode:normal}.ink.white>svg>g{opacity:.9}`;
const page=(title,css,body)=>`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${fontFaces}*{box-sizing:border-box}body{margin:0;-webkit-font-smoothing:antialiased}${inkCss}${css}</style></head><body>${body}</body></html>`;
const fontList=['BarlowCondensed','PirataOne','Lobster','AlfaSlabOne','BebasNeue','Yellowtail'];
const fontName=id=>fonts.find(f=>f.id===id).name.replace(' Bold','');

// ── A · Prova de gráfica ────────────────────────────────────────────────
// A página é uma prova de impressão: marcas de corte, régua de densidade e uma ordem de serviço.
function proof(){
 const crop=`<svg class="crops" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>`;
 const target=`<svg class="target" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="9" fill="none" stroke="currentColor" stroke-width="1"/><path d="M20 4V36M4 20H36" stroke="currentColor" stroke-width="1"/><circle cx="20" cy="20" r="4"/></svg>`;
 const css=`
body{background:#f1ebde url(/paper/algodao.jpg) 0 0/768px;color:#1d1b18;font-family:Garamond,serif}
.wrap{max-width:1280px;margin:0 auto;padding:0 48px}
.top{display:flex;justify-content:space-between;font:500 10.5px Plex,monospace;letter-spacing:.14em;text-transform:uppercase;padding:18px 0 14px;border-bottom:1px solid #1d1b18}
.mast{display:grid;grid-template-columns:1fr 360px;align-items:end;padding:34px 0 26px;border-bottom:3px double #1d1b18}
.mast h1{font:380 112px/0.86 Fraunces,serif;letter-spacing:-.045em;margin:0;font-variation-settings:'opsz' 144,'SOFT' 30}
.mast h1 i{font-weight:300;font-variation-settings:'opsz' 144,'SOFT' 100,'WONK' 1}
.mast p{font:italic 22px/1.35 Garamond,serif;margin:0 0 10px;color:#3a352d}
.mast nav{font:500 11px Plex,monospace;letter-spacing:.12em;text-transform:uppercase;margin-top:22px;display:flex;gap:22px}
.mast nav a{color:inherit;text-decoration:none;border-bottom:1px solid}
.grid{display:grid;grid-template-columns:1fr 380px;gap:0;border-bottom:1px solid #1d1b18}
.proof{position:sticky;top:0;align-self:start;padding:40px 70px 44px}
.sheet{position:relative;padding:48px 70px}
.sheet:before,.sheet:after,.sheet>i:before,.sheet>i:after{content:'';position:absolute;width:34px;height:34px;border-color:#1d1b18;border-style:solid;border-width:0}
.sheet:before{left:0;top:0;border-left-width:1px;border-top-width:1px;transform:translate(-14px,-14px);clip-path:polygon(0 0,100% 0,100% 1px,1px 1px,1px 100%,0 100%)}
.sheet:after{right:0;top:0;border-right-width:1px;border-top-width:1px;transform:translate(14px,-14px)}
.sheet>i:before{left:0;bottom:0;border-left-width:1px;border-bottom-width:1px;transform:translate(-14px,14px)}
.sheet>i:after{right:0;bottom:0;border-right-width:1px;border-bottom-width:1px;transform:translate(14px,14px)}
.target{position:absolute;width:30px;height:30px;top:50%;margin-top:-15px;color:#1d1b18}
.target.l{left:-52px}.target.r{right:-52px}
.art{max-width:680px;margin:0 auto}
.proof .sheet{padding:56px 50px}
.bar{display:flex;align-items:center;gap:0;margin:30px auto 0;max-width:600px;font:500 9.5px Plex,monospace;letter-spacing:.1em}
.bar span{width:46px;height:18px;background:#1d1b18}
.bar b{font-weight:500;margin-left:16px}
.slug{display:flex;flex-wrap:wrap;gap:6px 26px;max-width:600px;margin:14px auto 0;font:500 9.5px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;color:#4a443a}
.slug em{font-style:normal;color:#1d1b18}
.order{padding:30px 32px 32px;border-left:1px solid #1d1b18}
.order h2{font:500 11px Plex,monospace;letter-spacing:.16em;margin:0 0 4px}
.order .sub{font:italic 15px Garamond,serif;color:#5a5347;margin:0 0 22px}
.field{border-top:1px solid #1d1b18;padding:14px 0 16px}
.field>.h{display:flex;gap:10px;align-items:baseline;font:500 10px Plex,monospace;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
.field>.h span{opacity:.55}
.line{display:flex;align-items:baseline;gap:12px;padding:6px 0 4px;border-bottom:1px dotted #8a8170}
.line small{font:500 9px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;color:#6b6356;width:62px;flex-shrink:0}
.line b{font:500 19px Garamond,serif}
.line.big b{font-size:26px;font-style:italic}
.caret{display:inline-block;width:1px;height:22px;background:#1d1b18;margin-left:2px;vertical-align:-3px}
.faces{list-style:none;margin:0;padding:0}
.faces li{display:flex;align-items:center;gap:12px;padding:5px 0;font-size:24px;line-height:1.1}
.faces li:before{content:'';width:9px;height:9px;border:1px solid #1d1b18;border-radius:50%;flex-shrink:0}
.faces li.on:before{background:#1d1b18}
.faces li small{margin-left:auto;font:500 9px Plex,monospace;letter-spacing:.08em;color:#6b6356;text-transform:uppercase}
.more{font:500 9.5px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;margin-top:8px;display:flex;justify-content:space-between}
.more u{text-underline-offset:3px}
.ruler{position:relative;height:30px;margin:4px 0 2px;background:linear-gradient(#1d1b18,#1d1b18) 0 100%/100% 1px no-repeat,repeating-linear-gradient(90deg,#1d1b18 0 1px,transparent 1px 10px) 0 100%/100% 7px no-repeat,repeating-linear-gradient(90deg,#1d1b18 0 1px,transparent 1px 50px) 0 100%/100% 13px no-repeat}
.ruler i{position:absolute;bottom:14px;width:0;height:0;border:6px solid transparent;border-top:9px solid #1d1b18;margin-left:-6px}
.rl{display:flex;justify-content:space-between;font:500 9px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;color:#6b6356}
.rl b{color:#1d1b18;font-weight:500}
.chips{display:flex;gap:8px}
.chips span{flex:1;text-align:center;padding:8px 0 6px;border:1px solid #1d1b18;font:500 9px Plex,monospace;letter-spacing:.1em;text-transform:uppercase}
.chips span.on{background:#1d1b18;color:#f1ebde}
.chips span svg{display:block;width:30px;height:30px;margin:0 auto 6px}
.chips span.on svg g{fill:#f1ebde}
.papers{display:flex;gap:10px}
.papers span{flex:1;height:56px;border:1px solid #1d1b18;position:relative;font:500 9px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;display:flex;align-items:flex-end;padding:7px 8px}
.papers .a{background:#f1ebde url(/paper/algodao.jpg) 0 0/768px;outline:2px solid #1d1b18;outline-offset:3px}
.papers .b{background:#23211e url(/paper/preto.jpg) 0 0/768px;color:#efe8da}
.go{display:flex;justify-content:space-between;align-items:center;margin-top:20px;background:#1d1b18;color:#f1ebde;padding:17px 18px;font:500 11px Plex,monospace;letter-spacing:.16em;text-transform:uppercase}
.go big{font:italic 22px Garamond,serif;letter-spacing:0;text-transform:none}
.fine{font:500 9px Plex,monospace;letter-spacing:.1em;text-transform:uppercase;color:#6b6356;margin-top:9px}
.cat{padding:70px 0 20px}
.cat header{display:grid;grid-template-columns:1fr auto;align-items:end;gap:20px;border-bottom:1px solid #1d1b18;padding-bottom:16px}
.cat h2{font:330 64px/1 Fraunces,serif;letter-spacing:-.03em;margin:0;font-variation-settings:'opsz' 144,'SOFT' 50}
.cat h2 i{font-variation-settings:'opsz' 144,'SOFT' 100,'WONK' 1}
.cat p{font:italic 19px Garamond,serif;color:#4a443a;margin:10px 0 0}
.tabs{display:flex;gap:22px;font:500 10.5px Plex,monospace;letter-spacing:.14em;text-transform:uppercase}
.tabs span{padding-bottom:5px}.tabs .on{border-bottom:2px solid}
.tabs sup{font-size:8px;margin-left:4px;opacity:.6}
.tools{display:flex;justify-content:space-between;font:500 10px Plex,monospace;letter-spacing:.12em;text-transform:uppercase;padding:14px 0;border-bottom:1px solid #1d1b18}
.plates{display:grid;grid-template-columns:repeat(4,1fr)}
.plates figure{margin:0;padding:22px 26px 18px;border-right:1px solid #1d1b18;border-bottom:1px solid #1d1b18;position:relative}
.plates figure:nth-child(4n){border-right:0}
.plates figure.on{background:rgba(29,27,24,.045)}
.plates figure.on:after{content:'ESCOLHIDA';position:absolute;top:14px;right:14px;font:500 8.5px Plex,monospace;letter-spacing:.14em;border:1px solid;padding:3px 5px}
.plates figcaption{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:baseline;margin-top:6px}
.plates figcaption span,.plates figcaption small{font:500 9px Plex,monospace;letter-spacing:.12em;text-transform:uppercase;color:#6b6356}
.plates figcaption em{font:italic 19px Garamond,serif}
.colophon{display:flex;justify-content:space-between;padding:26px 0 40px;font:500 9.5px Plex,monospace;letter-spacing:.12em;text-transform:uppercase;color:#4a443a;border-top:3px double #1d1b18;margin-top:40px}
`;
 const body=`<div class="wrap">
<div class="top"><span>Inkmark — oficina de marcas impressas</span><span>Prova nº 0239 · 12.10.2026</span><span>Folha 01 / 01</span></div>
<header class="mast"><h1>Ink<i>mark</i></h1><div><p>Seu nome, impresso como marca. Escolha um clichê, acerte o traço e leve o arquivo para qualquer lugar.</p><nav><a>Catálogo</a><a>Prova</a><a>Exportar</a></nav></div></header>
<div class="grid">
 <section class="proof"><div class="sheet"><i></i>${target.replace('class="target"','class="target l"')}${target.replace('class="target"','class="target r"')}<div class="art ink">${logo(hero,{own:true})}</div></div>
  <div class="bar"><span></span><span style="opacity:.75"></span><span style="opacity:.5"></span><span style="opacity:.25"></span><span style="opacity:.1"></span><b>PRETO 100 · 75 · 50 · 25 · 10</b></div>
  <div class="slug"><span>Clichê <em>Nº ${number(hero)} Arched seal</em></span><span>Tipo <em>Barlow Condensed</em></span><span>Tinta <em>preta, desgaste leve</em></span><span>Papel <em>algodão 300 g</em></span></div></section>
 <aside class="order"><h2>ORDEM DE SERVIÇO</h2><p class="sub">Preencha à mão; a prova ao lado se atualiza.</p>
  <div class="field"><div class="h"><span>01</span>Texto</div>
   <div class="line big"><small>Nome</small><b>Wild Coast<span class="caret"></span></b></div>
   <div class="line"><small>Acima</small><b>PREMIUM QUALITY</b></div>
   <div class="line"><small>Abaixo</small><b>AUTHENTIC GOODS</b></div></div>
  <div class="field"><div class="h"><span>02</span>Tipo</div><ul class="faces">${fontList.map((f,i)=>`<li class="${i===0?'on':''}" style="font-family:'${f}'">${'Wild Coast'}<small>${fontName(f)}</small></li>`).join('')}</ul><div class="more"><span>+ 5 tipos</span><u>Usar fonte própria .ttf</u></div></div>
  <div class="field"><div class="h"><span>03</span>Corpo e entreletra</div><div class="ruler"><i style="left:54%"></i></div><div class="rl"><span>65</span><b>Corpo 100%</b><span>130</span></div><div class="ruler" style="margin-top:10px"><i style="left:20%"></i></div><div class="rl"><span>−2</span><b>Entreletra 0</b><span>+8</span></div></div>
  <div class="field"><div class="h"><span>04</span>Tinta</div><div class="chips">${['Sem','Leve','Médio','Gasto'].map((n,i)=>`<span class="${i===1?'on':''}">${swatch(i)}${n}</span>`).join('')}</div></div>
  <div class="field"><div class="h"><span>05</span>Papel</div><div class="papers"><span class="a">Algodão</span><span class="b">Cartão preto</span></div></div>
  <div class="go"><span>Imprimir arquivos</span><big>→</big></div><div class="fine">SVG vetorial · PNG até 4000 px · clara e escura</div>
 </aside>
</div>
<section class="cat"><header><div><h2>Catálogo de <i>clichês</i></h2><p>${templates.length} composições prontas para receber o seu nome.</p></div><div class="tabs">${['Todos','Lettering','Selos','Emblemas'].map((c,i)=>`<span class="${i?'':'on'}">${c}<sup>${counts[c]}</sup></span>`).join('')}</div></header>
 <div class="tools"><span>☐ Compor com o meu nome</span><span>Baixar prancha ↓</span></div>
 <div class="plates">${gallery.map((id,i)=>`<figure class="${i===0?'on':''}"><div class="ink">${logo(id)}</div><figcaption><span>Nº ${number(id)}</span><em>${byId(id).name}</em><small>${label(byId(id).category)}</small></figcaption></figure>`).join('')}</div></section>
<footer class="colophon"><span>Composto em Fraunces, EB Garamond e IBM Plex Mono</span><span>Impresso no seu navegador · nada sai daqui</span><span>Inkmark ®</span></footer>
</div>`;
 return page('A · Prova de gráfica',css,body);
}

// ── B · Mesa de carimbos ────────────────────────────────────────────────
// Kraft como mesa; a prova é um cartão preso com fita e os controles são uma ficha datilografada.
function stamps(){
 const tape=(style)=>`<i class="tape" style="${style}"></i>`;
 const css=`
body{background:#c3a174 url(/paper/kraft.jpg) 0 0/768px;color:#1d1b18;font-family:Courier,monospace}
.wrap{max-width:1300px;margin:0 auto;padding:0 50px}
header{display:flex;justify-content:space-between;align-items:center;padding:34px 0 10px}
.mark{display:inline-block;transform:rotate(-3deg);color:#a3301f}
.mark svg{display:block;width:250px;height:auto;mix-blend-mode:multiply}
header nav{display:flex;gap:28px;font:700 13px Courier,monospace;letter-spacing:.06em;text-transform:uppercase}
header nav span{border-bottom:2px solid #1d1b18;padding-bottom:2px}
.label{display:inline-block;background:#f6f0e2 url(/paper/algodao.jpg) 0 0/768px;padding:8px 16px 7px;font:13px Elite,monospace;letter-spacing:.08em;box-shadow:0 1px 2px rgba(40,25,5,.35);transform:rotate(-1deg)}
.intro{display:flex;align-items:center;gap:24px;margin:22px 0 34px}
.intro p{font:16px/1.5 Courier,monospace;margin:0;max-width:520px;color:#2b2116}
.desk{display:grid;grid-template-columns:1fr 430px;gap:46px;align-items:start}
.card{position:relative;background:#f4eee0 url(/paper/algodao.jpg) 0 0/768px;padding:40px 60px 30px;transform:rotate(-.8deg);box-shadow:0 1px 1px rgba(40,25,5,.25),0 3px 6px rgba(40,25,5,.18),0 26px 40px -18px rgba(40,25,5,.55)}
.card .ink{max-width:580px;margin:0 auto}
.card .typed{display:flex;justify-content:space-between;border-top:1px dashed #8d8371;padding-top:12px;margin-top:8px;font:13px Elite,monospace;color:#3d352a}
.tape{position:absolute;width:130px;height:34px;background:rgba(236,226,196,.72);box-shadow:0 1px 2px rgba(40,25,5,.15);clip-path:polygon(2% 8%,10% 0,22% 7%,35% 1%,50% 6%,64% 0,78% 6%,90% 1%,100% 9%,98% 92%,88% 100%,74% 94%,60% 100%,45% 93%,30% 100%,16% 94%,4% 100%,0 90%)}
.index{position:relative;background:#fbf8f0;padding:0 26px 34px 54px;transform:rotate(.9deg);box-shadow:0 1px 1px rgba(40,25,5,.25),0 18px 30px -16px rgba(40,25,5,.5);background-image:linear-gradient(90deg,transparent 40px,#e0a29a 40px 41.5px,transparent 41.5px),repeating-linear-gradient(transparent 0 33px,#a9c0d6 33px 34px);background-position:0 0,0 0}
.index>*{margin-top:0;margin-bottom:0}
.index h2{font:700 15px Courier,monospace;letter-spacing:.08em;margin:0;text-transform:uppercase;line-height:68px;height:68px;padding-top:8px}
.row{display:flex;gap:10px;align-items:baseline;line-height:34px;height:34px;font-size:15px;padding-top:4px}
.row small{font:12px Courier,monospace;text-transform:uppercase;color:#5d544a;width:96px;flex-shrink:0}
.row b{font:700 17px Courier,monospace}
.row .u{flex:1}
.faces{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
.faces span{line-height:34px;height:34px;padding-top:3px;font-size:21px;white-space:nowrap;overflow:hidden}
.faces span:before{content:'[ ] ';font:15px Courier,monospace}
.faces span.on:before{content:'[x] ';font-weight:700}
.pad{display:flex;justify-content:space-between;height:102px;padding-top:8px}
.pad div{text-align:center;font:12px Courier,monospace;text-transform:uppercase}
.pad svg{display:block;width:58px;height:58px;margin:0 auto 6px;mix-blend-mode:multiply}
.pad .on{font-weight:700;text-decoration:underline;text-underline-offset:4px}
.paperpick{display:flex;gap:14px;height:68px;padding-top:7px}
.paperpick span{width:84px;height:54px;box-shadow:0 1px 2px rgba(0,0,0,.3);display:flex;align-items:flex-end;padding:5px 7px;font:11px Courier,monospace;text-transform:uppercase}
.paperpick .c{background:#f4eee0 url(/paper/algodao.jpg) 0 0/768px;outline:2px solid #1d1b18;outline-offset:3px}
.paperpick .k{background:#23211e url(/paper/preto.jpg) 0 0/768px;color:#eee}
.stampbtn{display:inline-flex;align-items:center;gap:12px;margin-top:24px!important;transform:rotate(-2deg);color:#a3301f;border:3px solid #a3301f;outline:1.5px solid #a3301f;outline-offset:3px;padding:10px 20px 8px;font:700 22px Courier,monospace;letter-spacing:.12em;mix-blend-mode:multiply}
.drawer{margin:76px 0 0}
.drawer .head{display:flex;justify-content:space-between;align-items:center;margin-bottom:30px}
.drawer .tabs{display:flex;gap:10px}
.drawer .tabs span{background:#e9dfc8;padding:8px 14px 6px;font:13px Elite,monospace;box-shadow:0 1px 2px rgba(40,25,5,.3)}
.drawer .tabs span.on{background:#1d1b18;color:#f4eee0}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:34px 30px}
.cards figure{margin:0;position:relative;background:#f4eee0 url(/paper/algodao.jpg) 0 0/768px;padding:16px 18px 10px;box-shadow:0 1px 1px rgba(40,25,5,.25),0 12px 20px -12px rgba(40,25,5,.55)}
.cards figure:nth-child(3n+1){transform:rotate(-1.1deg)}.cards figure:nth-child(3n+2){transform:rotate(.7deg)}.cards figure:nth-child(4n){transform:rotate(-.4deg)}
.cards figure.dark{background:#23211e url(/paper/preto.jpg) 0 0/768px;color:#e8e1d2}
.cards figcaption{display:flex;justify-content:space-between;border-top:1px dashed #9a9080;padding-top:8px;font:12.5px Elite,monospace}
.cards figure.dark figcaption{border-color:#5a554c}
.cards .chosen{position:absolute;top:10px;right:-10px;transform:rotate(8deg);color:#a3301f;border:2px solid #a3301f;padding:3px 8px 1px;font:700 12px Courier,monospace;letter-spacing:.1em;mix-blend-mode:multiply}
footer{margin:60px 0 0;padding:20px 0 40px;display:flex;justify-content:space-between;font:13px Elite,monospace;color:#2b2116}
`;
 const markSvg=`<svg viewBox="0 0 500 130"><defs>${wearFilter(2,19).replace(/width="600" height="500"/,'width="500" height="130"')}</defs><g fill="currentColor" filter="url(#ink-wear-2-19)"><rect x="6" y="6" width="488" height="118" rx="8" fill="none" stroke="currentColor" stroke-width="7"/><rect x="20" y="20" width="460" height="90" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><text x="250" y="92" text-anchor="middle" font-family="AlfaSlabOne" font-size="66" letter-spacing="5">INKMARK</text></g></svg>`;
 const body=`<div class="wrap">
<header><span class="mark">${markSvg}</span><nav><span>Carimbar</span><span>Gaveta</span><span>Levar</span></nav></header>
<div class="intro"><span class="label">MARCAS DE TINTA, FEITAS À MÃO DIGITAL</span><p>Escolha um carimbo, troque o nome, ajuste a pressão da tinta. A prova sai na hora, no papel que você quiser.</p></div>
<div class="desk">
 <div class="card">${tape('top:-14px;left:40px;transform:rotate(-6deg)')}${tape('top:-12px;right:46px;transform:rotate(5deg)')}<div class="ink">${logo(hero,{own:true})}</div><div class="typed"><span>Nº ${number(hero)} — ARCHED SEAL</span><span>WILD COAST</span><span>12/10/2026</span></div></div>
 <div class="index"><h2>Ficha do carimbo</h2>
  <div class="row"><small>Nome</small><span class="u"><b>Wild Coast_</b></span></div>
  <div class="row"><small>Em cima</small><span class="u">PREMIUM QUALITY</span></div>
  <div class="row"><small>Embaixo</small><span class="u">AUTHENTIC GOODS</span></div>
  <div class="row"><small>Letra</small></div>
  <div class="faces">${fontList.map((f,i)=>`<span class="${i===0?'on':''}" style="font-family:'${f}'">Wild Coast</span>`).join('')}</div>
  <div class="row"><small>Tamanho</small><span>— 100% +</span><small style="width:auto;margin-left:auto">Espaço</small><span>— 0 +</span></div>
  <div class="row"><small>Pressão</small></div>
  <div class="pad">${['Firme','Leve','Média','Gasta'].map((n,i)=>`<div class="${i===1?'on':''}">${swatch(i)}${n}</div>`).join('')}</div>
  <div class="row"><small>Papel</small></div>
  <div class="paperpick"><span class="c">Creme</span><span class="k">Preto</span></div>
  <span class="stampbtn">EXPORTAR ↗</span>
 </div>
</div>
<section class="drawer"><div class="head"><span class="label" style="font-size:15px">GAVETA Nº 2 — ${templates.length} CARIMBOS</span><div class="tabs">${['Todos','Lettering','Selos','Emblemas'].map((c,i)=>`<span class="${i?'':'on'}">${c} ${counts[c]}</span>`).join('')}</div></div>
<div class="cards">${gallery.map((id,i)=>`<figure class="${i===5||i===10?'dark':''}">${i===0?'<span class="chosen">ESCOLHIDO</span>':''}<div class="ink ${i===5||i===10?'white':''}">${logo(id,{variant:i===5||i===10?'dark':'light'})}</div><figcaption><span>Nº ${number(id)}</span><span>${byId(id).name}</span></figcaption></figure>`).join('')}</div></section>
<footer><span>INKMARK — tinta, papel e o seu nome.</span><span>Tudo acontece no seu navegador.</span></footer>
</div>`;
 return page('B · Mesa de carimbos',css,body);
}

// ── C · Edição de jornal ────────────────────────────────────────────────
// O site é a primeira página de um jornal: a logo é a foto de capa e o catálogo são os classificados.
function newspaper(){
 const css=`
body{background:#e3e0d6 url(/paper/jornal.jpg) 0 0/768px;color:#1a1918;font-family:OldStandard,serif}
.wrap{max-width:1300px;margin:0 auto;padding:0 44px}
.ears{display:grid;grid-template-columns:220px 1fr 220px;align-items:center;padding:26px 0 8px}
.ear{border:1px solid #1a1918;padding:9px 12px;font:12px/1.35 OldStandard,serif;text-align:center}
.ear b{display:block;font:700 11px OldStandard,serif;letter-spacing:.14em;text-transform:uppercase;margin-bottom:3px}
.title{text-align:center;font:118px/1 PirataOne,serif;letter-spacing:.01em;margin:0}
.dateline{display:flex;justify-content:space-between;border-top:1px solid;border-bottom:4px double;padding:6px 2px 5px;font:700 11px OldStandard,serif;letter-spacing:.16em;text-transform:uppercase}
.headline{text-align:center;padding:24px 0 18px;border-bottom:1px solid}
.headline h2{font:700 64px/1 OldStandard,serif;letter-spacing:-.01em;margin:0}
.headline p{font:italic 21px OldStandard,serif;margin:10px 0 0;color:#36332d}
.front{display:grid;grid-template-columns:270px 1fr 270px}
.col{padding:20px 22px 26px}
.col+.col{border-left:1px solid}
.kicker{font:700 11px OldStandard,serif;letter-spacing:.18em;text-transform:uppercase;border-bottom:1px solid;padding-bottom:5px;margin:0 0 10px}
.col h3{font:700 23px/1.1 OldStandard,serif;margin:0 0 8px}
.col p{font:15px/1.45 OldStandard,serif;margin:0 0 12px;text-align:justify;hyphens:auto}
.form p.drop:first-letter{float:left;font:700 50px/0.8 OldStandard,serif;margin:6px 6px 0 0}
.form .f{display:flex;align-items:baseline;gap:6px;font:14px OldStandard,serif;margin:0 0 9px;white-space:nowrap}
.form .f span{flex:1;border-bottom:1px dotted #1a1918;transform:translateY(-4px)}
.form .f b{font-weight:700;font-size:12.5px;letter-spacing:.06em}
.form .f.name b{font:italic 700 22px OldStandard,serif}
.faces{border-top:1px solid;border-bottom:1px solid;margin:12px 0;padding:6px 0}
.faces div{display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;font-size:21px}
.faces div small{font:11px OldStandard,serif;letter-spacing:.08em;text-transform:uppercase}
.faces div.on{background:#1a1918;color:#e3e0d6;padding:3px 6px;margin:0 -6px}
.slider{display:flex;align-items:center;gap:8px;font:12px OldStandard,serif;letter-spacing:.06em;text-transform:uppercase;margin:6px 0}
.slider i{flex:1;height:1px;background:#1a1918;position:relative}
.slider i:after{content:'';position:absolute;left:var(--v);top:-5px;width:11px;height:11px;border-radius:50%;background:#1a1918;margin-left:-5px}
.lead{padding:20px 26px}
.photo{border:1px solid #1a1918;padding:30px 40px 18px;position:relative}
.photo .ink{max-width:560px;margin:0 auto}
.caption{font:italic 14px OldStandard,serif;margin:8px 0 0;display:flex;justify-content:space-between}
.caption b{font-style:normal;font-weight:700;letter-spacing:.1em;font-size:11px;text-transform:uppercase}
.box{border:1px solid;padding:12px 14px;margin:0 0 14px}
.box.double{border:4px double}
.toggle{display:flex;border:1px solid}
.toggle span{flex:1;text-align:center;padding:7px 0 5px;font:700 11px OldStandard,serif;letter-spacing:.14em;text-transform:uppercase}
.toggle .on{background:#1a1918;color:#e3e0d6}
.wear{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;font:11px OldStandard,serif;letter-spacing:.08em;text-transform:uppercase}
.wear svg{display:block;width:44px;height:44px;margin:0 auto 4px;mix-blend-mode:multiply}
.wear .on{text-decoration:underline;font-weight:700;text-underline-offset:3px}
.ad{text-align:center}
.ad small{font:700 10px OldStandard,serif;letter-spacing:.24em}
.ad h4{font:52px/0.95 PirataOne,serif;margin:6px 0 8px}
.ad p{font:italic 14px/1.4 OldStandard,serif;text-align:center;margin:0 0 12px}
.ad .btn{display:block;background:#1a1918;color:#e3e0d6;padding:10px;font:700 12px OldStandard,serif;letter-spacing:.2em;text-transform:uppercase}
.classified{margin-top:30px}
.band{display:flex;justify-content:space-between;align-items:center;background:#1a1918;color:#e3e0d6;padding:8px 14px;font:700 13px OldStandard,serif;letter-spacing:.24em;text-transform:uppercase}
.band .t{font:30px PirataOne,serif;letter-spacing:.02em;text-transform:none}
.band nav{display:flex;gap:20px;font-size:11px}
.band nav .on{text-decoration:underline;text-underline-offset:4px}
.ads{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:4px double}
.ads figure{margin:0;padding:16px 18px 14px;border-right:1px solid;border-top:1px solid}
.ads figure:nth-child(4n){border-right:0}
.ads figure:nth-child(-n+4){border-top:0}
.ads h5{font:700 15px OldStandard,serif;letter-spacing:.12em;text-transform:uppercase;margin:4px 0 2px}
.ads h5 small{display:block;font:italic 400 12px OldStandard,serif;letter-spacing:.02em;text-transform:none;margin-top:1px}
.ads p{font:13.5px/1.35 OldStandard,serif;margin:0;color:#36332d}
.folio{display:flex;justify-content:space-between;font:11px OldStandard,serif;letter-spacing:.16em;text-transform:uppercase;padding:12px 0 40px}
`;
 const body=`<div class="wrap">
<div class="ears"><div class="ear"><b>Nesta edição</b>${templates.length} composições, ${fonts.length} tipos e quatro graus de tinta</div><h1 class="title">The Inkmark</h1><div class="ear"><b>Preço do exemplar</b>Grátis. Impresso no seu navegador, sem cadastro</div></div>
<div class="dateline"><span>Ano I · Nº ${templates.length}</span><span>Segunda-feira, 12 de outubro de 2026</span><span>Edição clara</span></div>
<div class="headline"><h2>Sua marca, impressa hoje.</h2><p>Escreva o nome, escolha a composição e leve o arquivo em SVG ou PNG.</p></div>
<div class="front">
 <div class="col form"><div class="kicker">A redação</div>
  <div class="f name">Nome <span></span><b>Wild Coast</b></div>
  <div class="f">Acima <span></span><b>PREMIUM QUALITY</b></div>
  <div class="f">Abaixo <span></span><b>AUTHENTIC GOODS</b></div>
  <div class="kicker" style="margin-top:20px">Os tipos</div>
  <div class="faces">${fontList.slice(0,5).map((f,i)=>`<div class="${i===0?'on':''}"><span style="font-family:'${f}'">Wild Coast</span><small>${fontName(f)}</small></div>`).join('')}</div>
  <div class="slider">Corpo <i style="--v:54%"></i> 100%</div>
  <div class="slider">Entreletra <i style="--v:20%"></i> 0</div>
  <p class="drop" style="font-size:13px;margin-top:14px"><i>Tem fonte própria?</i> Envie um arquivo .ttf ou .otf e a composição passa a usá-la.</p>
 </div>
 <div class="lead"><div class="photo"><div class="ink">${logo(hero,{own:true})}</div></div><div class="caption"><span>Na foto: a marca Wild Coast em composição Arched seal, com desgaste leve.</span><b>Prova ao vivo</b></div></div>
 <div class="col"><div class="kicker">Edição</div><div class="box"><div class="toggle"><span class="on">Clara</span><span>Noturna</span></div></div>
  <div class="kicker">Tinta</div><div class="box"><div class="wear">${['Sem','Leve','Médio','Gasto'].map((n,i)=>`<div class="${i===1?'on':''}">${swatch(i,'#1a1918')}${n}</div>`).join('')}</div></div>
  <div class="box double ad"><small>— ANÚNCIO —</small><h4>Leve sua marca</h4><p>SVG vetorial e PNG em alta,<br>nas versões clara e escura.</p><span class="btn">Exportar agora</span></div>
 </div>
</div>
<section class="classified"><div class="band"><span class="t">Classificados</span><nav>${['Todos','Lettering','Selos','Emblemas'].map((c,i)=>`<span class="${i?'':'on'}">${c} (${counts[c]})</span>`).join('')}</nav><span>Baixar prancha</span></div>
<div class="ads">${gallery.map(id=>{const t=byId(id);return `<figure><div class="ink">${logo(id)}</div><h5>${t.name}<small>${label(t.category)} · nº ${number(id)}</small></h5><p>${t.desc??''}</p></figure>`;}).join('')}</div></section>
<div class="folio"><span>The Inkmark · página 1</span><span>Tudo nesta edição é seu para usar</span><span>Continua na página 2: mais ${templates.length-gallery.length} composições</span></div>
</div>`;
 return page('C · Edição de jornal',css,body);
}

// ── D · Ateliê ──────────────────────────────────────────────────────────
// Folha grande e silenciosa: a marca no centro, uma única barra de ofício e o catálogo como índice.
// O seletor de papel troca a folha inteira (vergé claro ou cartão preto).
function atelier(dark=false){
 const ink=dark?'#ece5d6':'#1d1b18',paper=dark?'#23211e':'#f3eee2',tex=dark?'preto':'verge',soft=dark?'#a39b8c':'#6f675a',rule=dark?'#5b564d':'#1d1b18';
 const v=dark?'dark':'light';
 const css=`
body{background:${paper} url(/paper/${tex}.jpg) 0 0/768px;color:${ink};font-family:Garamond,serif}
.wrap{max-width:1240px;margin:0 auto;padding:0 60px}
header{display:flex;justify-content:space-between;align-items:baseline;padding:34px 0}
.logo{font:italic 400 30px Fraunces,serif;letter-spacing:-.02em;font-variation-settings:'opsz' 72,'SOFT' 100,'WONK' 1}
.logo:before{content:'';display:inline-block;width:9px;height:9px;border-radius:50%;background:${ink};margin-right:10px;vertical-align:4px}
header nav{display:flex;gap:34px;font:500 11px Plex,monospace;letter-spacing:.2em;text-transform:uppercase}
header nav span:last-child{border-bottom:1px solid}
.stage{text-align:center;padding:30px 0 10px}
.stage .cap{font:italic 17px Garamond,serif;color:${soft}}
.stage .ink{width:640px;margin:16px auto 0}
.bench{display:grid;grid-template-columns:1.35fr 1.7fr 1fr 1.2fr .8fr auto;border-top:1px solid ${rule};border-bottom:1px solid ${rule};margin-top:26px}
.bench>div{padding:16px 22px 18px;border-left:1px solid ${rule}}
.bench>div:first-child{border-left:0;padding-left:0}
.bench small{display:block;font:500 9.5px Plex,monospace;letter-spacing:.18em;text-transform:uppercase;color:${soft};margin-bottom:8px}
.bench .name{font:italic 30px/1 Fraunces,serif;font-variation-settings:'opsz' 72,'SOFT' 100}
.bench .name:after{content:'';display:inline-block;width:1px;height:26px;background:${ink};margin-left:3px;vertical-align:-4px}
.bench .face{font:25px/1 BarlowCondensed,sans-serif;display:flex;justify-content:space-between;align-items:center;white-space:nowrap;gap:12px}
.bench .face span{font:13px Garamond,serif;color:${soft}}
.bench .rng{display:flex;align-items:center;gap:10px;font:500 12px Plex,monospace}
.bench .rng i{flex:1;height:1px;background:${ink};position:relative}
.bench .rng i:after{content:'';position:absolute;left:50%;top:-6px;width:1px;height:13px;background:${ink}}
.dots{display:flex;gap:8px}
.dots svg{width:26px;height:26px;display:block}
.dots .on{outline:1px solid ${ink};outline-offset:3px;border-radius:50%}
.sheets{display:flex;gap:8px}
.sheets span{width:30px;height:24px;border:1px solid ${rule}}
.sheets .l{background:#f3eee2 url(/paper/verge.jpg) 0 0/768px}
.sheets .d{background:#23211e url(/paper/preto.jpg) 0 0/768px}
.sheets .on{outline:1px solid ${ink};outline-offset:3px}
.export{display:flex;align-items:center;padding:0 0 0 26px!important}
.export span{background:${ink};color:${paper};padding:14px 22px;font:500 11px Plex,monospace;letter-spacing:.2em;text-transform:uppercase;white-space:nowrap}
.finer{display:flex;justify-content:space-between;font:italic 15px Garamond,serif;color:${soft};padding:12px 0 0}
.index{padding:110px 0 30px}
.index header{display:block;text-align:center;padding:0 0 40px}
.index h2{font:300 76px/1 Fraunces,serif;letter-spacing:-.035em;margin:0;font-variation-settings:'opsz' 144,'SOFT' 100}
.index h2 i{font-variation-settings:'opsz' 144,'SOFT' 100,'WONK' 1}
.index p{font:italic 19px Garamond,serif;color:${soft};margin:14px 0 26px}
.filters{display:flex;justify-content:center;gap:34px;font:500 10.5px Plex,monospace;letter-spacing:.2em;text-transform:uppercase}
.filters .on{border-bottom:1px solid}
.filters sup{opacity:.55;margin-left:4px;font-size:8px}
.leaves{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 70px}
.leaves figure{margin:0;text-align:center}
.leaves figure .ink{padding:0 10px}
.leaves figcaption{font:italic 19px Garamond,serif;margin-top:2px}
.leaves figcaption small{display:block;font:500 9.5px Plex,monospace;font-style:normal;letter-spacing:.2em;color:${soft};margin-top:5px}
.leaves figure.on figcaption{text-decoration:underline;text-underline-offset:5px}
footer{display:flex;justify-content:space-between;border-top:1px solid ${rule};margin-top:40px;padding:20px 0 44px;font:500 10px Plex,monospace;letter-spacing:.18em;text-transform:uppercase;color:${soft}}
`;
 const body=`<div class="wrap">
<header><span class="logo">inkmark</span><nav><span>Índice</span><span>Papel</span><span>Exportar</span></nav></header>
<section class="stage"><div class="cap">Prova viva: tudo o que você muda aparece aqui, já impresso.</div><div class="ink ${dark?'white':''}">${logo(hero,{own:true,variant:v})}</div></section>
<div class="bench">
 <div><small>Nome da marca</small><div class="name">Wild Coast</div></div>
 <div><small>Tipo</small><div class="face">Barlow Condensed <span>11 opções ▾</span></div></div>
 <div><small>Corpo</small><div class="rng">65 <i></i> 130</div></div>
 <div><small>Tinta</small><div class="dots">${[0,1,2,3].map(i=>`<span class="${i===1?'on':''}">${swatch(i,ink)}</span>`).join('')}</div></div>
 <div><small>Papel</small><div class="sheets"><span class="l ${dark?'':'on'}"></span><span class="d ${dark?'on':''}"></span></div></div>
 <div class="export"><span>Exportar →</span></div>
</div>
<div class="finer"><span>Ajustes finos: linhas de cima e de baixo, entreletra, ornamento, fonte própria ▾</span><span>${dark?'Cartão preto, tinta branca':'Papel vergé, tinta preta'}</span></div>
<section class="index"><header><h2>Escolha uma <i>composição</i></h2><p>${templates.length} folhas, cada uma pronta para o seu nome.</p><div class="filters">${['Todos','Lettering','Selos','Emblemas'].map((c,i)=>`<span class="${i?'':'on'}">${c}<sup>${counts[c]}</sup></span>`).join('')}</div></header>
<div class="leaves">${gallery.slice(0,9).map((id,i)=>`<figure class="${i===0?'on':''}"><div class="ink ${dark?'white':''}">${logo(id,{own:true,variant:v})}</div><figcaption>${byId(id).name}<small>— ${number(id)} —</small></figcaption></figure>`).join('')}</div></section>
<footer><span>Inkmark</span><span>Composto em Fraunces e EB Garamond</span><span>Página 1 de 27</span></footer>
</div>`;
 return page(`D · Ateliê${dark?' (cartão preto)':''}`,css,body);
}

const pages={'a-prova-de-grafica':proof(),'b-mesa-de-carimbos':stamps(),'c-edicao-de-jornal':newspaper(),'d-atelie':atelier(),'d-atelie-escuro':atelier(true)};
for(const [name,html] of Object.entries(pages))writeFileSync(new URL(`${name}.html`,out),html);
console.log('Apresentações geradas:',Object.keys(pages).join(', '));
