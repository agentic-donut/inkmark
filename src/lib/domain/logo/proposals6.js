import {weight,n,path,line,circle,dottedLine,disc,cut,svgDoc,poly,regular,hex,hexInset,shield,shieldInset,wideHex,wideHexInset,diamondShape,
 roundRect,rosette,burst,folded,archedRibbon,crown,mountains,star,textKit} from './kit.js';

// Rodada 6: 100 modelos montados por composição. Cada modelo combina uma moldura,
// um tratamento (contorno duplo, pontilhado, sólido, fino ou grosso) e um layout de conteúdo.
// As molduras declaram a área útil (box: topo, base, largura) e onde uma faixa pode atravessar.

const unit=([x,y])=>{const l=Math.hypot(x,y)||1;return [x/l,y/l];};
// Polígono com cantos arredondados por curvas quadráticas.
function roundedPoly(pts,r){
 let d='';
 pts.forEach((p,i)=>{
  const a=pts[(i-1+pts.length)%pts.length],b=pts[(i+1)%pts.length];
  const ua=unit([a[0]-p[0],a[1]-p[1]]),ub=unit([b[0]-p[0],b[1]-p[1]]);
  d+=`${i?'L':'M'}${n(p[0]+ua[0]*r)} ${n(p[1]+ua[1]*r)}Q${n(p[0])} ${n(p[1])} ${n(p[0]+ub[0]*r)} ${n(p[1]+ub[1]*r)}`;
 });
 return d+'Z';
}
const circlePath=r=>`M${300-r} 250A${r} ${r} 0 1 1 ${300+r} 250A${r} ${r} 0 1 1 ${300-r} 250Z`;
const ellipsePath=(rx,ry)=>`M${300-rx} 250A${rx} ${ry} 0 1 1 ${300+rx} 250A${rx} ${ry} 0 1 1 ${300-rx} 250Z`;
function scallopRect(x,y,w,h,s=10){
 const nx=Math.round(w/(2*s)),ny=Math.round(h/(2*s)),dx=w/nx,dy=h/ny;
 let d=`M${x} ${y}`;
 for(let i=0;i<nx;i++)d+=`a${n(dx/2)} ${s} 0 0 1 ${n(dx)} 0`;
 for(let i=0;i<ny;i++)d+=`a${s} ${n(dy/2)} 0 0 1 0 ${n(dy)}`;
 for(let i=0;i<nx;i++)d+=`a${n(dx/2)} ${s} 0 0 1 ${n(-dx)} 0`;
 for(let i=0;i<ny;i++)d+=`a${s} ${n(dy/2)} 0 0 1 0 ${n(-dy)}`;
 return d+'Z';
}
const hexPts=[[300,70],[465,165],[465,335],[300,430],[135,335],[135,165]];
const hexInPts=[[300,84],[453,172],[453,328],[300,416],[147,328],[147,172]];

