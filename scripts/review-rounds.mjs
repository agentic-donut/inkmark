// Pranchas das rodadas de propostas: node scripts/review-rounds.mjs [3|4|5|6|7]
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {Resvg} from '@resvg/resvg-js';
import {fonts,registerFont} from '../src/lib/domain/logo/engine.js';
import {proposalTemplates,renderProposal as render3} from '../src/lib/domain/logo/proposals.js';
import {round4Templates,renderRound4} from '../src/lib/domain/logo/proposals4.js';
import {round5Templates,renderRound5} from '../src/lib/domain/logo/proposals5.js';
import {round6Templates,renderRound6} from '../src/lib/domain/logo/proposals6.js';
import {round7Templates,renderRound7} from '../src/lib/domain/logo/proposals7.js';
const round=process.argv[2]??'6';
const [proposals,renderProposal]={3:[proposalTemplates,render3],4:[round4Templates,renderRound4],5:[round5Templates,renderRound5],6:[round6Templates,renderRound6],7:[round7Templates,renderRound7]}[round];
for(const f of fonts){const b=readFileSync(new URL(`../static/fonts/${f.id}.ttf`,import.meta.url));registerFont(f.id,b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
const output=new URL(`../docs/review/propostas/rodada-${round}/`,import.meta.url);mkdirSync(output,{recursive:true});
function save(name,svg){writeFileSync(new URL(`${name}.svg`,output),svg);writeFileSync(new URL(`${name}.png`,output),new Resvg(svg).render().asPng());}
function sheet(artworks,labels,{variant='light',cols=5,heading=''}={}){
 const cw=600,ch=535,offset=heading?55:0,w=cw*cols,h=Math.ceil(artworks.length/cols)*ch+offset,bg=variant==='dark'?'#191a18':'white',fg=variant==='dark'?'#bbb':'#666';
 const cells=artworks.map((svg,i)=>`<g transform="translate(${i%cols*cw},${offset+Math.floor(i/cols)*ch})">${svg.replace('width="1200" height="1000"','x="15" y="0" width="570" height="475"')}<text x="300" y="510" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${fg}">${labels[i]}</text></g>`).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${bg}"/>${heading?`<text x="24" y="35" font-family="sans-serif" font-size="21" fill="${fg}">${heading}</text>`:''}${cells}</svg>`;
}
const labels=proposals.map((p,i)=>`${String(i+1).padStart(2,'0')} · ${p.name}`);
for(const variant of ['light','dark'])save(variant,sheet(proposals.map(p=>renderProposal(p.id,{},variant)),labels,{variant,heading:`PROPOSTAS · RODADA ${round}`}));
save('mesma-marca',sheet(proposals.map(p=>renderProposal(p.id,{name:'NORTH CLUB',topline:'PREMIUM QUALITY',tagline:'EST. 2026'})),labels,{heading:'MESMA MARCA · NORTH CLUB'}));
save('nomes',sheet(proposals.flatMap(p=>['Solo','Café da Vila','Companhia de Aventuras Brasileiras'].map(name=>renderProposal(p.id,{name}))),proposals.flatMap(p=>['Solo','Café da Vila','Companhia de Aventuras…'].map(nm=>`${p.name} · ${nm}`)),{heading:'NOMES CURTOS, ACENTUADOS E LONGOS',cols:6}));

// Área segura e SVG válido, como na rodada anterior.
let total=0;
for(const p of proposals)for(const name of [p.sample,'Solo','Café da Vila','Companhia de Aventuras Brasileiras'])for(const variant of ['light','dark']){
 const svg=renderProposal(p.id,{name},variant,false),pixels=new Resvg(svg,{fitTo:{mode:'width',value:600}}).render().pixels;
 let minX=600,minY=500,maxX=0,maxY=0;
 for(let y=0;y<500;y++)for(let x=0;x<600;x++)if(pixels[(y*600+x)*4+3]){minX=Math.min(x,minX);minY=Math.min(y,minY);maxX=Math.max(x,maxX);maxY=Math.max(y,maxY);}
 if(minX<12||minY<12||maxX>588||maxY>488)throw new Error(`Fora da área segura: ${p.id}, ${name}: ${minX},${minY},${maxX},${maxY}`);
 if(/NaN|Infinity|<text/.test(svg))throw new Error(`SVG inválido: ${p.id}`);
 total++;
}
console.log(`${total} renderizações das propostas verificadas.`);
