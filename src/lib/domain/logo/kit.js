import {fitText,arcText,fittedTextBounds} from './engine.js';

// Primitivas compartilhadas pelas rodadas de propostas: pesos, formas, ornamentos e textos.
// Canvas de 600 × 500 com centro em (300, 250).
export const weight={frame:8,mid:5,inset:3.2,detail:2.5};
export const n=x=>Number(x.toFixed(2));
export const path=(d,a='')=>`<path d="${d}" ${a}/>`;
export const line=(d,w=weight.frame)=>path(d,`fill="none" stroke="currentColor" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="butt"`);
export const circle=(r,w=weight.frame,extra='')=>`<circle cx="300" cy="250" r="${r}" fill="none" stroke="currentColor" stroke-width="${w}" ${extra}/>`;
export const dotted=(r,w=weight.detail)=>circle(r,w,'stroke-dasharray="2 6"');
export const dottedLine=(d,w=weight.inset)=>path(d,`fill="none" stroke="currentColor" stroke-width="${w}" stroke-dasharray="2 6" stroke-linecap="round"`);
export const disc=r=>`<circle cx="300" cy="250" r="${r}"/>`;
export const ellipse=(rx,ry,w=weight.frame)=>`<ellipse cx="300" cy="250" rx="${rx}" ry="${ry}" fill="none" stroke="currentColor" stroke-width="${w}"/>`;
export const solidEllipse=(rx,ry)=>`<ellipse cx="300" cy="250" rx="${rx}" ry="${ry}"/>`;
export const star=(x,y,r=10)=>`<polygon points="${Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,s=i%2?r*.44:r;return `${n(x+Math.cos(a)*s)},${n(y+Math.sin(a)*s)}`;}).join(' ')}"/>`;
const stars=y=>star(258,y,9)+star(300,y,13)+star(342,y,9);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const poly=pts=>'M'+pts.map(([x,y])=>`${n(x)} ${n(y)}`).join('L')+'Z';
const rad=d=>d*Math.PI/180;
const onCircle=(r,deg,cy=250)=>[300+Math.cos(rad(deg))*r,cy+Math.sin(rad(deg))*r];

let serial=0;
// Vazado real: o que está em `holes` some de `shape`, mantendo a transparência.
export function cut(shape,holes){const id=`kit-cut-${++serial}`;return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="500"><rect width="600" height="500" fill="white"/><g fill="black" color="black">${holes}</g></mask></defs><g mask="url(#${id})">${shape}</g>`;}
export const svgDoc=(name,title,variant,background,art)=>{
 const fg=variant==='dark'?'#ffffff':'#191a18',bg=variant==='dark'?'#191a18':'#ffffff';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" viewBox="0 0 600 500" role="img" aria-label="${esc(name)}" style="color:${fg}"><title>${esc(title)} — ${variant==='dark'?'escura':'clara'}</title>${background?`<rect width="600" height="500" fill="${bg}"/>`:''}<g fill="${fg}" color="${fg}">${art}</g></svg>`;
};

