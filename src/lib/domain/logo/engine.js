import opentype from 'opentype.js';

export const fonts = [
  {id:'Lobster',name:'Lobster',style:'Script • encorpada'},
  {id:'OleoScript',name:'Oleo Script Bold',style:'Script • retrô'},
  {id:'KaushanScript',name:'Kaushan Script',style:'Pincel • expressiva'},
  {id:'Yellowtail',name:'Yellowtail',style:'Script • gestual'},
  {id:'Pacifico',name:'Pacifico',style:'Script • arredondada'},
  {id:'PirataOne',name:'Pirata One',style:'Gótica • streetwear'},
  {id:'AlfaSlabOne',name:'Alfa Slab One',style:'Slab • robusta'},
  {id:'Bungee',name:'Bungee',style:'Display • urbana'},
  {id:'BebasNeue',name:'Bebas Neue',style:'Condensada • alta'},
  {id:'BarlowCondensed',name:'Barlow Condensed Bold',style:'Condensada • sólida'},
  {id:'Oswald',name:'Oswald',style:'Sans serif • clássica'},
];
const template=(id,name,category,font,desc,options={})=>({id,name,category,font,desc,...options});
export const templates = [
  template('gothic','Blackletter','Lettering','PirataOne','Gótica compacta com estrelas e assinatura em arco.'),
  template('rosette','Quality rosette','Selos','BarlowCondensed','Borda ondulada, anel escuro e núcleo claro.'),
  template('stamp','Workshop stamp','Selos','BarlowCondensed','Selo tipográfico com anel pontilhado e duas linhas centrais.'),
  template('coin','Founders seal','Selos','AlfaSlabOne','Anel pontilhado, estrela e duas palavras empilhadas.'),
  template('hex-solid','Hexagon solid','Emblemas','BarlowCondensed','Hexágono preenchido, faixa clara e textos vazados.'),
];

