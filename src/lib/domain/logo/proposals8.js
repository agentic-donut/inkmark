import {fitText,fittedTextBounds} from './engine.js';
import {weight,n,path,line,cut,svgDoc,textKit} from './kit.js';
import {rect,hash,stroked,partition,nameBlock,drawBlock,justify} from './typeset.js';

// Rodada 8: estruturas fora do território selo/emblema, escolhidas da pesquisa de 2026-10-13.
// A própria tipografia faz a forma (eco, fatia, bloco justificado) ou a forma é um documento
// retangular (célula bento, etiqueta técnica), sem arco, escudo nem fita.
const t=(id,name,category,font,sample,desc,options={})=>({id,name,category,font,sample,desc,ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',...options});
export const round8Templates=[
 t('echo-stack','Echo stack','Lettering','BebasNeue','REVERB','Nome sólido entre cópias vazadas que se sobrepõem acima e abaixo.',{topline:'SOUND STUDIO',tagline:'RECORDING · MIXING'}),
 t('sliced','Sliced name','Lettering','BebasNeue','OFFBEAT','Nome cortado na horizontal, com a metade de baixo deslizada para a direita.',{topline:'THEATRE COMPANY',tagline:'SEASON 2026'}),
 t('justified-block','Justified block','Lettering','BebasNeue','HARD RAIN','Linhas justificadas na mesma largura, formando um bloco entre filetes.',{topline:'RECORDS & TAPES',tagline:'INDEPENDENT LABEL'}),
 t('bento','Bento cell','Emblemas','AlfaSlabOne','WILD COAST','Retângulo em células, com o símbolo da marca numa célula cheia, como na tabela periódica.',{topline:'SURF SUPPLY'}),
 t('spec-label','Spec label','Emblemas','Oswald','NORTHFIELD','Etiqueta técnica de canto chanfrado, com faixa de topo e campos na base.',{topline:'OUTDOOR EQUIPMENT',tagline:'MADE IN BRAZIL'}),
];

export function renderRound8(id,config={},variant='light',background=true){
 const p=round8Templates.find(p=>p.id===id);if(!p)throw new Error('Modelo desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const {factor,none,accent,foot,small}=textKit(c);
 const o={uppercase:true,spacing:1+(Number(c.spacing)||0)},SM={uppercase:true,spacing:2};
 // Texto pequeno alinhado pela borda: esquerda (dir 1) ou direita (dir -1).
 const side=(text,x,y,w,h,dir=1)=>{const {width}=fittedTextBounds(text,'BarlowCondensed',w,h,SM);return fitText(text,'BarlowCondensed',x+dir*width/2,y,w,h,SM);};
 let art='';
 switch(id){
  case 'echo-stack':{
   // Cópias vazadas no passo de 62% da linha: as de cima ecoam a primeira linha e as de baixo, a
   // última. Um halo na máscara afasta as cópias do nome sólido.
   const b=nameBlock(c.name,c.font,420*factor,(c.name.length>12?150:84)*factor,{maxLines:2,o}),solid=drawBlock(b,c.font,300,250,o);
   const at=i=>fitText(b.lines[i],c.font,300,250-b.height/2+b.lh/2+i*(b.lh+b.gap),1e6,b.lh,o),step=b.lh*.62;
   let ghosts='';
   for(const k of [1,2]){const w=k>1?1.1:1.7;ghosts+=`<g transform="translate(0 ${n(-k*step)})">${stroked(at(0),w)}</g><g transform="translate(0 ${n(k*step)})">${stroked(at(b.lines.length-1),w)}</g>`;}
   const span=2*step+b.height/2;
   art=cut(ghosts,stroked(solid,12))+solid+small(c.topline,n(250-span-26),240,15)+small(c.tagline,n(250+span+28),320,15)+foot(n(250+span+56));
   break;}
  case 'sliced':{
   // Cada linha é cortada a 55% da altura das maiúsculas e a metade de baixo desliza para a
   // direita. Acentos aumentam a caixa do texto; a altura sem acentos vem da razão das larguras.
   const b=nameBlock(c.name,c.font,440*factor,170*factor,{maxLines:2,gap:22,o});
   const shift=Math.max(14,b.lh*.2),width=Math.max(...b.widths),L=300-(width+shift)/2,whole=drawBlock(b,c.font,L,250,o,1);
   const plain=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   let holesTop='',holesBottom='',prev=0;
   b.lines.forEach((s,i)=>{
    const base=250-b.height/2+(i+1)*b.lh+i*b.gap,cap=b.lh*fittedTextBounds(s,c.font,1e6,100,o).width/Math.max(1,fittedTextBounds(plain(s),c.font,1e6,100,o).width);
    const y=base-cap*.55,end=base+b.gap/2;
    holesTop+=rect(0,y-3,600,end-y+3);holesBottom+=rect(0,prev,600,y+3-prev);prev=end;
   });
   art=cut(whole,holesTop)+`<g transform="translate(${n(shift)} 0)">${cut(whole,holesBottom)}</g>`;
   const top=250-b.height/2,bottom=250+b.height/2,ruleX=L+width+shift-70;
   art+=side(c.topline,L,n(top-24),300,15)+
    line(`M${n(ruleX)} ${n(bottom+20)}h70`,weight.mid)+accent(n(ruleX-14),n(bottom+20),6)+side(c.tagline,L+width+shift,n(bottom+42),300,15,-1);
   break;}
  case 'justified-block':{
   // Cada linha do nome ganha a altura que a faz ocupar a largura toda; textos de apoio se
   // justificam pelo espaçamento. Se o bloco passar da altura, a largura encolhe.
   const words=String(c.name).trim().split(/\s+/),lines=partition(words,words.length>3?3:2).filter(Boolean),gap=10,rule=4;
   const measure=W=>{
    const rows=[{t:c.topline,f:'BarlowCondensed',h:22,o:justify(c.topline,'BarlowCondensed',W,22,{uppercase:true,spacing:2})}];
    for(const s of lines){const h=Math.min(150,W*100/Math.max(1,fittedTextBounds(s,c.font,1e6,100,o).width));rows.push({t:s,f:c.font,h,o:justify(s,c.font,W,h,o)});}
    rows.push({t:c.tagline,f:'BarlowCondensed',h:20,o:justify(c.tagline,'BarlowCondensed',W,20,{uppercase:true,spacing:2})});
    return {rows,total:rows.reduce((a,r)=>a+r.h,0)+(rows.length+1)*gap+2*rule};
   };
   let W=400*Math.min(1.1,factor),m=measure(W);
   for(let i=0;m.total>360&&i<20;i++){W*=.93;m=measure(W);}
   const footH=none?0:28;let y=250-(m.total+footH)/2;
   m.rows.forEach((r,i)=>{
    if(i===1||i===m.rows.length-1){art+=rect(300-W/2,y,W,rule);y+=rule+gap;}
    art+=fitText(r.t,r.f,300,y+r.h/2,1e6,r.h,r.o);y+=r.h+gap;
   });
   art+=foot(n(y+12));
   break;}
  case 'bento':{
   // Célula A: nome; célula B (cheia): símbolo de duas letras e número; faixa C: tagline.
   const word=String(c.name).trim().split(/\s+/)[0]??'',symbol=(word[0]??'').toUpperCase()+(word[1]??'').toLowerCase();
   const b=nameBlock(c.name,c.font,270,150*factor,{maxLines:3,gap:6,maxLine:84*factor,o});
   const cell=fitText(symbol,c.font,462,214,120,110)+side(String(hash(c.name)%90+10),400,116,40,13)+accent(522,302,6);
   art=line('M60 92H540V408H60Z',4)+line('M384 92V324M60 324H540',3)+side(c.topline,82,118,250,13)+drawBlock(b,c.font,82,226,o,1)+
    cut(rect(384,92,156,232),cell)+small(c.tagline,366,380,17);
   break;}
  case 'spec-label':{
   // Faixa de topo acompanha o chanfro; campos da base: tagline, ornamentos e código de barras.
   const b=nameBlock(c.name,c.font,480*factor,130*factor,{maxLines:2,gap:8,maxLine:100*factor,o}),h=hash(c.name);
   let bars='',x=436;
   for(let i=0;x<540;i++){const w=[2,4,2,6,3][(h>>>(i%28))%5];bars+=rect(x,334,Math.min(w,540-x),38);x+=w+[3,2,4][(h>>>((i+3)%28))%3];}
   art=line('M40 112H516L560 156V388H40Z',4)+cut(path('M40 112H516L558 154V156H40Z'),side(c.topline,60,134,300,15)+side('Nº '+String(h%900+100),500,134,80,13,-1))+
    drawBlock(b,c.font,60,234,o,1)+line('M40 312H560',3)+line('M300 312V388M420 312V388',2)+
    side(c.tagline,60,350,220,17)+(none?'':[336,360,384].map(cx=>accent(cx,350,7)).join(''))+bars;
   break;}
 }
 return svgDoc(c.name,p.name,variant,background,art);
}