// ---------- formas ----------
export const regular=(sides,r,offset=0)=>poly(Array.from({length:sides},(_,i)=>onCircle(r,offset*180/Math.PI+i*360/sides)));
export const hex='M300 76 460 165V335L300 424 140 335V165Z';
export const hexInset='M300 87.44 450 170.88V329.12L300 412.56 150 329.12V170.88Z';
export const wideHex='M150 160H450L515 250 450 340H150L85 250Z';
export const wideHexInset='M156.6 172H443.4L500.2 250 443.4 328H156.6L99.8 250Z';
export const shield='M300 72 443 112V286Q443 373 300 431Q157 373 157 286V112Z';
export const shieldInset='M300 84.5 431 121.1V286Q431 364.5 300 417.8Q169 364.5 169 286V121.1Z';
export const roundShield='M160 85H440V265Q440 395 300 432Q160 395 160 265Z';
export const roundShieldInset='M172 97H428V265Q428 385 300 419.5Q172 385 172 265Z';
export const bow='M110 226Q300 186 490 226L484 315Q300 275 116 315Z';
export const plate='M117 204H483L510 250 483 296H117L90 250Z';
export const slimPlate='M128 216H472L500 250 472 284H128L100 250Z';
export const ticket='M156 95H444L470 121V379L444 405H156L130 379V121Z';
export const ticketInset='M161 107H439L458 126V374L439 393H161L142 374V126Z';
export const notchedBand='M96 212H504L488 252 504 292H96L112 252Z';
export const diamondShape='M300 70 470 250 300 430 130 250Z';
export const diamondInset='M300 86.5 453.5 250 300 413.5 146.5 250Z';
export const archShape='M160 410V240A140 140 0 0 1 440 240V410Z';
export const archInset='M172 398V240A128 128 0 0 1 428 240V398Z';
export const roundRect=(x,y,w,h,r)=>`M${x+r} ${y}H${x+w-r}A${r} ${r} 0 0 1 ${x+w} ${y+r}V${y+h-r}A${r} ${r} 0 0 1 ${x+w-r} ${y+h}H${x+r}A${r} ${r} 0 0 1 ${x} ${y+h-r}V${y+r}A${r} ${r} 0 0 1 ${x+r} ${y}Z`;
// Cantos côncavos (recorte de um quarto de círculo em cada canto).
export const notchedRect=(x,y,w,h,r)=>`M${x+r} ${y}H${x+w-r}A${r} ${r} 0 0 0 ${x+w} ${y+r}V${y+h-r}A${r} ${r} 0 0 0 ${x+w-r} ${y+h}H${x+r}A${r} ${r} 0 0 0 ${x} ${y+h-r}V${y+r}A${r} ${r} 0 0 0 ${x+r} ${y}Z`;
export function rosette(r=169,lobes=16,depth=11,cy=250){
 return poly(Array.from({length:lobes*24},(_,i)=>{const a=i*Math.PI*2/(lobes*24),radius=r+depth*(1+Math.cos(lobes*a))/2;return [300+Math.cos(a)*radius,cy+Math.sin(a)*radius];}));
}
export function burst(points=28,outer=182,inner=166){
 return poly(Array.from({length:points*2},(_,i)=>{const a=-Math.PI/2+i*Math.PI/points,r=i%2?inner:outer;return [300+Math.cos(a)*r,250+Math.sin(a)*r];}));
}
export function gear(teeth=30,outer=182,inner=166){
 const pts=[];
 for(let i=0;i<teeth;i++){const a=360/teeth,b=i*a-90;pts.push(onCircle(inner,b),onCircle(inner,b+a*.22),onCircle(outer,b+a*.32),onCircle(outer,b+a*.68),onCircle(inner,b+a*.78));}
 return poly(pts);
}
// Setor de anel entre r1 e r2, de a0 a a1 graus (sentido horário, 0° à direita).
export function sector(r1,r2,a0,a1){
 const [ox0,oy0]=onCircle(r2,a0),[ox1,oy1]=onCircle(r2,a1),[ix1,iy1]=onCircle(r1,a1),[ix0,iy0]=onCircle(r1,a0),large=a1-a0>180?1:0;
 return `M${n(ox0)} ${n(oy0)}A${r2} ${r2} 0 ${large} 1 ${n(ox1)} ${n(oy1)}L${n(ix1)} ${n(iy1)}A${r1} ${r1} 0 ${large} 0 ${n(ix0)} ${n(iy0)}Z`;
}
// Faixa horizontal recortada pelo círculo de raio r.
export function chordBand(r,y0,y1){
 const h0=Math.sqrt(r*r-(y0-250)**2),h1=Math.sqrt(r*r-(y1-250)**2);
 return `M${n(300-h0)} ${y0}H${n(300+h0)}A${r} ${r} 0 0 1 ${n(300+h1)} ${y1}H${n(300-h1)}A${r} ${r} 0 0 1 ${n(300-h0)} ${y0}Z`;
}