// ---------- molduras ----------
// box: [topo, base, largura útil]; wb: largura dos textos na base; span: meia largura onde a faixa atravessa;
// round: raio interno para textos curvos.
const F={
 dodeca:{d:regular(12,182,Math.PI/12),inset:regular(12,170,Math.PI/12),box:[105,395,270],round:166,span:176},
 deca:{d:regular(10,184,-Math.PI*2/5),inset:regular(10,172,-Math.PI*2/5),box:[105,395,265],round:162,span:184},
 hepta:{d:regular(7,192,-Math.PI/2),inset:regular(7,178,-Math.PI/2),box:[135,388,230],wb:220,span:176,bandY:262},
 rsquare:{d:roundRect(110,62,380,376,44),inset:roundRect(122,74,356,352,34),box:[95,405,300],span:190},
 squircle:{d:roundRect(80,128,440,244,70),inset:roundRect(92,140,416,220,58),box:[150,350,330],span:220},
 cutsq:{d:poly([[150,62],[450,62],[488,100],[488,400],[450,438],[150,438],[112,400],[112,100]]),inset:poly([[155,74],[445,74],[476,105],[476,395],[445,426],[155,426],[124,395],[124,105]]),box:[95,405,300],span:188},
 longoct:{d:'M150 120H450L520 190V310L450 380H150L80 310V190Z',inset:'M155 132H445L508 195V305L445 368H155L92 305V195Z',box:[140,360,330],span:220},
 rhex:{d:roundedPoly(hexPts,28),inset:roundedPoly(hexInPts,20),box:[125,375,250],wb:200,span:165},
 french:{d:'M165 80H435V250Q435 330 375 370Q330 395 300 430Q270 395 225 370Q165 330 165 250Z',inset:'M177 92H423V250Q423 325 368 360Q326 384 300 414Q274 384 232 360Q177 325 177 250Z',box:[110,368,230],wb:150,span:135,bandY:236},
 kite:{d:'M300 60L455 200L300 440L145 200Z',inset:'M300 78L437 202L300 418L163 202Z',box:[115,375,210],wb:170,span:155,bandY:205},
 keystone:{d:'M140 90H460L410 410H190Z',inset:'M153.6 102H446.4L399.7 398H200.3Z',box:[115,388,250],wb:190,span:140},
 trapezoid:{d:'M190 90H410L460 410H140Z',inset:'M200.3 102H399.7L446.4 398H153.6Z',box:[120,388,210],wb:260,span:140},
 flower:{d:rosette(150,6,32),inset:rosette(138,6,32),box:[110,390,240],round:142,span:182},
 quatre:{d:rosette(130,4,48),inset:rosette(118,4,48),box:[110,390,220],round:122,span:178},
 sheriff:{d:burst(6,190,116),inset:circlePath(106),box:[140,360,190],round:106,span:120,
  decor:[0,1,2,3,4,5].map(i=>{const a=-Math.PI/2+i*Math.PI/3;return `<circle cx="${n(300+Math.cos(a)*190)}" cy="${n(250+Math.sin(a)*190)}" r="13"/>`;}).join('')},
 cdiamond:{d:diamondShape,inset:'M300 86.5 453.5 250 300 413.5 146.5 250Z',box:[150,350,180],round:118,span:170},
 circle:{d:circlePath(176),inset:circlePath(164),box:[100,400,280],round:164,span:176},
 speech:{d:'M130 112H470Q496 112 496 138V322Q496 348 470 348H334L300 398L266 348H130Q104 348 104 322V138Q104 112 130 112Z',
  inset:'M134 124H466Q484 124 484 142V318Q484 336 466 336H328L300 377L272 336H134Q116 336 116 318V142Q116 124 134 124Z',box:[132,330,330],span:196,bandY:230},
 scallop:{d:scallopRect(120,110,360,280,10),inset:'M136 126H464V374H136Z',box:[130,370,300],span:190},
 barrel:{d:'M200 78H400A200 200 0 0 1 400 422H200A200 200 0 0 1 200 78Z',inset:'M205 90H395A188 188 0 0 1 395 410H205A188 188 0 0 1 205 90Z',box:[110,390,300],span:198},
 ovalv:{d:ellipsePath(150,188),inset:ellipsePath(138,176),box:[100,400,220],wb:150,span:150},
 hex:{d:hex,inset:hexInset,box:[120,380,250],wb:200,span:160},
 shield:{d:shield,inset:shieldInset,box:[110,372,230],wb:170,span:143},
 widehex:{d:wideHex,inset:wideHexInset,box:[175,325,330],span:215},
 pill:{d:'M145 175H455A75 75 0 0 1 455 325H145A75 75 0 0 1 145 175Z',inset:'M145 187H455A63 63 0 0 1 455 313H145A63 63 0 0 1 145 187Z',box:[175,325,300],span:230},
 none:{box:[100,400,400],span:210},
};

