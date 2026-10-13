import {fitText,fittedTextBounds,getFont} from './engine.js';
import {weight,n,path,line,cut,svgDoc,textKit} from './kit.js';
import {rect,stroked,within,initials,partition,nameBlock,drawBlock,glyphRow,boxOf,fitBox} from './typeset.js';

// Rodada 9: segunda leva tipográfica (pesquisa de 2026-10-13). Layouts de cartaz e editorial
// (Penguin, metrô, créditos de cinema, tarja de farmácia, campo de glifos) e manipulações do
// próprio nome (repetição, reflexo, inicial gigante, sobreposição, gradiente de peso, letra
// trocada por forma, aspas).
const t=(id,name,category,font,sample,desc,options={})=>({id,name,category,font,sample,desc,ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',...options});
export const round9Templates=[
 t('tri-band','Tri-band','Lettering','Oswald','PELICAN','Nome sozinho entre duas faixas sólidas com os textos vazados, como nas capas da Penguin.',{topline:'PENGUIN BOOKS',tagline:'SIX PENCE'}),
 t('subway-sign','Subway sign','Lettering','BarlowCondensed','Union Square','Placa de metrô: faixa sólida, inicial num círculo e seta antes do texto de baixo.',{topline:'UPTOWN & QUEENS',tagline:'EXIT TO 14 ST'}),
 t('credits-block','Credits block','Lettering','BebasNeue','MIDNIGHT RUN','Nome sobre uma linha de créditos de cinema, com palavras curtas empilhadas em meia altura.',{topline:'A FILM BY LUCAS PRADO',tagline:'PRODUCED IN SÃO PAULO AND LISBON'}),
 t('pharma-stripe','Pharmacy stripe','Lettering','Oswald','Calmina','Texto de cima como expoente do nome e texto de baixo numa tarja sólida, como em remédio.',{topline:'500 MG',tagline:'VENDA SOB PRESCRIÇÃO MÉDICA'}),
 t('glyph-field','Glyph field','Lettering','AlfaSlabOne','STATIC','Inicial repetida em grade, com uma clareira para o nome.',{topline:'NOISE RECORDS',tagline:'EST. 2026'}),
 t('repeat-tape','Repeat tape','Lettering','BebasNeue','LOOP','Nome repetido e vazado numa faixa, cortado pelas bordas.',{topline:'SKATE SUPPLY',tagline:'SINCE 2026'}),
 t('reflection','Striped reflection','Lettering','BebasNeue','LAGOA','Nome refletido por baixo, dissolvido em listras.',{topline:'HOTEL & SPA',tagline:'PRAIA DO FORTE'}),
 t('giant-initial','Giant initial','Lettering','AlfaSlabOne','MARLOWE','Inicial enorme em contorno, cortada pela moldura, atrás do nome.',{topline:'GALLERY',tagline:'CONTEMPORARY ART'}),
 t('overlap-letters','Overlapping letters','Lettering','AlfaSlabOne','BOLD BAKERY','Letras encavaladas e levemente giradas, separadas por um vão.',{topline:'PÃES E DOCES',tagline:'DESDE 2026'}),
 t('weight-ramp','Weight ramp','Lettering','BebasNeue','GRADUAL','Nome que vai do contorno fino na primeira letra ao cheio na última.',{topline:'FITNESS STUDIO',tagline:'LIGHT TO BOLD'}),
 t('shape-letter','Shape letter','Lettering','BebasNeue','ORBIT COFFEE','O primeiro O do nome vira um disco sólido; sem O, um disco fecha o nome como ponto final.',{topline:'ROASTERY',tagline:'SINGLE ORIGIN'}),
 t('big-quotes','Big quotes','Lettering','AlfaSlabOne','SCULPTURE','Nome entre aspas grandes, como um rótulo.',{topline:'STUDIO',tagline:'OBJECTS & FURNITURE'}),
];

// Palavras que o bloco de créditos empilha em meia altura.
const SMALL_WORDS=new Set(['DE','DA','DO','DAS','DOS','E','&','AND','OF','THE','FOR','POR','PARA','Y','DEL','LA','EL','A','O','EM','IN','BY','EN','AT','NO','NA']);

export function renderRound9(id,config={},variant='light',background=true){
 const p=round9Templates.find(p=>p.id===id);if(!p)throw new Error('Modelo desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const {factor,none,accent,foot,small}=textKit(c);
 const sp=Number(c.spacing)||0,o={uppercase:true,spacing:1+sp},SM={uppercase:true,spacing:2};
 // Texto pequeno alinhado pela borda: esquerda (dir 1) ou direita (dir -1).
 const side=(text,x,y,w,h,dir=1)=>{const {width}=fittedTextBounds(text,'BarlowCondensed',w,h,SM);return fitText(text,'BarlowCondensed',x+dir*width/2,y,w,h,SM);};
 const smallWidth=(text,w,h)=>fittedTextBounds(text,'BarlowCondensed',w,h,SM).width;
 const around=(top,bottom)=>small(c.topline,n(top-30),260,16)+small(c.tagline,n(bottom+34),300,16)+foot(n(bottom+64));
 let art='';
 switch(id){
  case 'tri-band':{
   const b=nameBlock(c.name,c.font,400*factor,120*factor,{maxLines:2,maxLine:96*factor,o});
   const W=Math.max(320,Math.min(520,Math.max(...b.widths)*1.35+40)),x0=300-W/2,mid=Math.max(170,b.height+80),band=80,top=250-mid/2-band;
   const marks=y=>none?'':accent(x0+30,y,8)+accent(x0+W-30,y,8);
   art=cut(rect(x0,top,W,band),small(c.topline,top+band/2,W-100,20)+marks(top+band/2))+line(`M${n(x0)} ${n(top+band+10)}H${n(x0+W)}M${n(x0)} ${n(250+mid/2-10)}H${n(x0+W)}`,1.5)+
    drawBlock(b,c.font,300,250,o)+cut(rect(x0,250+mid/2,W,band),small(c.tagline,250+mid/2+band/2,W-100,18)+marks(250+mid/2+band/2));
   break;}
  case 'subway-sign':{
   // Nome em caixa baixa, como nas placas; a inicial vai num círculo à esquerda.
   const lo={uppercase:false,spacing:.5+sp},b=nameBlock(c.name,c.font,350*Math.min(1,factor),96*factor,{maxLines:2,gap:6,o:lo});
   const H=Math.max(170,b.height+92),y0=250-H/2-20,cy=y0+H/2+12,tw=smallWidth(c.tagline,300,18);
   const holes=rect(30,y0+14,540,5)+`<circle cx="112" cy="${n(cy)}" r="52"/>`+side(c.topline,190,y0+44,340,15)+drawBlock(b,c.font,190,cy+10,lo,1);
   art=cut(rect(30,y0,540,H),holes)+fitText(initials(c.name)[0]??'',c.font,112,cy,60,62,{uppercase:true})+
    path(`M40 ${n(y0+H+30)}h34l-12-12h12l18 18-18 18h-12l12-12h-34Z`)+side(c.tagline,104,y0+H+36,300,18)+(none?'':accent(n(104+tw+18),n(y0+H+36),7));
   break;}
  case 'credits-block':{
   const b=nameBlock(c.name,c.font,440*factor,130*factor,{maxLines:2,maxLine:120*factor,o}),W=Math.max(360,Math.max(...b.widths)),H=40,F='BebasNeue',co={uppercase:true,spacing:1};
   // Fichas da linha de créditos: palavra alta, par de palavras curtas empilhadas ou o ornamento entre os dois textos.
   const short=w=>SMALL_WORDS.has(w.toUpperCase())||w.length<=2,tokens=[];
   const words=[...String(c.topline).split(/\s+/).filter(Boolean),...(String(c.topline).trim()&&String(c.tagline).trim()?[null]:[]),...String(c.tagline).split(/\s+/).filter(Boolean)];
   for(let i=0;i<words.length;i++){
    const w=words[i];
    if(w===null){if(!none)tokens.push({mark:true});continue;}
    if(short(w)){const next=words[i+1]&&short(words[i+1])?words[++i]:null;tokens.push({pair:next?[w,next]:[w]});}
    else tokens.push({word:w});
   }
   const widthOf=t=>t.mark?H*.5:t.word?fittedTextBounds(t.word,F,1e6,H,co).width:Math.max(...t.pair.map(s=>fittedTextBounds(s,F,1e6,H*.42,co).width));
   const gap=10,natural=Math.max(1,tokens.reduce((a,t)=>a+widthOf(t),0)+gap*(tokens.length-1)),k=Math.min(1.4,W/natural),h=H*k;
   const top=250-(b.height+18+h)/2,credY=top+b.height+18+h/2;let x=300-natural*k/2,credits='';
   for(const t of tokens){
    const w=widthOf(t)*k;
    if(t.mark)credits+=accent(n(x+w/2),n(credY),n(Math.min(9,h*.22)));
    else if(t.word)credits+=fitText(t.word,F,x+w/2,credY,1e6,h,co);
    else t.pair.forEach((s,i)=>{const {width}=fittedTextBounds(s,F,1e6,h*.42,co);credits+=fitText(s,F,x+width/2,credY+(t.pair.length>1?(i?1:-1)*h*.27:0),1e6,h*.42,co);});
    x+=w+gap*k;
   }
   art=drawBlock(b,c.font,300,top+b.height/2,o)+credits;
   break;}
  case 'pharma-stripe':{
   // O texto de cima vai como expoente do nome; se não couber ao lado, desce para baixo dele, à direita.
   const lo={uppercase:false,spacing:.5+sp},b=nameBlock(c.name,c.font,420*factor,110*factor,{maxLines:2,o:lo}),wN=Math.max(...b.widths),tw=smallWidth(c.topline,140,20);
   const beside=50+wN+14+tw<550,blockW=beside?wN+14+tw:Math.max(wN,tw),x0=300-blockW/2,cy=200-(beside?0:14),top=cy-b.height/2;
   const dose=beside?side(c.topline,x0+wN+14,top+10,140,20):side(c.topline,x0+wN,cy+b.height/2+22,140,18,-1);
   art=drawBlock(b,c.font,x0,cy,lo,1)+dose+cut(rect(40,284,520,76),small(c.tagline,322,420,18)+(none?'':accent(66,322,8)+accent(534,322,8)))+line('M40 380H560',1.5);
   break;}
  case 'glyph-field':{
   const b=nameBlock(c.name,c.font,400*factor,110*factor,{maxLines:2,maxLine:90*factor,o}),wN=Math.max(...b.widths);
   const clear={x:300-wN/2-22,y:250-b.height/2-20,w:wN+44,h:b.height+40},glyph=initials(c.name)[0]??'*';
   const cols=13,rows=10,px=40,py=40,x0=300-(cols-1)*px/2,y0=250-(rows-1)*py/2;let field='';
   for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){
    const x=x0+q*px,y=y0+r*py;
    // A 2ª e a penúltima fileira dão lugar aos textos, com o ornamento nas pontas.
    if(r===1||r===rows-2){if(!none&&(q===0||q===cols-1))field+=accent(x,y,8);continue;}
    if(x>clear.x-16&&x<clear.x+clear.w+16&&y>clear.y-14&&y<clear.y+clear.h+14)continue;
    field+=fitText(glyph,c.font,x,y,22,20,{uppercase:true});
   }
   art=field+small(c.topline,y0+py,340,16)+small(c.tagline,y0+(rows-2)*py,340,16)+drawBlock(b,c.font,300,250,o);
   break;}
  case 'repeat-tape':{
   // Cópias do nome a partir do centro, com o ornamento entre elas, até cobrir a faixa.
   const h=(String(c.name).length>16?40:64)*factor,{width}=fittedTextBounds(c.name,c.font,1e6,h,o),unit=width+(none?40:50);
   let copies='';
   for(let k=-12;k<=12;k++){
    const cx=300+k*unit;
    if(cx+unit/2>=0&&cx-width/2<=600)copies+=fitText(c.name,c.font,cx,250,1e6,h,o);
    if(!none&&cx+unit/2>0&&cx+unit/2<600)copies+=accent(n(cx+unit/2),250,9);
   }
   art=line('M20 186H580M20 314H580',weight.detail)+cut(rect(20,198,560,104),copies)+small(c.topline,158,300,16)+small(c.tagline,344,300,16)+foot(374);
   break;}
  case 'reflection':{
   // A última linha do nome, espelhada e achatada, aparece só em listras que afinam para baixo.
   const b=nameBlock(c.name,c.font,460*factor,120*factor,{maxLines:2,o}),cy=210,base=cy+b.height/2,depth=b.lh*.75;
   const last=fitText(b.lines.at(-1),c.font,300,base-b.lh/2,1e6,b.lh,o);
   const mirrored=`<g transform="translate(0 ${n(base)}) scale(1 -0.75) translate(0 ${n(-base)})">${last}</g>`;
   let holes=rect(0,0,600,base+5),y=base+5,i=0;
   while(y<base+depth+2){const vis=Math.max(1.2,6-i*.9),gap=1.6+i*1.1;holes+=rect(0,y+vis,600,gap);y+=vis+gap;i++;}
   art=small(c.topline,n(cy-b.height/2-30),260,16)+drawBlock(b,c.font,300,cy,o)+cut(mirrored,holes)+small(c.tagline,n(base+depth+34),300,16)+foot(n(base+depth+64));
   break;}
  case 'giant-initial':{
   // A inicial em contorno sangra pela moldura; o nome e os textos abrem um vão nela.
   const big=fitText(initials(c.name)[0]??'',c.font,210,215,700,560,{uppercase:true});
   const b=nameBlock(c.name,c.font,440*factor,100*factor,{maxLines:2,maxLine:84*factor,o}),cy=290,L=300-Math.max(...b.widths)/2,name=drawBlock(b,c.font,300,cy,o);
   const top=side(c.topline,L,cy-b.height/2-24,260,15),bottom=side(c.tagline,L,cy+b.height/2+26,300,15),tw=smallWidth(c.topline,260,15);
   const mark=none?'':accent(n(L+tw+16),n(cy-b.height/2-24),7);
   const frame=rect(0,0,600,30)+rect(0,470,600,30)+rect(0,0,30,500)+rect(570,0,30,500);
   art=line('M30 30H570V470H30Z',weight.detail)+cut(stroked(big,2.6),frame+stroked(name,18,'black')+`<g fill="black">${name}</g>`+stroked(top+bottom,8,'black')+(mark?`<g transform="translate(0 0)" stroke="black" stroke-width="10">${mark}</g>`:''))+
    name+top+bottom+mark;
   break;}
  case 'overlap-letters':{
   // Dentro da palavra as letras avançam 80% e giram ±3°; entre palavras, espaço normal. Cada letra
   // abre um vão nas anteriores. Nomes longos vão em duas linhas.
   const f=getFont(c.font),k=100/f.unitsPerEm,space=(f.charToGlyph(' ').advanceWidth||f.unitsPerEm/4)*k*.9,lh=f.unitsPerEm*k*.95;
   const words=String(c.name).trim().split(/\s+/).filter(Boolean),lines=words.join(' ').length>14?partition(words,2):[words.join(' ')],items=[];
   lines.forEach((ln,li)=>{
    let x=0;const row=[];
    for(const w of ln.split(' ').filter(Boolean)){const letters=glyphRow(w,c.font,{advance:.8,track:sp*3});for(const [i,it] of letters.entries())row.push({...it,x:x+it.x,y:li*lh,rot:i%2?3:-3});x+=Math.max(0,...letters.map(it=>it.x+it.adv*.8))+space;}
    const w=Math.max(0,...row.map(i=>i.x+i.bb.x2));for(const it of row){it.x-=w/2;items.push(it);}
   });
   const box=boxOf(items);if(!box){art=around(250,250);break;}
   const fit=fitBox(box,300,250,500*factor,(lines.length>1?220:130)*factor);
   for(const it of items){
    const g=`<g transform="translate(${n(it.x)} ${n(it.y)}) rotate(${it.rot} ${n((it.bb.x1+it.bb.x2)/2)} ${n((it.bb.y1+it.bb.y2)/2)})"><path d="${it.d}"/></g>`;
    art=cut(art,`<g fill="black" stroke="black" stroke-width="${n(9/fit.s)}" stroke-linejoin="round" transform="${fit.tr}">${g}</g>`)+`<g transform="${fit.tr}">${g}</g>`;
   }
   art+=around(fit.top,fit.bottom);
   break;}
  case 'weight-ramp':{
   // O traço de cada letra fica só por dentro do contorno e engrossa letra a letra; a última é cheia.
   const items=glyphRow(c.name,c.font,{track:4+sp*3}),box=boxOf(items);if(!box){art=around(250,250);break;}
   const fit=fitBox(box,300,250,500*factor,140*factor),stem=(box.y2-box.y1)*.13;
   items.forEach((it,i)=>{
    const t=items.length>1?i/(items.length-1):1,shape=`<g transform="${fit.tr}"><path transform="translate(${n(it.x)} 0)" d="${it.d}"/></g>`;
    art+=t>=.999?shape:within(`<g transform="${fit.tr}"><path transform="translate(${n(it.x)} 0)" d="${it.d}" fill="none" stroke="currentColor" stroke-width="${n(2*(1.2/fit.s+t*stem))}"/></g>`,shape);
   });
   art+=around(fit.top,fit.bottom);
   break;}
  case 'shape-letter':{
   // O primeiro O (ou Q, 0) vira um disco da altura das maiúsculas; sem O, um disco menor fecha o nome.
   const items=glyphRow(c.name,c.font,{track:3+sp*3}),cap=(b=>b?b.y2-b.y1:70)(boxOf(glyphRow('H',c.font)));
   if(!items.length){art=around(250,250);break;}
   const idx=items.findIndex(i=>'OQ0'.includes(i.ch));let shift=0,dot=null,body='';
   items.forEach((it,i)=>{
    if(i===idx){dot={cx:it.x+shift+cap/2+3,cy:-cap/2,r:cap/2};shift+=cap+6-it.adv;return;}
    body+=`<path transform="translate(${n(it.x+shift)} 0)" d="${it.d}"/>`;
   });
   const end=items.at(-1).x+shift+items.at(-1).adv;
   if(idx<0)dot={cx:end+cap*.3,cy:-cap*.28,r:cap*.28};
   const fit=fitBox({x1:Math.min(items[0].x+items[0].bb.x1,dot.cx-dot.r),x2:Math.max(end,dot.cx+dot.r),y1:-cap,y2:0},300,250,480*factor,120*factor);
   art=`<g transform="${fit.tr}">${body}<circle cx="${n(dot.cx)}" cy="${n(dot.cy)}" r="${n(dot.r)}"/></g>`+around(fit.top,fit.bottom);
   break;}
  case 'big-quotes':{
   // Aspas na fonte do nome, penduradas fora do bloco; fontes sem aspas curvas usam as retas.
   const f=getFont(c.font),curly=f.charToGlyph('“').index>0,[qo,qc]=curly?['“','”']:['"','"'];
   const b=nameBlock(c.name,c.font,400*factor,110*factor,{maxLines:2,maxLine:90*factor,o}),cy=250,top=cy-b.height/2,L=300-b.widths[0]/2,R=300+b.widths.at(-1)/2;
   const q=Math.min(b.lh*1.2,96)*.55,{width:qw}=fittedTextBounds(qo,c.font,1e6,q),lastTop=top+(b.lines.length-1)*(b.lh+b.gap),tw=smallWidth(c.tagline,300,15);
   art=fitText(qo,c.font,L-12-qw/2,top+q/2,1e6,q)+fitText(qc,c.font,R+12+qw/2,lastTop+q/2,1e6,q)+drawBlock(b,c.font,300,cy,o)+
    side(c.topline,L,top-28,240,15)+side(c.tagline,R,cy+b.height/2+30,300,15,-1)+(none?'':accent(n(R-tw-16),n(cy+b.height/2+30),7));
   break;}
 }
 return svgDoc(c.name,p.name,variant,background,art);
}