const loaded={};
let serial=0;
export function registerFont(id,buffer){loaded[id]=opentype.parse(buffer);}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const n=x=>Number(x.toFixed(3));
const path=(d,attrs='')=>`<path d="${d}" ${attrs}/>`;
const outline=(d,w=2)=>path(d,`fill="none" stroke="currentColor" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`);
const circle=(x,y,r,w=2)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="currentColor" stroke-width="${w}"/>`;
const solidCircle=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}"/>`;
function getFont(id){return loaded[id]||loaded.BarlowCondensed||loaded.BebasNeue;}
function textPath(text,fontId,spacing=0){
  if(!String(text).trim())return null;
  const font=getFont(fontId);if(!font)throw new Error('Carregue as fontes antes de renderizar.');
  const p=font.getPath(String(text),0,0,100,{letterSpacing:spacing/100});
  const b=p.getBoundingBox();return {p,b,w:b.x2-b.x1,h:b.y2-b.y1};
}
/** Fit actual glyph contours into a reserved rectangle, preserving aspect ratio. */
export function fitText(text,fontId,x,y,w,h,{spacing=0,scale=1,uppercase=false}={}){
  const shape=textPath(uppercase?String(text).toUpperCase():text,fontId,spacing);if(!shape)return '';
  const {p,b}=shape;
  const s=Math.min(w/Math.max(1,shape.w),h/Math.max(1,shape.h))*Math.min(1,scale);
  return path(p.toPathData(3),`transform="translate(${n(x)},${n(y)}) scale(${n(s)}) translate(${n(-(b.x1+b.x2)/2)},${n(-(b.y1+b.y2)/2)})"`);
}
/** Measure fitted contours so neighbouring ornaments share the same spacing. */
export function fittedTextBounds(text,fontId,w,h,{spacing=0,uppercase=false}={}){
  const shape=textPath(uppercase?String(text).toUpperCase():text,fontId,spacing);
  if(!shape)return {width:0,height:0};
  const scale=Math.min(w/Math.max(1,shape.w),h/Math.max(1,shape.h));
  return {width:shape.w*scale,height:shape.h*scale};
}
/** Each letter is a vector contour placed tangentially on a circular baseline. */
export function arcText(text,cx,cy,r,{bottom=false,size=24,spacing=2.4,maxAngle=2.7,font='BarlowCondensed'}={}){
  if(!String(text).trim())return '';
  const f=getFont(font);const glyphs=f.stringToGlyphs(String(text).toUpperCase());
  const widths=glyphs.map((g,i)=>(g.advanceWidth||f.unitsPerEm/2)/f.unitsPerEm*size+(i<glyphs.length-1?f.getKerningValue(g,glyphs[i+1])/f.unitsPerEm*size+spacing:0));
  const sum=widths.reduce((a,b)=>a+b,0);const scale=Math.min(1,r*maxAngle/Math.max(1,sum));
  let cursor=-sum*scale/2;
  return glyphs.map((g,i)=>{
    const advance=(g.advanceWidth||f.unitsPerEm/2)/f.unitsPerEm*size*scale;
    const angle=(cursor+advance/2)/r;cursor+=widths[i]*scale;
    const x=cx+Math.sin(angle)*r;const y=cy+(bottom?1:-1)*Math.cos(angle)*r;
    return path(g.getPath(-advance/2,0,size*scale).toPathData(3),`transform="translate(${n(x)},${n(y)}) rotate(${n(angle*180/Math.PI*(bottom?-1:1))})"`);
  }).join('');
}
function splitName(name,font){
  const words=String(name).trim().split(/\s+/);if(words.length<2)return [name,''];
  let best=1,score=Infinity;
  for(let i=1;i<words.length;i++){
    const a=textPath(words.slice(0,i).join(' '),font)?.w||1;
    const b=textPath(words.slice(i).join(' '),font)?.w||1;
    if(Math.abs(Math.log(a/b))<score){score=Math.abs(Math.log(a/b));best=i;}
  }
  return [words.slice(0,best).join(' '),words.slice(best).join(' ')];
}
function star(x,y,r=10){
  const pts=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5;const radius=i%2?r*.43:r;return `${n(x+Math.cos(a)*radius)},${n(y+Math.sin(a)*radius)}`;});
  return `<polygon points="${pts.join(' ')}"/>`;
}
function stars(x,y,count=3,r=8,gap=26){return Array.from({length:count},(_,i)=>star(x+(i-(count-1)/2)*gap,y,r)).join('');}
function mountains(x=300,y=174,w=112){
  return `<g transform="translate(${x-w/2},${n(y-34*w/112)}) scale(${w/112})">${path('M0 68 38 0 67 43 83 19 112 68H0ZM38 15 24 41 37 33 46 39ZM83 32 71 52 83 44 92 51Z','fill-rule="evenodd"')}</g>`;
}
function crown(x=300,y=146,w=75){return `<g transform="translate(${x-w/2},${y-31}) scale(${w/75})">${path('M7 11 24 27 37.5 0 51 27 68 11 61 48H14ZM14 53H61V60H14Z')}${solidCircle(7,8,4)}${solidCircle(37.5,0,4)}${solidCircle(68,8,4)}</g>`;}
function ornament(kind,x,y,{r=9,count=3}={}){
  if(kind==='none')return '';
  if(kind==='diamond')return path(`M${x} ${y-10}l10 10-10 10-10-10Z`)+outline(`M${x-45} ${y}h26m38 0h26`,1.5);
  if(kind==='mountain')return mountains(x,y+10,80);
  return stars(x,y,count,r);
}
function rosette(cx,cy,r,lobes=16,depth=7){
  const points=Array.from({length:lobes*24},(_,i)=>{const a=i*Math.PI*2/(lobes*24);const radius=r+depth*(1+Math.cos(lobes*a))/2;return `${n(cx+Math.cos(a)*radius)},${n(cy+Math.sin(a)*radius)}`;});
  return `<polygon points="${points.join(' ')}"/>`;
}
function rays(cx,cy,inner,outer,count=64){return Array.from({length:count},(_,i)=>{const a=i*Math.PI*2/count;const r=i%2?outer-15:outer;return outline(`M${n(cx+Math.cos(a)*inner)} ${n(cy+Math.sin(a)*inner)}L${n(cx+Math.cos(a)*r)} ${n(cy+Math.sin(a)*r)}`,i%2?1:1.6);}).join('');}
function knockout(shape,holes){
  const id=`mono-cut-${++serial}`;
  return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="500"><rect width="600" height="500" fill="white"/><g fill="black" color="black">${holes}</g></mask></defs><g mask="url(#${id})">${shape}</g>`;
}
const rect=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
const hex='M300 73 457 162V338L300 427 143 338V162Z';
const hexInner='M300 85 446 169V331L300 415 154 331V169Z';
const shield='M300 72 443 112V286Q443 373 300 431Q157 373 157 286V112Z';
const shieldInner='M300 85 431 121V286Q431 364 300 417Q169 364 169 286V121Z';
function ribbon(y=250,width=464,height=84){
  const x=300-width/2;const half=height/2;
  return path(`M${x} ${y-half+9}h42v${height-18}H${x}l20-${half-9}Z M${600-x} ${y-half+9}h-42v${height-18}h42l-20-${half-9}Z`)+
    outline(`M${x+42} ${y+half-9}l18 13v-22M${558-x} ${y+half-9}l-18 13v-22`,2)+
    rect(x+24,y-half,width-48,height);
}
function laurel(side){return `<g transform="${side===1?'translate(600,0) scale(-1,1)':''}">${outline('M215 383Q118 290 184 157',2.5)}${Array.from({length:9},(_,i)=>{const a=i*.13;const x=154+Math.pow(i-4,2)*2;const y=186+i*20;return `<g transform="translate(${x},${y}) rotate(${-42+i*9})">${path('M0 0Q-31-7-25-30Q-8-29 0 0ZM4 6Q11-24 32-19Q35-3 4 6Z')}</g>`;}).join('')}</g>`;}
function palm(x,y,scale=1,flip=1){return `<g transform="translate(${x},${y}) scale(${scale*flip},${scale})">${path('M-4 91Q8 45 0 0L6-2Q17 47 5 91ZM3 2Q-13-36-41-20Q-17-20-4 1Q-38-20-53 6Q-25-2-5 6Q-36 2-37 28Q-20 9-3 7Q4-35 26-35Q11-14 8 1Q35-24 49-3Q27-8 9 7Q45-1 45 22Q22 8 9 11Z')}</g>`;}

export function renderLogo(config={},variant='light',background=true){
  const c={name:'Wild Coast',tagline:'INDEPENDENT GOODS',topline:'EST. 2026',font:'PirataOne',template:'gothic',ornament:'stars',size:100,spacing:0,tilt:-6,...config};
  const t=templates.find(t=>t.id===c.template)||templates[0];
  const fg=variant==='dark'?'#ffffff':'#191a18';const bg=variant==='dark'?'#191a18':'#ffffff';
  const scale=Math.min(1,c.size/100);const wScale=c.size/100;
  const name=(x,y,w,h,upper=false)=>fitText(c.name,c.font,x,y,w*Math.min(1.1,wScale),h*Math.min(1.1,wScale),{spacing:c.spacing,scale,uppercase:upper});
  const small=(text,y,w=300,h=18)=>fitText(text,'BarlowCondensed',300,y,w,h,{spacing:3,uppercase:true});
  const topArc=(r=148,size=24)=>arcText(c.topline,300,250,r,{size});
  const bottomArc=(r=157,size=22)=>arcText(c.tagline,300,250,r,{bottom:true,size,maxAngle:2.7});
  const deco=(y,r=9,count=3)=>ornament(c.ornament,300,y,{r,count});
  const [first,second]=splitName(c.name,c.font);
  const stack=(y,w,h,upper=false,gap=6)=>second?
    fitText(first,c.font,300,y-h/2-gap/2,w,h,{spacing:c.spacing,scale,uppercase:upper})+
    fitText(second,c.font,300,y+h/2+gap/2,w,h,{spacing:c.spacing,scale,uppercase:upper}):name(300,y,w,h*1.45,upper);
  const tilt=art=>`<g transform="rotate(${t.tilt?c.tilt:0},300,250)">${art}</g>`;
  const swoosh=(y=310)=>path(`M89 ${y+25}Q243 ${y-22} 508 ${y-11}Q390 ${y-3} 254 ${y+10}L93 ${y+35}Z`);
  let art='';
  switch(t.id){
    case 'gothic':
      art=small(c.topline,131,260,18)+name(300,248,453,171,true)+deco(367,9,5)+bottomArc(172,19);break;
    case 'rosette':
      art=knockout(rosette(300,250,169,16,11),solidCircle(300,250,151))+circle(300,250,144,2)+
        topArc(123,21)+bottomArc(132,20)+stack(245,235,43,true,6)+outline('M247 311H353',1.3)+deco(170,7);break;
    case 'stamp':
      art=circle(300,250,177,4)+`<circle cx="300" cy="250" r="161" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="1 8" stroke-linecap="round"/>`+circle(300,250,145,1.4)+topArc(123,21)+bottomArc(135,19)+stack(256,245,53,true,8)+deco(159,6)+outline('M224 330H376',1.5);break;
    case 'coin':
      art=circle(300,250,177,5)+circle(300,250,165,1)+`<circle cx="300" cy="250" r="157" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2 6"/>`+topArc(130,20)+bottomArc(142,18)+stack(263,249,57,true,9)+deco(164,10,1)+outline('M241 336H359',2);break;
    case 'hex-solid':
      art=knockout(path(hex),outline(hexInner,2)+rect(112,211,376,83)+small(c.topline,142,205,18)+deco(174,8)+small(c.tagline,339,233,19)+deco(373,6,1))+outline('M110 213H490V292H110Z',3)+name(300,253,345,48,true);break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" viewBox="0 0 600 500" role="img" aria-label="${esc(c.name)}" style="color:${fg}"><title>${esc(c.name)} — ${variant==='dark'?'versão escura':'versão clara'}</title>${background?`<rect width="600" height="500" fill="${bg}"/>`:''}<g fill="${fg}" color="${fg}">${art}</g></svg>`;
}