// ---------- ícones (caixa de 64 unidades) ----------
const icons={
 anchor:`<circle cx="32" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="5"/>${line('M32 14V60M16 24H48M8 40Q10 58 32 60Q54 58 56 40',5)}${path('M2 46 8 34 14 46Z')}${path('M50 46 56 34 62 46Z')}`,
 bolt:path('M38 0 8 36H28L20 64 56 24H34Z'),
 compass:path('M32 0 40 24 64 32 40 40 32 64 24 40 0 32 24 24Z'),
 arrows:line('M8 8 56 56M56 8 8 56M8 8V22M8 8H22M56 8V22M56 8H42',4)+path('M56 56 40 52 52 40Z')+path('M8 56 12 40 24 52Z'),
 heart:path('M32 60Q4 40 4 21Q4 6 18 6Q28 6 32 17Q36 6 46 6Q60 6 60 21Q60 40 32 60Z'),
 leaf:path('M14 52Q2 16 58 4Q62 46 18 56Z')+line('M4 62 30 32',4),
 sun:`<circle cx="32" cy="32" r="13"/>${line('M32 0V12M32 52V64M0 32H12M52 32H64M9 9 17 17M47 47 55 55M55 9 47 17M17 47 9 55',4)}`,
 flame:path('M32 0Q52 24 44 40Q50 34 48 26Q62 42 54 56Q46 66 32 66Q18 66 10 56Q2 42 16 26Q14 34 20 40Q12 24 32 0Z'),
};
const icon=(kind,y,size=60)=>kind==='crown'?crown(300,y+size*.18,size*1.1):kind==='mountain'?mountains(300,y+size*.1,size*1.5):
 `<g transform="translate(${n(300-size/2)} ${n(y-size/2)}) scale(${n(size/64)})">${icons[kind]}</g>`;