// ---------- faixas ----------
// Todos os polígonos de uma faixa giram no mesmo sentido; senão, frente e pontas
// sobrepostas se cancelam quando a área é usada como recorte.
const orient=pts=>pts.reduce((s,[x,y],i)=>{const [X,Y]=pts[(i+1)%pts.length];return s+x*Y-X*y;},0)<0?[...pts].reverse():pts;
// Faixa reta com pontas dobradas para trás, em contorno.
export function folded(y,x0,x1,h=72){
 const top=y-h/2,bottom=y+h/2,drop=18,reach=34;
 const front=`M${x0} ${top}H${x1}V${bottom}H${x0}Z`;
 const tails=poly(orient([[x0+drop,top+drop],[x0-reach,top+drop],[x0-reach+18,y+drop],[x0-reach,bottom+drop],[x0+drop,bottom+drop]]))+
  poly(orient([[x1-drop,top+drop],[x1+reach,top+drop],[x1+reach-18,y+drop],[x1+reach,bottom+drop],[x1-drop,bottom+drop]]));
 const folds=path(`M${x0} ${bottom}L${x0+drop} ${bottom+drop}V${bottom}Z`)+path(`M${x1} ${bottom}L${x1-drop} ${bottom+drop}V${bottom}Z`);
 return {front,area:front+tails,art:cut(line(tails),path(front))+line(front)+folds};
}
// Faixa reta sólida com pontas dobradas; o texto entra vazado na frente.
export function solidFolded(y,x0,x1,h,text){
 const top=y-h/2,bottom=y+h/2,drop=14,reach=30;
 const front=`M${x0} ${top}H${x1}V${bottom}H${x0}Z`;
 const tails=poly(orient([[x0+drop,top+drop],[x0-reach,top+drop],[x0-reach+14,y+drop],[x0-reach,bottom+drop],[x0+drop,bottom+drop]]))+
  poly(orient([[x1-drop,top+drop],[x1+reach,top+drop],[x1+reach-14,y+drop],[x1+reach,bottom+drop],[x1-drop,bottom+drop]]));
 const gapRing=path(front,'stroke="black" stroke-width="10"');
 const folds=path(`M${x0+2} ${bottom+4}L${x0+drop} ${bottom+drop}V${bottom+4}Z`)+path(`M${x1-2} ${bottom+4}L${x1-drop} ${bottom+drop}V${bottom+4}Z`);
 return {front,area:front+tails,art:cut(path(tails),gapRing)+folds+cut(path(front),text)};
}
// Faixa em arco (como no Bow hexagon) com pontas dobradas atrás.
export function archedRibbon(y=226,h=89,x0=110,lift=40){
 const x1=600-x0;
 const front=`M${x0} ${y}Q300 ${y-lift} ${x1} ${y}L${x1-6} ${y+h}Q300 ${y+h-lift} ${x0+6} ${y+h}Z`;
 const left=[[x0+30,y+18],[x0-44,y+30],[x0-24,y+h/2+30],[x0-44,y+h+30],[x0+30,y+h+16]];
 const mirror=pts=>pts.map(([x,y])=>[600-x,y]);
 const tails=poly(orient(left))+poly(orient(mirror(left)));
 const fold=[[x0+6,y+h],[x0+30,y+h+16],[x0+30,y+h-6]];
 return {front,area:front+tails,art:cut(line(tails),path(front))+line(front)+path(poly(fold))+path(poly(mirror(fold)))};
}

