import {fitText,fittedTextBounds,getFont} from './engine.js';
import {n} from './kit.js';

// Composição tipográfica compartilhada pelas rodadas em que o texto é a estrutura (8 e 9):
// quebra do nome em linhas, justificação, traço sobre contornos e posicionamento letra a letra.

export const rect=(x,y,w,h)=>`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}"/>`;
// Número estável derivado do nome, para séries, códigos de barras e variações.
export const hash=s=>[...String(s)].reduce((h,ch)=>(h*31+ch.charCodeAt(0))>>>0,7);
// Contornos de texto só com traço; a espessura é dividida pela escala de cada contorno.
export const stroked=(svg,w,color='currentColor')=>svg.replace(/<path d="([^"]*)" transform="([^"]*)"\s*\/>/g,(_,d,tr)=>{const s=Number(/scale\(([-\d.]+)\)/.exec(tr)?.[1]??1);return `<path d="${d}" transform="${tr}" fill="none" stroke="${color}" stroke-width="${n(w/s)}" stroke-linejoin="round"/>`;});
let serial=0;
// O inverso de kit.cut: mostra o conteúdo só dentro da forma.
export function within(content,shape){const id=`type-cut-${++serial}`;return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="500"><g fill="white" color="white">${shape}</g></mask></defs><g mask="url(#${id})">${content}</g>`;}
export const initials=name=>String(name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase());

// Divide as palavras em k linhas de comprimento parecido (menor linha mais longa).
export function partition(words,k){
 if(k<=1||words.length<=1)return [words.join(' ')];
 let best=null,score=Infinity;
 for(let i=1;i<=words.length-k+1;i++){
  const rest=partition(words.slice(i),k-1),lines=[words.slice(0,i).join(' '),...rest],worst=Math.max(...lines.map(s=>s.length));
  if(rest.length===k-1&&worst<score){score=worst;best=lines;}
 }
 return best??[words.join(' ')];
}
// Nome em até maxLines linhas com a mesma altura de letra, cabendo em w × h. Fica com o número
// de linhas que deixa a letra maior; uma linha a mais só entra se ganhar mais de 10%.
export function nameBlock(text,font,w,h,{maxLines=2,gap=8,maxLine=Infinity,o}){
 const words=String(text).trim().split(/\s+/).filter(Boolean);let best=null;
 for(let k=1;k<=Math.min(maxLines,words.length||1);k++){
  const lines=partition(words,k),widest=Math.max(...lines.map(s=>fittedTextBounds(s,font,1e6,100,o).width/100));
  const lh=Math.min(maxLine,(h-(k-1)*gap)/k,w/Math.max(.01,widest));
  if(!best||lh>best.lh*1.1)best={lines,lh};
 }
 const {lines,lh}=best;
 return {lines,lh,gap,height:lines.length*lh+(lines.length-1)*gap,widths:lines.map(s=>fittedTextBounds(s,font,w,lh,o).width)};
}
// Desenha o bloco com o centro vertical em cy; x é o centro (align 0) ou a borda esquerda (align 1).
export const drawBlock=(b,font,x,cy,o,align=0)=>b.lines.map((s,i)=>fitText(s,font,x+align*b.widths[i]/2,cy-b.height/2+b.lh/2+i*(b.lh+b.gap),1e6,b.lh,o)).join('');
// Espaçamento que faz o texto ocupar exatamente a largura w com a altura h.
export function justify(text,font,w,h,o){
 const width=s=>fittedTextBounds(text,font,1e6,h,{...o,spacing:s}).width;
 if(width(o.spacing??0)>=w)return {...o};
 let lo=o.spacing??0,hi=lo+400;
 for(let i=0;i<28;i++){const mid=(lo+hi)/2;if(width(mid)<w)lo=mid;else hi=mid;}
 return {...o,spacing:lo};
}

// Letra a letra, em unidades de corpo 100 com a linha de base em y=0. track soma ao avanço;
// advance multiplica o avanço (abaixo de 1, as letras se sobrepõem).
export function glyphRow(text,fontId,{upper=true,track=0,advance=1}={}){
 const f=getFont(fontId),s=upper?String(text).toUpperCase():String(text),glyphs=f.stringToGlyphs(s),k=100/f.unitsPerEm;let x=0;
 const items=[...s].length===glyphs.length?glyphs.map((g,i)=>{
  const p=g.getPath(0,0,100),it={ch:[...s][i],x,adv:(g.advanceWidth||f.unitsPerEm/2)*k,d:p.toPathData(2),bb:p.getBoundingBox()};
  x+=it.adv*advance+(i<glyphs.length-1?f.getKerningValue(g,glyphs[i+1])*k:0)+track;return it;
 }):glyphs.map(g=>{const p=g.getPath(0,0,100),it={ch:'?',x,adv:(g.advanceWidth||f.unitsPerEm/2)*k,d:p.toPathData(2),bb:p.getBoundingBox()};x+=it.adv*advance+track;return it;});
 return items.filter(i=>i.ch.trim()&&i.d);
}
// Caixa que envolve itens posicionados (cada um com x, y opcional e bb próprio).
export function boxOf(items){
 if(!items.length)return null;
 return {x1:Math.min(...items.map(i=>i.x+i.bb.x1)),x2:Math.max(...items.map(i=>i.x+i.bb.x2)),y1:Math.min(...items.map(i=>(i.y??0)+i.bb.y1)),y2:Math.max(...items.map(i=>(i.y??0)+i.bb.y2))};
}
// Encaixa a caixa r (unidades da glyphRow) em w × h centrada em cx, cy.
export function fitBox(r,cx,cy,w,h){
 const s=Math.min(w/Math.max(1,r.x2-r.x1),h/Math.max(1,r.y2-r.y1));
 return {s,tr:`translate(${n(cx-s*(r.x1+r.x2)/2)} ${n(cy-s*(r.y1+r.y2)/2)}) scale(${n(s)})`,left:cx-s*(r.x2-r.x1)/2,right:cx+s*(r.x2-r.x1)/2,top:cy-s*(r.y2-r.y1)/2,bottom:cy+s*(r.y2-r.y1)/2};
}