// ---------- catálogo ----------
const fontOf={B:'BarlowCondensed',A:'AlfaSlabOne',E:'BebasNeue',O:'Oswald',P:'PirataOne',U:'Bungee'};
// [id, nome, moldura, tratamento, layout, fonte, exemplo, ícone]
const rows=[
 ['dodeca-arcs','Dodecagon seal','dodeca','double','arcs','B','SUMMIT CO'],
 ['dodeca-solid','Solid dodecagon','dodeca','solid','arcs','A','SUMMIT'],
 ['dodeca-plate','Dodecagon plate','dodeca','dotted','plate','E','FOUNDRY'],
 ['dodeca-disc','Dodecagon disc','dodeca','double','disc','A','QUALITY'],
 ['dodeca-compass','Dodecagon compass','dodeca','thin','icon','O','EXPLORER','compass'],
 ['deca-arcs','Decagon seal','deca','double','arcs','O','DECADE'],
 ['deca-solid','Solid decagon','deca','solid','stack','B','NORTH FIELD'],
 ['deca-folded','Decagon ribbon','deca','double','folded','A','ROYAL'],
 ['deca-anchor','Decagon anchor','deca','thin','icon','E','HARBOR','anchor'],
 ['hepta-stack','Heptagon','hepta','double','stack','O','SEVEN SEAS'],
 ['hepta-solid','Solid heptagon','hepta','solid','single','E','PEAK'],
 ['hepta-band','Heptagon band','hepta','dotted','solidband','A','ALPINE'],
 ['rsquare-stack','Rounded square','rsquare','double','stack','B','BOX CO'],
 ['rsquare-solid','Solid rounded square','rsquare','solid','stack','A','CRATE'],
 ['rsquare-dotted','Dotted rounded square','rsquare','dotted','single','E','STUDIO'],
 ['rsquare-ribbon','Rounded square ribbon','rsquare','double','folded','A','MARKET'],
 ['rsquare-bolt','Rounded square bolt','rsquare','thin','icon','E','VOLT','bolt'],
 ['squircle-out','Squircle','squircle','double','outside','E','APP CLUB'],
 ['squircle-solid','Solid squircle','squircle','solid','single','A','CANDY'],
 ['squircle-band','Squircle band','squircle','double','solidband','E','DINER'],
 ['squircle-bold','Bold squircle','squircle','bold','single','O','MODERN'],
 ['cutsq-stack','Cut square','cutsq','double','stack','O','WORKS'],
 ['cutsq-plate','Solid cut square','cutsq','solid','plate','B','FACTORY'],
 ['cutsq-arrows','Cut square arrows','cutsq','dotted','icon','E','ARCHERY','arrows'],
 ['cutsq-bold','Bold cut square','cutsq','bold','single','E','DEPOT'],
 ['longoct-single','Long octagon','longoct','double','single','E','GARAGE CO'],
 ['longoct-solid','Solid long octagon','longoct','solid','single','A','MOTORS'],
 ['longoct-band','Long octagon band','longoct','double','solidband','E','SPEEDWAY'],
 ['longoct-dotted','Dotted long octagon','longoct','dotted','stack','O','TAVERN'],
 ['rhex-stack','Rounded hexagon','rhex','double','stack','B','HIVE'],
 ['rhex-solid','Solid rounded hexagon','rhex','solid','stack','A','HONEY'],
 ['rhex-ribbon','Rounded hexagon ribbon','rhex','double','folded','A','BEE CO'],
 ['rhex-leaf','Rounded hexagon leaf','rhex','thin','icon','E','GREEN','leaf'],
 ['french-stack','French shield','french','double','stack','O','LANCER'],
 ['french-solid','Solid French shield','french','solid','stack','A','KNIGHT'],
 ['french-plate','French shield plate','french','double','plate','B','CASTLE'],
 ['french-crown','French shield crown','french','dotted','icon','P','MONARCH','crown'],
 ['kite-plate','Kite plate','kite','double','plate','B','AERO'],
 ['kite-single','Kite','kite','double','single','E','KITE CO'],
 ['kite-solid','Solid kite','kite','solid','solidband','A','SKY'],
 ['keystone-stack','Keystone','keystone','double','stack','O','KEYSTONE'],
 ['keystone-solid','Solid keystone','keystone','solid','single','E','STATE'],
 ['keystone-ribbon','Keystone ribbon','keystone','dotted','folded','A','PENN'],
 ['trapezoid-stack','Tower','trapezoid','double','stack','B','TOWER'],
 ['trapezoid-sun','Tower sun','trapezoid','thin','icon','E','BEACON','sun'],
 ['trapezoid-solid','Solid tower','trapezoid','solid','single','A','FORT'],
 ['flower-arcs','Flower seal','flower','double','arcs','B','BLOOM'],
 ['flower-solid','Solid flower','flower','solid','arcs','A','FLORA'],
 ['flower-disc','Flower disc','flower','double','disc','A','PETAL'],
 ['quatre-arcs','Quatrefoil','quatre','double','arcs','O','CLOVER'],
 ['quatre-solid','Solid quatrefoil','quatre','solid','single','A','LUCKY'],
 ['quatre-disc','Quatrefoil disc','quatre','dotted','disc','E','FORTUNE'],
 ['sheriff','Sheriff star','sheriff','double','arcs','A','SHERIFF'],
 ['sheriff-solid','Solid sheriff star','sheriff','solid','arcs','E','MARSHAL'],
 ['cdiamond','Circle diamond','cdiamond','double','innercircle','B','PRISM'],
 ['cdiamond-solid','Solid circle diamond','cdiamond','solid','innercircle','A','JEWEL'],
 ['dcircle','Diamond circle','circle','double','innerdiamond','E','FACET'],
 ['scircle','Square circle','circle','double','innersquare','O','QUARTER'],
 ['speech-single','Speech bubble','speech','double','single','E','HELLO'],
 ['speech-solid','Solid speech bubble','speech','solid','single','A','CHAT'],
 ['speech-band','Speech bubble band','speech','double','solidband','E','TALK SHOW'],
 ['scallop-stack','Scallop frame','scallop','double','stack','E','POST OFFICE'],
 ['scallop-solid','Solid scallop frame','scallop','solid','single','A','LETTER'],
 ['scallop-plate','Scallop plate','scallop','double','plate','B','STATIONERY'],
 ['barrel-stack','Barrel','barrel','double','stack','O','BREWERY'],
 ['barrel-solid','Solid barrel','barrel','solid','single','E','CASK'],
 ['barrel-ribbon','Barrel ribbon','barrel','double','folded','A','WHISKEY'],
 ['barrel-flame','Barrel flame','barrel','dotted','icon','E','SMOKEHOUSE','flame'],
 ['ovalv-stack','Tall oval','ovalv','double','stack','B','VINEYARD'],
 ['ovalv-solid','Solid tall oval','ovalv','solid','stack','A','CELLAR'],
 ['ovalv-arched','Tall oval ribbon','ovalv','double','arched','A','ESTATE'],
 ['ovalv-leaf','Tall oval leaf','ovalv','thin','icon','O','ORGANIC','leaf'],
 ['circle-anchor','Anchor seal','circle','double','icon','E','MARINA','anchor'],
 ['circle-bolt','Solid bolt seal','circle','solid','icon','E','ELECTRIC','bolt'],
 ['circle-disc','Dotted disc seal','circle','dotted','disc','B','CORE'],
 ['circle-band','Bold band seal','circle','bold','solidband','A','BURGER'],
 ['circle-compass','Compass seal','circle','thin','icon','O','NAVIGATOR','compass'],
 ['circle-heart','Heart seal','circle','double','icon','E','LOVE CO','heart'],
 ['hex-bolt','Hexagon bolt','hex','dotted','icon','E','POWER','bolt'],
 ['hex-bold','Bold hexagon','hex','bold','single','A','HEXA'],
 ['hex-flame','Solid hexagon flame','hex','solid','icon','E','FIRE','flame'],
 ['shield-arrows','Shield arrows','shield','dotted','icon','O','RANGER','arrows'],
 ['shield-compass','Solid shield compass','shield','solid','icon','E','SCOUT','compass'],
 ['shield-bold','Bold shield band','shield','bold','solidband','A','TITAN'],
 ['widehex-out','Wide hexagon outside','widehex','thin','outside','E','SIGNAL'],
 ['widehex-plate','Solid wide hexagon plate','widehex','solid','outside','B','LODGE'],
 ['pill-solid','Solid pill','pill','solid','outside','A','SODA'],
 ['pill-dotted','Dotted pill','pill','dotted','outside','E','TICKET'],
 ['icon-anchor','Anchor','none','none','icon','E','ANCHOR BAY','anchor'],
 ['icon-bolt','Bolt','none','none','icon','A','THUNDER','bolt'],
 ['icon-compass','Compass','none','none','icon','O','TRUE NORTH','compass'],
 ['icon-arrows','Crossed arrows','none','none','icon','E','WILDERNESS','arrows'],
 ['icon-heart','Heart','none','none','icon','A','LOVELY','heart'],
 ['icon-leaf','Leaf','none','none','icon','B','NATURAL','leaf'],
 ['icon-sun','Sun','none','none','icon','E','SUNRISE','sun'],
 ['icon-flame','Flame','none','none','icon','A','GRILL HOUSE','flame'],
 ['lettering-band','Solid band','none','none','solidband','E','COLLECTIVE'],
 ['lettering-ribbon','Folded ribbon','none','none','folded','A','BREWING'],
 ['lettering-plate','Plate','none','none','plate','B','MERCHANT'],
 ['lettering-blackletter','Blackletter rules','none','none','stack','P','NIGHT OWL'],
];
const roundFrames=new Set(['dodeca','deca','flower','quatre','sheriff','circle']);
export const round6Templates=rows.map(([id,name,frame,style,layout,font,sample,iconKind])=>({
 id,name,frame,style,layout,icon:iconKind,font:fontOf[font],sample,
 category:frame==='none'?'Lettering':roundFrames.has(frame)?'Selos':'Emblemas',
 desc:`${name}: ${{double:'contorno duplo',dotted:'contorno com pontilhado',solid:'sólido com textos vazados',thin:'contorno fino',bold:'contorno grosso',none:'composição aberta'}[style]}.`,
 ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',
}));

