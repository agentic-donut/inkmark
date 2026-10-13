import {fitText,fittedTextBounds,arcText,getFont} from './engine.js';
import {n,path,line,cut,svgDoc,textKit} from './kit.js';
import {rect,hash,stroked,within,partition,nameBlock,drawBlock,glyphRow,boxOf} from './typeset.js';

// Rodada 10: terceira leva tipográfica (pesquisa de 2026-10-13). Impressos e tabelas (Snellen,
// verbete, cruzadinha, cotas, cartão perfurado), geometria aplicada ao nome (sangria, faixa
// vazada, baralho, perspectiva, lombadas, retícula, triline) e tradições vernaculares (fita
// rotuladora, camisa, cartaz de oferta, letreiro de boteco).
const t=(id,name,category,font,sample,desc,options={})=>({id,name,category,font,sample,desc,ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',...options});
export const round10Templates=[
 t('eye-chart','Eye chart','Lettering','AlfaSlabOne','Norte Óptica','Tabela de exame de vista: linhas do nome cada vez menores, com frações e números nas margens.',{topline:'DESDE 1987',tagline:'VEJA MELHOR, VIVA MELHOR'}),
 t('dictionary-entry','Dictionary entry','Lettering','AlfaSlabOne','Cafeteria Lumen','Verbete de dicionário: sílabas separadas por pontos, pronúncia entre barras e definição numerada.',{topline:'DO LAT. LUMEN, LUZ',tagline:'LUGAR ONDE O CAFÉ ACORDA A CIDADE'}),
 t('crossword','Crossword','Lettering','BarlowCondensed','Palavra Viva','Palavras cruzadas: o nome na horizontal e as palavras dos outros textos cruzando nas letras em comum.',{topline:'LIVRARIA',tagline:'ONDE AS LETRAS SE CRUZAM'}),
 t('dimension-lines','Dimension lines','Lettering','Oswald','VETOR','Desenho técnico: linhas-guia, cota da largura total e cotas de cada letra medidas no próprio nome.',{topline:'ESTRUTURAS METÁLICAS',tagline:'PRECISÃO EM CADA MILÍMETRO'}),
 t('punch-card','Punch card','Lettering','BebasNeue','DATAFORMA','Cartão perfurado com o código real de cada letra do nome nas perfurações.',{topline:'SISTEMAS DESDE 1964',tagline:'CADA LETRA TEM SEU FURO'}),
 t('bleed-crop','Bleed crop','Lettering','BebasNeue','NORTE','Nome maior que a moldura, cortado nas pontas e no topo das letras.',{topline:'CERVEJARIA ARTESANAL',tagline:'DESDE 1998 EM PORTO ALEGRE'}),
 t('knockout-band','Knockout band','Lettering','Oswald','VOLT','Faixa sólida atravessando o nome, com as letras vazadas dentro dela.',{topline:'OFICINA ELÉTRICA',tagline:'INSTALAÇÕES E MANUTENÇÃO'}),
 t('playing-card','Playing card','Lettering','PirataOne','Ás de Ouros','Nome em cima e girado 180° embaixo, como numa carta de baralho.',{topline:'BAR & JOGOS',tagline:'TRUCO, SINUCA E CHOPE GELADO'}),
 t('perspective','Perspective','Lettering','Oswald','HORIZONTE','Nome deitado num plano que foge para o horizonte.',{topline:'AGÊNCIA DE VIAGENS',tagline:'ROTEIROS PARA LONGE DAQUI'}),
 t('book-spines','Book spines','Lettering','BebasNeue','CASA DE LIVROS RAROS','Cada palavra vira uma lombada de livro em pé, alternando o sentido de leitura.',{topline:'SEBO & ANTIQUÁRIO',tagline:'PRIMEIRAS EDIÇÕES DESDE 1972'}),
 t('halftone','Halftone','Lettering','AlfaSlabOne','PRENSA','Nome preenchido por pontos de retícula que crescem da esquerda para a direita.',{topline:'GRÁFICA RÁPIDA',tagline:'IMPRESSÃO OFFSET E DIGITAL'}),
 t('triline','Triline','Lettering','Oswald','NEON','Três linhas paralelas acompanhando o contorno das letras, com o miolo vazio.',{topline:'CINE CLUBE',tagline:'SESSÕES DE QUINTA À MEIA-NOITE'}),
 t('label-tape','Label tape','Lettering','BarlowCondensed','ARQUIVO MORTO','Fitas de rotuladora com as letras em relevo vazadas, uma por palavra.',{topline:'CAIXA 07',tagline:'DOCUMENTOS, MEMÓRIAS & OUTRAS COISAS'}),
 t('jersey-number','Jersey number','Lettering','Oswald','RIVALDO PADARIA','Costas de camisa: nome em arco sobre um número com contorno duplo, tirado dos dígitos do texto de cima.',{topline:'DESDE 1999',tagline:'PÃO QUENTE TODA HORA'}),
 t('price-sign','Price sign','Lettering','BebasNeue','MERCADINHO BOM PREÇO','Cartaz de oferta: a última palavra sobe como os centavos e o texto de cima fica vazado numa tarja.',{topline:'SÓ HOJE',tagline:'HORTIFRUTI • AÇOUGUE • PADARIA'}),
 t('shopfront','Shopfront','Lettering','AlfaSlabOne','BAR DO ZÉ','Letreiro pintado: nome esticado até a borda e o texto de cima em letra cursiva cruzando o canto.',{topline:'Tradicional',tagline:'CERVEJA GELADA • PETISCOS • SINUCA'}),
];

const plain=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase();
const words=s=>String(s).trim().split(/\s+/).filter(Boolean);
const capOf=f=>-getFont(f).charToGlyph('H').getPath(0,0,100).getBoundingBox().y1;
const rotated=(svg,cx,cy,deg)=>`<g transform="rotate(${n(deg)} ${n(cx)} ${n(cy)})">${svg}</g>`;
const hr=(x1,x2,y,w=2)=>line(`M${n(x1)} ${n(y)}H${n(x2)}`,w);
const FRACTIONS=['20/200','20/100','20/70','20/50','20/40','20/30','20/25','20/20'];

// Sílabas aproximadas para o verbete: corta entre vogal e consoante+vogal e entre duas
// consoantes, preservando os dígrafos e encontros comuns (ch, lh, nh, qu, gu, br, pl…).
function syllables(w){
 const V=/[aeiouáéíóúâêôãõàüy]/i,keep=/^(ch|lh|nh|qu|gu|[bcdfgkptv][lr])$/i,s=[...w],cuts=[];
 for(let i=1;i<s.length-1;i++){
  if(V.test(s[i-1])&&!V.test(s[i])&&V.test(s[i+1]))cuts.push(i);
  else if(i>=2&&V.test(s[i-2])&&!V.test(s[i-1])&&!V.test(s[i])&&V.test(s[i+1]))cuts.push(keep.test(s[i-1]+s[i])?i-1:i);
 }
 const at=[0,...new Set(cuts),s.length];
 return at.slice(1).map((e,i)=>s.slice(at[i],e).join('')).filter(Boolean);
}
// Código Hollerith de um caractere: as linhas perfuradas da coluna.
function hollerith(ch){
 if(/[A-I]/.test(ch))return ['12',String(ch.charCodeAt(0)-64)];
 if(/[J-R]/.test(ch))return ['11',String(ch.charCodeAt(0)-73)];
 if(/[S-Z]/.test(ch))return ['0',String(ch.charCodeAt(0)-81)];
 if(/\d/.test(ch))return [ch];
 return {'&':['12'],'-':['11'],'/':['0','1'],'.':['12','3','8']}[ch]??[];
}
// Achata as curvas do contorno e aplica a projeção do plano em perspectiva.
function project(cmds,map,steps=8){
 let d='',px=0,py=0,sx=0,sy=0;const P=(x,y)=>{const [a,b]=map(x,y);return `${n(a)} ${n(b)}`;};
 for(const c of cmds){
  if(c.type==='M'){d+=`M${P(c.x,c.y)}`;px=sx=c.x;py=sy=c.y;}
  else if(c.type==='L'){d+=`L${P(c.x,c.y)}`;px=c.x;py=c.y;}
  else if(c.type==='Q'){for(let i=1;i<=steps;i++){const t=i/steps,u=1-t;d+=`L${P(u*u*px+2*u*t*c.x1+t*t*c.x,u*u*py+2*u*t*c.y1+t*t*c.y)}`;}px=c.x;py=c.y;}
  else if(c.type==='C'){for(let i=1;i<=steps;i++){const t=i/steps,u=1-t;d+=`L${P(u*u*u*px+3*u*u*t*c.x1+3*u*t*t*c.x2+t*t*t*c.x,u*u*u*py+3*u*u*t*c.y1+3*u*t*t*c.y2+t*t*t*c.y)}`;}px=c.x;py=c.y;}
  else if(c.type==='Z'){d+='Z';px=sx;py=sy;}
 }
 return path(d);
}
// Fita de rotuladora: letras em largura fixa vazadas numa fita arredondada, com o friso do relevo.
function tape(text,cx,cy,cap,deg,f,track=0){
 const s=String(text).toUpperCase(),g=getFont(f),sc=cap/capOf(f),cell=cap*(.86+track),pad=cap*.7,w=[...s].length*cell+pad*2,h=cap*2.05;
 const letters=[...s].map((ch,i)=>{if(!ch.trim())return '';const p=g.charToGlyph(ch).getPath(0,0,100),bb=p.getBoundingBox();return `<path d="${p.toPathData(2)}" transform="translate(${n(cx-w/2+pad+i*cell+cell/2-sc*(bb.x1+bb.x2)/2)} ${n(cy+cap/2)}) scale(${n(sc)})"/>`;}).join('');
 const strip=`<rect x="${n(cx-w/2)}" y="${n(cy-h/2)}" width="${n(w)}" height="${n(h)}" rx="${n(cap*.22)}"/>`;
 return rotated(cut(strip,letters+rect(cx-w/2+pad*.5,cy+cap/2+cap*.22,w-pad,Math.max(1,cap*.05))),cx,cy,deg);
}
const tapeWidth=(s,cap,track=0)=>[...String(s)].length*cap*(.86+track)+cap*1.4;

export function renderRound10(id,config={},variant='light',background=true){
 const p=round10Templates.find(p=>p.id===id);if(!p)throw new Error('Modelo desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 if(!String(c.name).trim())c.name=p.sample;
 const {factor,none,accent,foot,small}=textKit(c);
 const sp=Number(c.spacing)||0,o={uppercase:true,spacing:1+sp},SM={uppercase:true,spacing:2};
 const width=(text,font,h,opts=o)=>fittedTextBounds(text,font,1e6,h,opts).width;
 // Texto pequeno alinhado pela borda: esquerda (dir 1) ou direita (dir -1).
 const side=(text,x,y,w,h,dir=1)=>{const b=fittedTextBounds(text,'BarlowCondensed',w,h,SM);return fitText(text,'BarlowCondensed',x+dir*b.width/2,y,w,h,SM);};
 const smallWidth=(text,w,h)=>fittedTextBounds(text,'BarlowCondensed',w,h,SM).width;
 let art='';
 switch(id){
  case 'eye-chart':{
   const ws=words(String(c.name).toUpperCase());let rows;
   if(ws.length>1)rows=ws;else{const s=[...ws[0]];rows=[];for(let i=0,k=1;i<s.length;i+=k,k=Math.min(k+1,5))rows.push(s.slice(i,i+k).join(''));}
   const eo={uppercase:true,spacing:28+sp*4},r=rows.map((_,i)=>.78**i),w=rows.map(s=>width(s,c.font,100,eo)/100);
   const h0=Math.min(130*factor,320/r.reduce((a,x)=>a+x*1.38,0),...rows.map((_,i)=>350*factor/(w[i]*r[i])));
   const total=r.reduce((a,x)=>a+x*h0*1.38,0)-r.at(-1)*h0*.38;let y=255-total/2;
   art=rows.map((s,i)=>{const h=r[i]*h0,cy=y+h/2,lh=Math.max(8,Math.min(13,h*.5));y+=h*1.38;
    return fitText(s,c.font,300,cy,1e6,h,eo)+side(FRACTIONS[Math.min(i,FRACTIONS.length-1)],40,cy,62,lh)+side(String(i+1),560,cy,40,lh,-1);}).join('');
   const bottom=y-r.at(-1)*h0*.38;
   art+=small(c.topline,n(255-total/2-34),260,15)+hr(150,450,bottom+20)+small(c.tagline,n(bottom+44),340,14)+foot(n(bottom+72));
   break;}
  case 'dictionary-entry':{
   const head=words(c.name).map(w=>syllables(w).join('·')).join(' '),pron=words(c.name).map(w=>syllables(w).join('-')).join(' '),ho={spacing:1+sp};
   const b=nameBlock(head,c.font,480*factor,190*factor,{maxLines:3,gap:10,maxLine:120*factor,o:ho}),top=Math.max(100,250-(b.height+150)/2+40),y2=top+28+b.height+30;
   art=side(c.topline,60,top-30,300,14)+hr(60,540,top-12,1.6)+(none?side('[ 1 ]',540,top-30,60,14,-1):accent(532,top-30,7))
    +drawBlock(b,c.font,60,top+28+b.height/2,ho,1)
    +side(`\\ ${pron} \\`,60,y2,480,15)+hr(60,540,y2+22,1.2)+side('1',60,y2+48,20,15)+side(c.tagline,84,y2+48,456,15);
   break;}
  case 'crossword':{
   const ws=words(plain(c.name));let k=1;while(k<ws.length&&Math.max(...partition(ws,k).map(s=>s.length))>13)k++;
   const lines=partition(ws,k),cols=Math.max(...lines.map(s=>s.length)),grid=new Map(),key=(r,cc)=>`${r},${cc}`,last=(lines.length-1)*2;
   lines.forEach((s,i)=>[...s].forEach((ch,j)=>{if(ch!==' ')grid.set(key(i*2,j+Math.floor((cols-s.length)/2)),ch);}));
   const starts=lines.map((s,i)=>({r:i*2,c:Math.floor((cols-s.length)/2)})),used=[];
   // Palavras dos outros textos descem cruzando o nome numa letra igual, sem colunas vizinhas.
   const cand=[...words(plain(c.topline)),...words(plain(c.tagline))].map(w=>w.replace(/[^A-Z0-9]/g,'')).filter(w=>w.length>=3).sort((a,b)=>b.length-a.length);
   for(const w of cand){
    if(used.length>=3)break;
    search:for(let cc=0;cc<cols;cc++){
     if(used.some(u=>Math.abs(u.c-cc)<2))continue;
     for(let r0=1-w.length;r0<=last;r0++){
      let ok=true,hits=0;
      for(let i=0;i<w.length&&ok;i++){const r=r0+i;if(r>=0&&r<=last&&r%2===0){ok=grid.get(key(r,cc))===w[i];hits++;}}
      if(ok&&hits&&!grid.has(key(r0-1,cc))&&!grid.has(key(r0+w.length,cc))){for(let i=0;i<w.length;i++)grid.set(key(r0+i,cc),w[i]);used.push({r:r0,c:cc});break search;}
     }
    }
   }
   const rs=[...grid.keys()].map(s=>+s.split(',')[0]),r1=Math.min(0,...rs),r2=Math.max(last,...rs),rowsN=r2-r1+1;
   const cell=Math.min(42,520/cols,300/rowsN)*factor,gap=Math.min(cell*.2,sp*.6),x0=300-cols*cell/2,y0=255-rowsN*cell/2;
   for(let r=r1;r<=r2;r++)for(let cc=0;cc<cols;cc++){
    const x=x0+cc*cell,y=y0+(r-r1)*cell,g=grid.get(key(r,cc));
    art+=g?`<rect x="${n(x+gap/2)}" y="${n(y+gap/2)}" width="${n(cell-gap)}" height="${n(cell-gap)}" fill="none" stroke="currentColor" stroke-width="2"/>`+fitText(g,c.font,x+cell/2,y+cell*.58,cell*.7,cell*.52,{uppercase:true}):rect(x+gap/2,y+gap/2,cell-gap,cell-gap);
   }
   art+=[...starts,...used].filter((q,i,a)=>a.findIndex(z=>z.r===q.r&&z.c===q.c)===i).map((q,i)=>side(String(i+1),x0+q.c*cell+3+gap/2,y0+(q.r-r1)*cell+cell*.16+gap/2,cell*.3,Math.max(6,cell*.18))).join('');
   const tw=smallWidth(c.topline,300,16);
   art+=small(c.topline,n(y0-30),300,16)+(none?'':accent(n(300-tw/2-18),n(y0-30),7)+accent(n(300+tw/2+18),n(y0-30),7))+small(`1 — ${c.tagline}`,n(y0+rowsN*cell+30),400,14);
   break;}
  case 'dimension-lines':{
   const ws=words(c.name),k=String(c.name).length>16&&ws.length>1?2:1,lines=partition(ws,k),rows=lines.map(s=>glyphRow(s,c.font,{track:sp*4})),cap=capOf(c.font);
   const s=Math.min((k>1?70:130)*factor/cap,...rows.map(r=>{const b=boxOf(r);return 440*factor/(b.x2-b.x1);})),H=cap*s,step=H+86;
   const yb0=250-(k*H+(k-1)*86)/2+H+10,arrow=(x,y,d)=>path(`M${n(x)} ${n(y)}l${n(9*d)} -4v8z`);
   rows.forEach((r,li)=>{
    const b=boxOf(r),w=(b.x2-b.x1)*s,x0=300-w/2-b.x1*s,yb=yb0+li*step,L=300-w/2,R=300+w/2,ink=r.map(i=>({x1:x0+(i.x+i.bb.x1)*s,x2:x0+(i.x+i.bb.x2)*s}));
    art+=`<g transform="translate(${n(x0)} ${n(yb)}) scale(${n(s)})">${r.map(i=>path(i.d,`transform="translate(${n(i.x)} 0)"`)).join('')}</g>`;
    art+=hr(L-34,R+34,yb,1.2)+hr(L-34,R+34,yb-H,1.2)+side('h',R+40,yb-H/2,20,12);
    if(li===0){const yd=yb-H-24;art+=line(`M${n(L)} ${n(yb-H-6)}V${n(yd-6)}M${n(R)} ${n(yb-H-6)}V${n(yd-6)}`,1.2)+hr(L,R,yd,1.2)+arrow(L,yd,1)+arrow(R,yd,-1)+fitText(String(Math.round(w*2.646)/10),'BarlowCondensed',300,yd-12,120,12);}
    // Corrente de cotas: por letra em nomes curtos, por palavra quando a linha passa de 12 letras.
    let parts=ink;
    if(r.length>12){parts=[];let cur=null;r.forEach((g,i)=>{const prev=r[i-1];if(!cur||g.x-(prev.x+prev.adv)>prev.adv*.3)parts.push(cur={...ink[i]});else cur.x2=ink[i].x2;});}
    const yc=yb+24;
    art+=hr(parts[0].x1,parts.at(-1).x2,yc,1.2)+parts.map(q=>line(`M${n(q.x1)} ${n(yc-6)}v12M${n(q.x2)} ${n(yc-6)}v12`,1.2)+fitText(String(Math.round((q.x2-q.x1)*.2646)),'BarlowCondensed',(q.x1+q.x2)/2,yc+13,Math.max(6,q.x2-q.x1-4),9)).join('');
   });
   const top=yb0-H-60,bot=yb0+(k-1)*step+60;
   art+=side(c.topline,60,top,300,14)+hr(60,540,top+14,1)+hr(60,540,bot,1)+small(c.tagline,n(bot+20),340,14)+foot(n(bot+46));
   break;}
  case 'punch-card':{
   const s=plain(c.name),cols=Math.max(12,s.length),cw=Math.min(36,520/cols),rh=14.5,ROWS=['12','11','0','1','2','3','4','5','6','7','8','9'],x0=300-cols*cw/2,shift=Math.floor((cols-s.length)/2),my=228;
   for(let j=0;j<cols;j++){
    const ch=s[j-shift]??' ',holes=hollerith(ch),x=x0+j*cw;
    if(ch.trim())art+=fitText(ch,'BarlowCondensed',x+cw/2,my-12,cw*.8,9);
    ROWS.forEach((row,i)=>{const y=my+i*rh;if(holes.includes(row))art+=`<rect x="${n(x+cw*.28)}" y="${n(y+2)}" width="${n(cw*.44)}" height="${n(rh-4)}" rx="1.5"/>`;else if(i>1)art+=fitText(row,'BarlowCondensed',x+cw/2,y+rh/2,cw*.5,Math.min(7.5,cw*.5));});
   }
   const tw=smallWidth(c.topline,280,15);
   art+=hr(x0,x0+cols*cw,my-22,1.2)+hr(x0,x0+cols*cw,my+12*rh+4,1.2)+small(c.topline,52,280,15)+(none?'':accent(n(300-tw/2-18),52,7)+accent(n(300+tw/2+18),52,7))
    +fitText(c.name,c.font,300,130,500*factor,96*factor,{uppercase:true,spacing:4+sp})+small(c.tagline,n(my+12*rh+30),360,14);
   break;}
  case 'bleed-crop':{
   const X1=300-240*factor,X2=300+240*factor,b=nameBlock(c.name,c.font,(X2-X1)*1.14,400*factor,{maxLines:3,gap:6,o});
   const vis=b.height-b.lh*.24,Y1=250-vis/2,Y2=250+vis/2,frame=rect(X1,Y1,X2-X1,Y2-Y1),tw=smallWidth(c.tagline,380,14);
   art=side(c.topline,X1,Y1-22,300,14)+`<rect x="${n(X1)}" y="${n(Y1)}" width="${n(X2-X1)}" height="${n(Y2-Y1)}" fill="none" stroke="currentColor" stroke-width="5"/>`
    +within(drawBlock(b,c.font,300,Y1-b.lh*.14+b.height/2,o),frame)+side(c.tagline,X2,Y2+24,380,14,-1)+(none?'':accent(n(X2-tw-18),n(Y2+24),7));
   break;}
  case 'knockout-band':{
   const b=nameBlock(c.name,c.font,440*factor,250*factor,{maxLines:3,gap:16,maxLine:190*factor,o}),cy=250,name=drawBlock(b,c.font,300,cy,o);
   const bands=b.lines.map((_,i)=>rect(40,cy-b.height/2+b.lh/2+i*(b.lh+b.gap)-b.lh*.23,520,b.lh*.46)).join('');
   art=small(c.topline,n(cy-b.height/2-30),300,15)+cut(name,bands)+cut(bands,name)+small(c.tagline,n(cy+b.height/2+32),360,15)+foot(n(cy+b.height/2+60));
   break;}
  case 'playing-card':{
   const po={spacing:1+sp},b=nameBlock(c.name,c.font,420*factor,150*factor,{maxLines:2,gap:4,maxLine:120*factor,o:po}),half=drawBlock(b,c.font,300,222-b.height/2,po);
   const tw=Math.min(240,smallWidth(c.topline,240,15)),tag=fitText(c.tagline,'BarlowCondensed',0,0,330,13,SM);
   art=half+rotated(half,300,250,180)+fitText(c.topline,'BarlowCondensed',300,250,240,15,SM)+hr(none?70:94,300-tw/2-14,250)+hr(300+tw/2+14,none?530:506,250)
    +`<g transform="translate(40 250) rotate(-90)">${tag}</g><g transform="translate(560 250) rotate(90)">${tag}</g>`+(none?'':accent(78,250,8)+accent(522,250,8));
   break;}
  case 'perspective':{
   const ws=words(c.name),len=String(c.name).length,k=Math.min(ws.length,len<=10?1:len<=22?2:3),lines=partition(ws,k).map(s=>s.toUpperCase()),f=getFont(c.font);
   // Plano em trapézio: largura Wb na base (y=yB) e Wt no topo (y=yT), com o ponto de fuga acima.
   const Wb=560*factor,Wt=170*factor,yB=410,yT=150,a=Wb/Wt-1,yH=(yT*(1+a)-yB)/a,D=(yB-yH)*a,map=(U,T)=>{const z=1+a*T/D;return [300+(U-Wb/2)/z,yH+(yB-yH)/z];};
   let T=0;
   for(const s of [...lines].reverse()){
    const g=f.getPath(s,0,0,100,{letterSpacing:.02+sp/100}),bb=g.getBoundingBox(),sx=(Wb-30)/(bb.x2-bb.x1),sy=Math.min(sx*2.6,D*.62/k/(bb.y2-bb.y1)),ox=Wb/2-sx*(bb.x1+bb.x2)/2,oy=T-sy*bb.y2;
    art+=project(g.commands,(x,y)=>map(ox+x*sx,oy-y*sy));T+=sy*(bb.y2-bb.y1)*1.12;
   }
   const top=map(0,T)[1];
   art+=small(c.topline,n(top-26),300,16)+hr(60,540,top-8,1.6)+small(c.tagline,n(yB+30),360,14)+foot(n(yB+56));
   break;}
  case 'book-spines':{
   // Nome de uma palavra só ganha os outros dois textos como lombadas vizinhas, mais finas.
   let ws=words(c.name);const alone=ws.length===1;if(alone)ws=[c.topline,c.name,c.tagline].filter(s=>String(s).trim());
   const H=(alone?330:290)*factor,th=ws.map(w=>{const r=fittedTextBounds(w,c.font,1e6,100,o);return Math.min(140,H*r.height/r.width)*(alone&&w!==c.name?.55:1);});
   const g=10,tot=th.reduce((a,b)=>a+b,0)+g*(ws.length-1),k=Math.min(1,500/tot),cy=alone?240:250;let x=300-tot*k/2;
   ws.forEach((w,i)=>{const t=th[i]*k;art+=`<g transform="translate(${n(x+t/2)} ${n(cy)}) rotate(${i%2?90:-90})">${fitText(w,c.font,0,0,H,t,o)}</g>`;if(i)art+=line(`M${n(x-g/2)} ${n(cy-H/2)}V${n(cy+H/2)}`,1.6);x+=t+g;});
   art+=hr(300-tot*k/2-14,300+tot*k/2+14,cy+H/2+10,5)+foot(n(cy+H/2+(alone?36:62)));
   if(!alone)art+=small(c.topline,n(cy-H/2-22),300,15)+small(c.tagline,n(cy+H/2+36),360,14);
   break;}
  case 'halftone':{
   const b=nameBlock(c.name,c.font,500*factor,230*factor,{maxLines:3,gap:10,maxLine:170*factor,o}),cy=250,name=drawBlock(b,c.font,300,cy,o);
   const W=Math.max(...b.widths),x1=300-W/2,x2=300+W/2,y1=cy-b.height/2,y2=cy+b.height/2,pitch=Math.max(6.5,Math.min(13,b.lh/9)),R=Math.hypot(W,b.height)/2+pitch;let dots='';
   // Grade a 45°: o raio cresce da esquerda (quase nada) para a direita (pontos se tocando).
   for(let i=-R;i<=R;i+=pitch)for(let j=-R;j<=R;j+=pitch){
    const x=300+(i-j)*Math.SQRT1_2,y=cy+(i+j)*Math.SQRT1_2;if(x<x1-pitch||x>x2+pitch||y<y1-pitch||y>y2+pitch)continue;
    dots+=`<circle cx="${n(x)}" cy="${n(y)}" r="${n(pitch*(.1+.62*Math.max(0,Math.min(1,(x-x1)/W))))}"/>`;
   }
   art=small(c.topline,n(y1-30),300,15)+within(dots,name)+stroked(name,Math.max(1.4,b.lh/70))+small(c.tagline,n(y2+32),360,15)+foot(n(y2+60));
   break;}
  case 'triline':{
   const to={uppercase:true,spacing:10+sp*2},b=nameBlock(c.name,c.font,470*factor,230*factor,{maxLines:3,gap:22,maxLine:180*factor,o:to}),cy=250,name=drawBlock(b,c.font,300,cy,to),L=b.lh;
   art=small(c.topline,n(cy-b.height/2-34),300,15)+cut(stroked(name,L*.15),stroked(name,L*.085))+stroked(name,Math.max(1,L*.022))+small(c.tagline,n(cy+b.height/2+36),380,15)+foot(n(cy+b.height/2+64));
   break;}
  case 'label-tape':{
   const strips=[];for(const w of words(c.name)){const last=strips.at(-1);if(last&&(last+' '+w).length<=11)strips[strips.length-1]=last+' '+w;else strips.push(w);}
   const tr=sp*.03,lines=strips.slice(0,4),cap=Math.min(70*factor,500*factor/Math.max(...lines.map(s=>tapeWidth(s,1,tr))),230/(lines.length*2.35)),hs=hash(c.name),tot=lines.length*cap*2.35,y0=245-tot/2+cap*1.17;
   art=lines.map((s,i)=>tape(s,300+((hs>>(i*2+1))%5-2)*8,y0+i*cap*2.35,cap,((hs>>(i*3))%7-3)*.9,c.font,tr)).join('');
   const tc=Math.min(14,280/tapeWidth(c.topline,1)),bc=Math.min(12,520/tapeWidth(c.tagline,1)),bottom=y0+tot-cap*1.17+bc*2.4;
   art+=tape(c.topline,240,y0-cap*1.17-tc*2.2,tc,-2,c.font)+tape(c.tagline,300,bottom,bc,1,c.font)+foot(n(bottom+bc+24));
   break;}
  case 'jersey-number':{
   const digits=(String(c.topline).match(/\d+/g)??[]).join(''),num=digits?String(+digits.slice(-2)):String(plain(c.name).replace(/[^A-Z]/g,'').length%98+1);
   const fig=fitText(num,'Bungee',300,312,(num.length>1?280:160)*factor,170*factor,{spacing:6}),tw=smallWidth(c.topline,240,14);
   art=small(c.topline,60,240,14)+(none?'':accent(n(300-tw/2-18),60,7)+accent(n(300+tw/2+18),60,7))+arcText(c.name,300,470,290,{size:50*factor,spacing:4+sp,maxAngle:1.1,font:c.font})
    +fig+cut(stroked(fig,26),stroked(fig,13))+small(c.tagline,440,300,15);
   break;}
  case 'price-sign':{
   const ws=words(c.name);let main=c.name,sup='';
   if(ws.length>1){main=ws.slice(0,-1).join(' ');sup=ws.at(-1);}else if(String(c.name).length>=5){main=c.name.slice(0,-2);sup=c.name.slice(-2);}
   const rm=width(main,c.font,100)/100,rs=sup?width(sup,c.font,100)/100*.45:0,H=Math.min(200*factor,500*factor/(rm+rs+(sup?.06:0))),gap=H*.06,x0=300-(rm*H+(sup?gap+rs*H:0))/2,top=262-H/2;
   art=fitText(main,c.font,x0+rm*H/2,262,1e6,H,o);
   if(sup){const sx=x0+rm*H+gap;art+=fitText(sup,c.font,sx+rs*H/2,top+H*.225,1e6,H*.45,o)+rect(sx,top+H*.5,rs*H,H*.055);}
   const band=rect(40,60,520,52),stars=none?'':accent(70,86,9)+accent(530,86,9);
   art+=cut(band,fitText(c.topline,c.font,300,86,420,34,{uppercase:true,spacing:6})+stars)+hr(40,560,top+H+28,3)+small(c.tagline,n(top+H+56),400,16);
   break;}
  case 'shopfront':{
   const b=nameBlock(c.name,c.font,520*factor,190*factor,{maxLines:2,gap:12,maxLine:150*factor,o}),cy=262,stretch=w=>Math.min(1.6,520*factor/w);
   const name=b.lines.map((s,i)=>`<g transform="translate(300 0) scale(${n(stretch(b.widths[i]))} 1) translate(-300 0)">${fitText(s,c.font,300,cy-b.height/2+b.lh/2+i*(b.lh+b.gap),1e6,b.lh,o)}</g>`).join('');
   const left=300-Math.max(...b.widths.map(w=>w*stretch(w)))/2,top=cy-b.height/2,th=Math.max(36,Math.min(70,b.lh*.62)),tw=Math.min(260,width(c.topline,'Lobster',th,{}));
   const script=rotated(fitText(c.topline,'Lobster',left+tw/2-4,top-th*.42,tw,th),left+tw/2,top,-7);
   const bot=cy+b.height/2+34,tl=Math.min(400,smallWidth(c.tagline,400,15)),pad=none?16:40;
   art=cut(name,script+stroked(script,16))+script+hr(300-tl/2-pad,300+tl/2+pad,bot-18)+hr(300-tl/2-pad,300+tl/2+pad,bot+18)+small(c.tagline,bot,400,15)+(none?'':accent(n(300-tl/2-24),bot,6)+accent(n(300+tl/2+24),bot,6));
   break;}
 }
 return svgDoc(c.name,p.name,variant,background,art);
}
