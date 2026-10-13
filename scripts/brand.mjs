// Marca do Inkmark: node scripts/brand.mjs
// Gera a logo completa (modelo Blackletter, Pirata One, o gótico do título do site) nas versões
// clara e escura, e o ícone do favicon e dos atalhos.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import opentype from 'opentype.js';
import {Resvg} from '@resvg/resvg-js';
import {fonts,registerFont,renderLogo} from '../src/lib/domain/logo/registry.js';

// Versão no endereço do favicon em src/app.html: muda quando o desenho muda, para furar o cache do navegador.
const ICON_VERSION='round-plate-ink';
const INK='#1a1918',PAPER='#e3e0d6',NIGHT_INK='#ece5d6';
const fontFile=id=>readFileSync(new URL(`../static/fonts/${id}.ttf`,import.meta.url));
for(const f of fonts){const b=fontFile(f.id);registerFont(f.id,b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
const out=new URL('../static/',import.meta.url);
mkdirSync(new URL('brand/',out),{recursive:true});

// Logo completa: o próprio modelo do catálogo, então a marca é uma peça feita no app.
// Versão clara (tinta preta) e escura (tinta branca), as duas com fundo transparente: o README
// mostra uma ou outra conforme o tema do GitHub (<picture> com prefers-color-scheme).
const brand={template:'gothic',font:'PirataOne',ornament:'stars',name:'Inkmark',topline:'EST. 2026',tagline:'MARCAS IMPRESSAS'};
// O motor desenha num quadro de 600×500 com folga; a marca é recortada no contorno da arte.
function cropped(svg,padding=12){
 const box=new Resvg(svg).getBBox();
 if(!box)return svg;
 const view=[box.x-padding,box.y-padding,box.width+2*padding,box.height+2*padding].map((n)=>+n.toFixed(2));
 return svg.replace(/width="1200" height="1000" viewBox="0 0 600 500"/,`width="${view[2]*2}" height="${view[3]*2}" viewBox="${view.join(' ')}"`);
}
for(const variant of ['light','dark']){
 const svg=cropped(renderLogo(brand,variant,false));
 const name=`brand/inkmark${variant==='dark'?'-escura':''}`;
 writeFileSync(new URL(`${name}.svg`,out),svg);
 writeFileSync(new URL(`${name}.png`,out),new Resvg(svg,{fitTo:{mode:'width',value:1200}}).render().asPng());
}

// ── Ícones ──────────────────────────────────────────────────────────────
// O desenho, num quadro de 64×64, tem `ink` (o que é tinta), `cut` (o que sai vazado da tinta)
// e `over` (tinta desenhada por cima do vazado, como o texto dentro de uma faixa).
const fontCache=new Map();
const face=id=>{if(!fontCache.has(id))fontCache.set(id,opentype.parse(fontFile(id).buffer.slice(0)));return fontCache.get(id);};
function centeredText(text,cx,cy,height,fontId='PirataOne'){
 const path=face(fontId).getPath(text,0,0,100),box=path.getBoundingBox(),scale=height/(box.y2-box.y1),width=(box.x2-box.x1)*scale;
 return `<path transform="translate(${(cx-width/2-box.x1*scale).toFixed(2)} ${(cy-(box.y1+box.y2)/2*scale).toFixed(2)}) scale(${scale.toFixed(4)})" d="${path.toPathData(2)}"/>`;
}
// Ícone: como o modelo Round plate (anel, disco central e faixa chanfrada atravessando, com "INK").
const design={
 label:'Round plate com "INK" na faixa',
 ink:'<circle cx="32" cy="32" r="29.5" fill="none" stroke="currentColor" stroke-width="3.6"/><circle cx="32" cy="32" r="19"/>',
 cut:'<path d="M1 32 8 17H56L63 32 56 47H8Z"/>',
 over:'<path d="M4.5 32 10 20H54L59.5 32 54 44H10Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>'+centeredText('INK',32,32,15,'BarlowCondensed')
};

// No tema escuro do navegador a tinta vira creme, senão o ícone some na aba escura.
function icon({dark=true}={}){
 const style=`.ink{fill:${INK};color:${INK}}`+(dark?`@media (prefers-color-scheme:dark){.ink{fill:${NIGHT_INK};color:${NIGHT_INK}}}`:'');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>${style}</style>`+
  `<mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/><g fill="#000">${design.cut}</g></mask>`+
  `<g class="ink"><g mask="url(#cut)">${design.ink}</g>${design.over??''}</g></svg>`;
}
const png=(svg,size)=>new Resvg(svg,{fitTo:{mode:'width',value:size}}).render().asPng();
// iOS e Android pedem ícone opaco: o desenho em tinta sobre o papel, com respiro nas bordas.
const touchIcon=()=>icon({dark:false}).replace('<g class="ink"',`<rect width="64" height="64" fill="${PAPER}"/><g transform="translate(6.4 6.4) scale(.8)"><g class="ink"`).replace('</svg>','</g></svg>');

writeFileSync(new URL('favicon.svg',out),icon());
writeFileSync(new URL('favicon-32.png',out),png(icon({dark:false}),32));
writeFileSync(new URL('apple-touch-icon.png',out),png(touchIcon(),180));
writeFileSync(new URL('icon-512.png',out),png(touchIcon(),512));

// O navegador guarda o favicon em cache com força: a versão no endereço obriga a buscar o novo.
const appHtml=new URL('../src/app.html',import.meta.url);
writeFileSync(appHtml,readFileSync(appHtml,'utf8').replace(/(\/(?:favicon\.svg|favicon-32\.png|apple-touch-icon\.png))(\?v=[\w-]+)?"/g,`$1?v=${ICON_VERSION}"`));

// Prancha de conferência: abas clara e escura e os tamanhos reais de uso.
const sheet=(()=>{
 // Num SVG só, os <style> valeriam para todos os ícones: a prancha pinta cada um direto no grupo.
 const inner=(svg,fill)=>svg.replace(/^<svg[^>]*>/,'').replace('</svg>','').replace(/<style>.*?<\/style>/,'').replace('<g class="ink"',`<g fill="${fill}" color="${fill}"`);
 const at=(svg,x,y,size,id,fill=INK)=>`<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 64 64">${inner(svg,fill).replaceAll('id="cut"',`id="${id}"`).replace('url(#cut)',`url(#${id})`)}</svg>`;
 const light=icon({dark:false});
 const tab=(x,y,bg,fg,fill,id)=>`<rect x="${x}" y="${y}" width="250" height="36" rx="8" fill="${bg}"/>${at(light,x+12,y+10,16,id,fill)}<text x="${x+38}" y="${y+23}" font-family="sans-serif" font-size="13" fill="${fg}">Inkmark</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300"><rect width="900" height="150" fill="#f1f3f4"/><rect y="150" width="900" height="150" fill="#202124"/>`+
  tab(20,20,'#fff','#333',INK,'a')+tab(20,170,'#35363a','#ddd',NIGHT_INK,'b')+
  at(light,300,30,32,'c')+at(light,350,14,64,'d')+at(light,300,180,32,'e',NIGHT_INK)+at(light,350,164,64,'f',NIGHT_INK)+
  `<rect x="440" y="10" width="130" height="130" rx="28" fill="${PAPER}"/>${at(touchIcon(),440,10,130,'g')}`+
  `<text x="600" y="80" font-family="sans-serif" font-size="15" fill="#555">${design.label}</text></svg>`;
})();
mkdirSync(new URL('../docs/review/favicon/',import.meta.url),{recursive:true});
writeFileSync(new URL(`../docs/review/favicon/${ICON_VERSION}.png`,import.meta.url),new Resvg(sheet).render().asPng());
console.log(`Ícone aplicado (static/favicon.svg, favicon-32.png, apple-touch-icon.png, icon-512.png). Prancha: docs/review/favicon/${ICON_VERSION}.png`);
