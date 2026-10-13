import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {Resvg} from '@resvg/resvg-js';
import {fonts,templates,registerFont,renderLogo} from '../src/lib/domain/logo/registry.js';
import {sampleNames as samples} from '../src/lib/domain/catalog/samples.ts';
for(const f of fonts){const b=readFileSync(new URL(`../static/fonts/${f.id}.ttf`,import.meta.url));registerFont(f.id,b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength));}
const output=new URL('../docs/review/',import.meta.url);mkdirSync(output,{recursive:true});
for(const category of ['Lettering','Selos','Emblemas']){
 const items=templates.filter(t=>t.category===category);const cols=Math.min(3,items.length);const cellW=360,cellH=330;
 const rows=Math.ceil(items.length/cols);let cells='';
 items.forEach((t,i)=>{
   const svg=renderLogo({template:t.id,font:t.font,name:samples[t.id]??t.sample,topline:t.topline??'PREMIUM QUALITY',tagline:t.tagline??'AUTHENTIC GOODS',ornament:t.ornament??'stars',tilt:-6});
   cells+=`<g transform="translate(${i%cols*cellW},${Math.floor(i/cols)*cellH})"><rect x="8" y="8" width="344" height="312" rx="6" fill="#fff" stroke="#e1e1da"/>${svg.replace('width="1200" height="1000"','x="20" y="10" width="320" height="267"')}<text x="180" y="300" text-anchor="middle" fill="#777" font-family="sans-serif" font-size="13">${String(i+1).padStart(2,'0')} · ${t.name}</text></g>`;
 });
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${cols*cellW}" height="${rows*cellH}"><rect width="100%" height="100%" fill="#f4f3ed"/>${cells}</svg>`;
 writeFileSync(new URL(`${category.toLowerCase()}.svg`,output),svg);
 writeFileSync(new URL(`${category.toLowerCase()}.png`,output),new Resvg(svg).render().asPng());
}
// Exercise all layouts with short, accented, and long names; inspect alpha bounds.
let total=0;
for(const t of templates)for(const name of ['Solo','Café da Vila','Wild Coast','Companhia de Aventuras Brasileiras'])for(const variant of ['light','dark']){
 const svg=renderLogo({template:t.id,font:t.font,name,topline:'EST. 2026',tagline:'INDEPENDENT GOODS'},variant,false);
 const image=new Resvg(svg,{fitTo:{mode:'width',value:600}}).render();
 const pixels=image.pixels;let minX=600,minY=500,maxX=0,maxY=0;
 for(let y=0;y<500;y++)for(let x=0;x<600;x++){if(pixels[(y*600+x)*4+3]){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}
 if(minX<12||minY<12||maxX>588||maxY>488)throw new Error(`Contorno fora da área segura: ${t.id} / ${name}: ${minX},${minY},${maxX},${maxY}`);
 total++;
}
console.log(`${total} renderizações verificadas: área segura, acentos e transparência.`);

const cols=5,cellW=400,cellH=355;
const cells=templates.map((t,i)=>{
 const svg=renderLogo({template:t.id,font:t.font,name:samples[t.id]??t.sample,topline:t.topline??'PREMIUM QUALITY',tagline:t.tagline??'AUTHENTIC GOODS',ornament:t.ornament??'stars'});
 return `<g transform="translate(${i%cols*cellW},${Math.floor(i/cols)*cellH})"><rect x="8" y="8" width="384" height="335" rx="6" fill="white" stroke="#ddd"/>${svg.replace('width="1200" height="1000"','x="20" y="10" width="360" height="300"')}<text x="200" y="326" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#777">${t.name}</text></g>`;
}).join('');
const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="${cols*cellW}" height="${Math.ceil(templates.length/cols)*cellH}"><rect width="${cols*cellW}" height="${Math.ceil(templates.length/cols)*cellH}" fill="#f4f3ed"/>${cells}</svg>`;
writeFileSync(new URL('aprovados.svg',output),sheet);
writeFileSync(new URL('aprovados.png',output),new Resvg(sheet).render().asPng());