export function renderRound6(id,config={},variant='light',background=true){
 const p=round6Templates.find(p=>p.id===id);if(!p)throw new Error('Modelo desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const k=textKit(c);
 const {none,accent,topAccent,foot,row,small,dashed,topArc,bottomArc,stack,bandName,arcName}=k;
 const f=F[p.frame],[y0,y1,w]=f.box,H=y1-y0,mid=(y0+y1)/2;
 const sw=Math.min(170,w*.7),bw=Math.min(170,(f.wb??w)*.7),ruleW=Math.min(240,w*.72),bruleW=Math.min(ruleW,(f.wb??w)*.62);
 const rule=(y,width=ruleW)=>line(`M${n(300-width/2)} ${n(y)}H${n(300+width/2)}`,weight.detail);
 let content='',band=null;
 const bandY=f.bandY??mid,x0=Math.max(60,300-f.span-34),x1=600-x0;
 // Itens acima e abaixo de uma faixa, ocupando o espaço livre da moldura.
 const aroundBand=(clear=58)=>{
  const top=small(c.topline,y0+26,sw,15)+(bandY-clear+2-(y0+26)>=26?topAccent(bandY-clear):'');
  const tagY=bandY+(y1-bandY)*.5;
  return top+dashed(c.tagline,n(tagY),Math.min(bw,130),15)+(y1-8-tagY>=26?foot(y1-8):'');
 };
 switch(p.layout){
  case 'stack':{
   const r1=y0+66,r2=y1-66,h=(r2-r1-26)/2.25;
   content=topAccent(y0+18)+small(c.topline,y0+44,sw,15)+rule(r1)+stack(mid,w*.85,h,8)+rule(r2,bruleW)+small(c.tagline,y1-42,bw,15)+foot(y1-12);
   break;}
  case 'single':{
   const h=Math.min(84,H*.3),ny=mid+6;
   content=dashed(c.topline,y0+28,Math.min(sw,140),15)+topAccent(y0+58)+bandName(ny,w*.92,h)+rule(ny+h*.62+12,bruleW)+
    small(c.tagline,y1-30,bw,15)+(H>250?foot(y1-6):'');
   break;}
  case 'outside':{
   const h=H*.42;
   content=bandName(mid,w*.86,h)+accent(300-f.span+30,mid,8)+accent(300+f.span-30,mid,8);
   band={outside:topAccent(y0-74)+small(c.topline,y0-36,200,16)+dashed(c.tagline,y1+34,150,16)};
   break;}
  case 'icon':{
   const nh=H*(p.frame==='none'?.24:.19),ny=y0+H*.57,ry=ny+nh*.62+12;
   content=icon(p.icon,y0+40,p.frame==='none'?64:Math.min(58,H*.2))+small(c.topline,y0+86,sw,15)+bandName(ny,w*.88,nh)+rule(ry,bruleW*.8)+
    accent(300-bruleW*.4-14,ry,6)+accent(300+bruleW*.4+14,ry,6)+small(c.tagline,y1-28,bw,15);
   break;}
  case 'arcs':{
   const r=f.round,s=r/164;
   content=topArc(r-28*s,20*s)+bottomArc(r-20*s,19*s)+topAccent(250-r+76*s)+stack(250,r*1.3,40*s,6)+rule(250+58*s,100*s);
   break;}
  case 'disc':{
   const r=f.round,dr=r*.56;
   content=topArc(r-24,18)+bottomArc(r-16,17)+accent(300-(dr+(r-dr)/2),250,7)+accent(300+(dr+(r-dr)/2),250,7);
   band={over:cut(disc(dr),row(250-dr+20,5,5,16)+stack(250,dr*1.5,dr*.28,5)+row(250+dr-20,5,5,16))};
   break;}
  case 'innercircle':{
   const s=118/164;
   content=circle(118,weight.inset)+topArc(118-28*s,20*s)+bottomArc(118-20*s,19*s)+topAccent(250-118+76*s)+stack(250,150,30,5)+accent(170,250,7)+accent(430,250,7);
   break;}
  case 'innerdiamond':
   content=line('M300 130L420 250L300 370L180 250Z',weight.inset)+topArc(136,20)+bottomArc(146,20)+bandName(250,190,50)+accent(300,174,7)+accent(300,326,7);
   break;
  case 'innersquare':
   content=line('M208 158H392V342H208Z',weight.inset)+topArc(136,20)+bottomArc(146,20)+stack(252,160,34,6)+accent(300,180,7)+accent(300,322,7)+
    accent(186,250,6)+accent(414,250,6);
   break;
  case 'plate':{
   const plate=`M${x0+28} ${bandY-34}H${x1-28}L${x1} ${bandY} ${x1-28} ${bandY+34}H${x0+28}L${x0} ${bandY}Z`;
   content=aroundBand();
   band={area:plate,art:line(plate)+bandName(bandY,x1-x0-96,46)+accent(x0+26,bandY,7)+accent(x1-26,bandY,7)};
   break;}
  case 'solidband':{
   const sb=`M${x0} ${bandY-38}H${x1}L${x1-16} ${bandY} ${x1} ${bandY+38}H${x0}L${x0+16} ${bandY}Z`;
   content=aroundBand();
   band={area:sb,art:cut(path(sb),bandName(bandY,x1-x0-100,50)+accent(x0+34,bandY,7)+accent(x1-34,bandY,7))};
   break;}
  case 'folded':{
   const r=folded(bandY,x0+20,x1-20,64);
   content=aroundBand();
   band={area:r.area,art:r.art+bandName(bandY,x1-x0-90,44)};
   break;}
  case 'arched':{
   const r=archedRibbon(bandY-46,84,x0+10,38);
   content=aroundBand(84);
   band={area:r.area,art:r.art+arcName(60,bandY-46-226)};
   break;}
 }
 const gapStroke=d=>path(d,'stroke="black" stroke-width="16"');
 const frameLines={double:line(f.d??'')+line(f.inset??'',weight.inset),dotted:line(f.d??'')+dottedLine(f.inset??''),thin:line(f.d??'',weight.mid)+line(f.inset??'',weight.detail),
  bold:line(f.d??'',14)+line(f.inset??'',weight.inset)}[p.style];
 let art='';
 if(p.frame==='none')art=content+(band?.art??'')+(band?.over??'');
 else if(p.style==='solid')art=cut(path(f.d),dottedLine(f.inset)+content+(band?.area?gapStroke(band.area):'')+(band?.over?disc(0):''))+(band?.art??'')+(band?.over??'');
 else art=(band?.area?cut(frameLines,path(band.area)):frameLines)+content+(band?.art??'')+(band?.over??'');
 // Disco central sobre fundo sólido precisa de um anel de separação.
 if(p.style==='solid'&&band?.over)art=cut(path(f.d),dottedLine(f.inset)+content+`<circle cx="300" cy="250" r="${n(f.round*.56+8)}"/>`)+band.over;
 return svgDoc(c.name,p.name,variant,background,(f.decor??'')+art+(band?.outside??''));
}
