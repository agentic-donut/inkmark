import {fitText,arcText,fittedTextBounds} from './engine.js';

// The two badge compositions approved after visual review.
export const badgeTemplates=[
 {id:'round-plate',name:'Round plate',category:'Selos',ornament:'diamond',desc:'Selo circular com faixa angular e contornos alinhados.',font:'BarlowCondensed',sample:'DESIGN',topline:'ORIGINAL',tagline:'PREMIUM GOODS',reference:'Imagem 2 · superior direita'},
 {id:'bow-hex',name:'Bow hexagon',category:'Emblemas',ornament:'stars',desc:'Hexágono sólido com faixa e letras em curva.',font:'AlfaSlabOne',sample:'VINTAGE',topline:'',tagline:'EST. 1990',reference:'Imagem 2 · inferior direita'},
];
const weight={frame:8,inset:3.2,detail:2.5};
const path=(d,a='')=>`<path d="${d}" ${a}/>`;
const line=(d,w=weight.frame)=>path(d,`fill="none" stroke="currentColor" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="butt"`);
const circle=(r,w=weight.frame)=>`<circle cx="300" cy="250" r="${r}" fill="none" stroke="currentColor" stroke-width="${w}"/>`;
const disc=r=>`<circle cx="300" cy="250" r="${r}"/>`;
const star=(x,y,r=10)=>`<polygon points="${Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,s=i%2?r*.44:r;return `${x+Math.cos(a)*s},${y+Math.sin(a)*s}`;}).join(' ')}"/>`;
const stars=y=>star(258,y,9)+star(300,y,13)+star(342,y,9);
let serial=0;
function cut(shape,holes){const id=`proposal-cut-${++serial}`;return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="500"><rect width="600" height="500" fill="white"/><g fill="black" color="black">${holes}</g></mask></defs><g mask="url(#${id})">${shape}</g>`;}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const hex='M300 76 460 165V335L300 424 140 335V165Z';
const hexInset='M300 87.44 450 170.88V329.12L300 412.56 150 329.12V170.88Z';
// The curved band is shared by the visible border and the underlying cutout.
const bow='M110 226Q300 186 490 226L484 315Q300 275 116 315Z';

export function renderBadge(id,config={},variant='light',background=true){
 const p=badgeTemplates.find(p=>p.id===id);if(!p)throw new Error('Emblema desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const foreground=variant==='dark'?'#ffffff':'#191a18',bg=variant==='dark'?'#191a18':'#ffffff';
 const factor=Math.max(.65,Math.min(1.1,Number(c.size)/100));
 const accent=(x,y)=>c.ornament==='none'?'':c.ornament==='stars'?star(x,y,9):c.ornament==='mountain'?line(`M${x-9} ${y+6}l9-15 9 15Z`,2):path(`M${x} ${y-8}l8 8-8 8-8-8Z`);
 const topAccent=c.ornament==='none'?'':c.ornament==='stars'?stars(159):c.ornament==='mountain'?line('M266 170l22-31 18 24 11-17 19 24Z',3):accent(300,159);
 const date=y=>{
  const options={spacing:2,uppercase:true};
  const {width}=fittedTextBounds(c.tagline,'BarlowCondensed',125,17,options);if(!width)return '';
  const half=width/2;
  return fitText(c.tagline,'BarlowCondensed',300,y,125,17,options)+line(`M${300-half-33} ${y}h22M${300+half+11} ${y}h22`,weight.detail);
 };
 let art='';
 if(id==='round-plate'){
  const plate='M117 204H483L510 250 483 296H117L90 250Z';
  art=cut(circle(174)+circle(162,weight.inset)+disc(106),path(plate))+
      arcText(c.topline,300,250,140,{size:23,spacing:4,maxAngle:2.2,font:'BebasNeue'})+
      arcText(c.tagline,300,250,146,{bottom:true,size:22,spacing:4,maxAngle:2.5,font:'BebasNeue'})+
      line(plate)+fitText(c.name,c.font,300,250,263*factor,64*factor,{uppercase:true,spacing:1.3+Number(c.spacing)})+
      accent(129,250)+accent(471,250);
 }else{
  art=cut(path(hex),line(hexInset,weight.inset)+path(bow)+topAccent+date(353)+fitText(c.topline,'BarlowCondensed',300,192,168,14,{uppercase:true,spacing:2}))+
      line(bow)+arcText(c.name,300,1477,1200,{size:70*factor,spacing:2+Number(c.spacing),maxAngle:.285,font:c.font});
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" viewBox="0 0 600 500" role="img" aria-label="${esc(c.name)}" style="color:${foreground}"><title>${esc(p.name)} — ${variant==='dark'?'escura':'clara'}</title>${background?`<rect width="600" height="500" fill="${bg}"/>`:''}<g fill="${foreground}" color="${foreground}">${art}</g></svg>`;
}
