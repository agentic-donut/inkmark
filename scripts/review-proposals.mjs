import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {Resvg} from '@resvg/resvg-js';
import {fonts,templates,registerFont} from '../src/lib/domain/logo/engine.js';
import {badgeTemplates as proposals,renderBadge as renderProposal} from '../src/lib/domain/logo/badges.js';
for(const f of fonts){const b=readFileSync(new URL(`../static/fonts/${f.id}.ttf`,import.meta.url));registerFont(f.id,b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
const output=new URL('../docs/review/propostas/',import.meta.url);mkdirSync(output,{recursive:true});
function save(name,svg){writeFileSync(new URL(`${name}.svg`,output),svg);writeFileSync(new URL(`${name}.png`,output),new Resvg(svg).render().asPng());}
function sheet(artworks,labels,{variant='light',cols=2,heading=''}={}){
 const cw=600,ch=535,offset=heading?55:0,w=cw*cols,h=Math.ceil(artworks.length/cols)*ch+offset,bg=variant==='dark'?'#191a18':'white',fg=variant==='dark'?'#bbb':'#666';
 const cells=artworks.map((svg,i)=>`<g transform="translate(${i%cols*cw},${offset+Math.floor(i/cols)*ch})">${svg.replace('width="1200" height="1000"','x="15" y="0" width="570" height="475"')}<text x="300" y="510" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${fg}">${labels[i]}</text></g>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/>${heading?`<text x="24" y="35" font-family="sans-serif" font-size="21" fill="${fg}">${heading}</text>`:''}${cells}</svg>`;
}
for(const variant of ['light','dark'])save(variant,sheet(proposals.map(p=>renderProposal(p.id,{},variant)),proposals.map(p=>p.name),{variant,heading:'MODELOS APROVADOS · RODADA 2'}));
save('mesma-marca',sheet(proposals.map(p=>renderProposal(p.id,{name:'NORTH CLUB',topline:'PREMIUM QUALITY',tagline:'EST. 2026'})),proposals.map(p=>p.name),{heading:'MESMA MARCA · NORTH CLUB'}));
const before=proposals.map(p=>readFileSync(new URL(`archive/rodada-1/${p.id}-before.svg`,output),'utf8'));
const after=proposals.map(p=>renderProposal(p.id));
save('comparacao',sheet([...before,...after],[...proposals.map(p=>p.name+' · anterior'),...proposals.map(p=>p.name+' · refinada')],{heading:'COMPARAÇÃO · ANTERIOR E REFINADA'}));
const individual=new URL('logos/',output);mkdirSync(individual,{recursive:true});
for(const p of proposals)for(const variant of ['light','dark']){
 const svg=renderProposal(p.id,{},variant);writeFileSync(new URL(`${p.id}-${variant}.svg`,individual),svg);writeFileSync(new URL(`${p.id}-${variant}.png`,individual),new Resvg(svg).render().asPng());
}
let total=0;
for(const p of proposals)for(const name of [p.sample,'Solo','Café da Vila','Companhia de Aventuras Brasileiras'])for(const variant of ['light','dark']){
 const svg=renderProposal(p.id,{name},variant,false),raster=new Resvg(svg,{fitTo:{mode:'width',value:600}}).render(),pixels=raster.pixels;
 let minX=600,minY=500,maxX=0,maxY=0;
 for(let y=0;y<500;y++)for(let x=0;x<600;x++)if(pixels[(y*600+x)*4+3]){minX=Math.min(x,minX);minY=Math.min(y,minY);maxX=Math.max(x,maxX);maxY=Math.max(y,maxY);}
 if(minX<12||minY<12||maxX>588||maxY>488)throw new Error(`Fora da área segura: ${p.id}, ${name}: ${minX},${minY},${maxX},${maxY}`);
 if(/NaN|Infinity|<text/.test(svg))throw new Error(`SVG inválido: ${p.id}`);
 total++;
}
if(templates.length!==5)throw new Error('A biblioteca aprovada foi alterada.');
console.log(`${total} renderizações dos novos emblemas verificadas. Base original preservada: ${templates.length} modelos.`);