// ---------- ornamentos ----------
const leaf=(x,y,deg,s=1)=>`<path transform="translate(${n(x)} ${n(y)}) rotate(${n(deg)}) scale(${s})" d="M0 0Q11-10 26-3Q14 8 0 0Z"/>`;
// Ramos de louro simétricos ao longo de um arco (graus no lado esquerdo, de baixo para cima).
export function laurel(r=150,a0=125,a1=232,count=8,s=1,cy=250){
 const stem=Array.from({length:41},(_,i)=>onCircle(r,a0+(a1-a0)*i/40,cy));
 let branch=line('M'+stem.map(([x,y])=>`${n(x)} ${n(y)}`).join('L'),weight.detail);
 for(let i=0;i<count;i++){
  const a=a0+(a1-a0)*(i+.6)/count,[x,y]=onCircle(r,a,cy);
  const tangent=Math.atan2(Math.cos(rad(a)),-Math.sin(rad(a)))*180/Math.PI;
  branch+=leaf(x,y,tangent-40,s)+leaf(x,y,tangent+40,s);
 }
 const [tx,ty]=onCircle(r,a1,cy),tip=Math.atan2(Math.cos(rad(a1)),-Math.sin(rad(a1)))*180/Math.PI;
 branch+=leaf(tx,ty,tip,s);
 return branch+`<g transform="translate(600 0) scale(-1 1)">${branch}</g>`;
}
export function crown(x=300,y=150,w=64){return `<g transform="translate(${n(x-w/2)},${n(y-w*31/75)}) scale(${n(w/75)})">${path('M7 11 24 27 37.5 0 51 27 68 11 61 48H14ZM14 53H61V60H14Z')}<circle cx="7" cy="8" r="4"/><circle cx="37.5" cy="0" r="4"/><circle cx="68" cy="8" r="4"/></g>`;}
export function mountains(x=300,y=150,w=110){return `<g transform="translate(${n(x-w/2)},${n(y-34*w/112)}) scale(${n(w/112)})">${path('M0 68 38 0 67 43 83 19 112 68H0ZM38 15 24 41 37 33 46 39ZM83 32 71 52 83 44 92 51Z','fill-rule="evenodd"')}</g>`;}
// Leque de traços verticais, mais altos no centro (dir −1 sobe, 1 desce).
export function rays(y,count=15,gap=13,maxH=48,dir=-1){
 const k=(count-1)/2;let d='';
 for(let i=0;i<count;i++){const u=(i-k)/k,h=maxH*(1-.6*u*u),x=300+(i-k)*gap;d+=`M${n(x)} ${y}V${n(y+dir*h)}`;}
 return line(d,weight.detail);
}
// Contas sólidas distribuídas ao longo de um círculo.
export function beads(r,count=48,size=4.5){return Array.from({length:count},(_,i)=>{const [x,y]=onCircle(r,i*360/count);return `<circle cx="${n(x)}" cy="${n(y)}" r="${size}"/>`;}).join('');}
// Raios triangulares ao redor do selo, alternando comprimentos.
export function sunRays(r1=150,r2=184,count=32){
 return Array.from({length:count},(_,i)=>{const a=i*360/count,w=180/count*.55,len=i%2?r2-12:r2;return path(poly([onCircle(r1,a-w),onCircle(len,a),onCircle(r1,a+w)]));}).join('');
}
// Ondas horizontais (senoides) entre x0 e x1.
export function wave(y,x0,x1,amp=6,period=32){let d=`M${x0} ${y}`;for(let x=x0;x<x1;x+=period/2){const up=((x-x0)/(period/2))%2===0?-1:1;d+=`Q${n(x+period/4)} ${n(y+up*amp*2)} ${n(Math.min(x+period/2,x1))} ${y}`;}return d;}
// Traços radiais curtos entre dois raios, como uma escala ao redor do selo.
export function ticks(r1,r2,count=72,w=2){let d='';for(let i=0;i<count;i++){const a=i*360/count,[x0,y0]=onCircle(r1,a),[x1,y1]=onCircle(r2,a);d+=`M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;}return line(d,w);}

// Divide o nome em duas linhas de comprimento parecido; uma palavra fica numa linha.
function split(name){
 const words=String(name).trim().split(/\s+/);if(words.length<2)return [String(name).trim(),''];
 let best=1,score=Infinity;
 for(let i=1;i<words.length;i++){const d=Math.abs(words.slice(0,i).join(' ').length-words.slice(i).join(' ').length);if(d<score){score=d;best=i;}}
 return [words.slice(0,best).join(' '),words.slice(best).join(' ')];
}

// Textos e ornamentos que dependem da configuração do usuário.
export function textKit(c){
 const factor=Math.max(.65,Math.min(1.1,Number(c.size)/100));
 const spacing=Number(c.spacing)||0;
 const none=c.ornament==='none';
 const accent=(x,y,r=9)=>none?'':c.ornament==='stars'?star(x,y,r):c.ornament==='mountain'?line(`M${x-9} ${y+6}l9-15 9 15Z`,2):path(`M${x} ${y-8}l8 8-8 8-8-8Z`);
 const topAccent=y=>none?'':c.ornament==='stars'?stars(y):c.ornament==='mountain'?line(`M266 ${y+11}l22-31 18 24 11-17 19 24Z`,3):accent(300,y);
 const foot=y=>none?'':star(300,y,7);
 const row=(y,count=5,r=6,gap=19)=>none?'':Array.from({length:count},(_,i)=>accent(300+(i-(count-1)/2)*gap,y,r)).join('');
 // Ornamentos distribuídos ao longo de um arco do círculo central.
 const arcRow=(r,a0,a1,count=5,size=7)=>none?'':Array.from({length:count},(_,i)=>{const [x,y]=onCircle(r,a0+(a1-a0)*i/(count-1));return accent(x,y,size);}).join('');
 const small=(text,y,w=168,h=15)=>fitText(text,'BarlowCondensed',300,y,w,h,{uppercase:true,spacing:2});
 // Texto curto ladeado por traços, posicionados pela largura medida dos contornos.
 const dashed=(text,y,w=150,h=17)=>{
  const {width}=fittedTextBounds(text,'BarlowCondensed',w,h,{spacing:2,uppercase:true});if(!width)return '';
  const half=width/2;
  return fitText(text,'BarlowCondensed',300,y,w,h,{spacing:2,uppercase:true})+line(`M${n(300-half-33)} ${y}h22M${n(300+half+11)} ${y}h22`,weight.detail);
 };
 // Largura medida de um texto pequeno, para abrir vãos em linhas e molduras.
 const smallWidth=(text,w=220,h=18)=>fittedTextBounds(text,'BarlowCondensed',w,h,{uppercase:true,spacing:2}).width;
 const topArc=(r,size=22,font='BarlowCondensed',cy=250,maxAngle=2.2)=>arcText(c.topline,300,cy,r,{size,spacing:3,maxAngle,font});
 const bottomArc=(r,size=21,font='BarlowCondensed',cy=250,maxAngle=2.4)=>arcText(c.tagline,300,cy,r,{bottom:true,size,spacing:3,maxAngle,font});
 const name=(y,w,h)=>fitText(c.name,c.font,300,y,w*factor,h*factor,{uppercase:true,spacing:1.3+spacing});
 const stack=(y,w,h,gap=8)=>{
  const [a,b]=split(c.name);
  if(!b)return name(y,w,h*1.45);
  const opts={uppercase:true,spacing:1+spacing};
  // Mesma escala nas duas linhas: a mais larga define a altura das duas.
  const k=Math.min(1,w/Math.max(...[a,b].map(t=>fittedTextBounds(t,c.font,1e6,h,opts).width)));
  const lh=h*k;
  return fitText(a,c.font,300,y-(lh+gap)/2,w*factor,lh*factor,opts)+fitText(b,c.font,300,y+(lh+gap)/2,w*factor,lh*factor,opts);
 };
 // Faixas: nomes longos passam para duas linhas em vez de encolher até ficarem ilegíveis.
 const bandName=(y,w,h)=>String(c.name).trim().length>14&&split(c.name)[1]?stack(y,w,h*.46,4):name(y,w,h);
 // Nome curvo sobre a faixa em arco; dy desloca junto com a faixa.
 const arcName=(size=70,dy=0)=>arcText(c.name,300,1477+dy,1200,{size:size*factor,spacing:2+spacing,maxAngle:.285,font:c.font});
 // Nome em arco amplo, no estilo varsity, com a base em y no centro.
 const archedName=(y,size=76,r=450,maxAngle=.7)=>arcText(c.name,300,y+r,r,{size:size*factor,spacing:2+spacing,maxAngle,font:c.font});
 // Nome sem caixa alta, para fontes script.
 const scriptName=(y,w,h)=>fitText(c.name,c.font,300,y,w*factor,h*factor,{spacing});
 // Iniciais das duas primeiras palavras, para monogramas.
 const letters=String(c.name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('');
 const initials=(y,w,h)=>fitText(letters,c.font,300,y,w*factor,h*factor,{uppercase:true,spacing:spacing*2});
 const nameWidth=(w,h)=>fittedTextBounds(c.name,c.font,w*factor,h*factor,{uppercase:true,spacing:1.3+spacing}).width;
 return {factor,none,accent,topAccent,foot,row,arcRow,small,dashed,smallWidth,topArc,bottomArc,name,stack,bandName,arcName,archedName,scriptName,initials,nameWidth};
}
