import {fitText,fittedTextBounds,arcText} from './engine.js';
import {weight,n,path,line,circle,disc,cut,svgDoc,poly,roundRect,sector,chordBand,solidFolded,hex,hexInset,shield,shieldInset,
 roundShield,roundShieldInset,wideHex,wideHexInset,ticket,ticketInset,textKit} from './kit.js';

// Rodada 7 (piloto): estruturas que não existiam nas rodadas 3 a 6. Tratamentos do próprio nome
// (sombra, hachura, extrusão, contorno, metade cheia, listras, velocidade), composições
// assimétricas e molduras novas (corda, lacre de cera, letreiro com lâmpadas).
const t=(id,name,category,font,sample,desc,options={})=>({id,name,category,font,sample,desc,ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',...options});
export const round7Templates=[
 // Lettering: tratamentos do nome
 t('drop-shadow','Drop shadow','Lettering','AlfaSlabOne','ROADHOUSE','Nome com sombra sólida deslocada e separada por um vão.',{tagline:'EST. 2026'}),
 t('hatch-shadow','Hatched shadow','Lettering','BebasNeue','HARDWARE','Nome com sombra em hachura diagonal.',{topline:'TOOLS & SUPPLY'}),
 t('extrude','Extruded','Lettering','Bungee','ARCADE','Nome vazado com extrusão sólida em diagonal.',{topline:'GAME ROOM',tagline:'EST. 1984'}),
 t('outlined','Outlined','Lettering','OleoScript','Good Vibes','Nome com contorno externo afastado, como adesivo.',{tagline:'SURF CLUB'}),
 t('split-fill','Half fill','Lettering','BebasNeue','BLACKOUT','Metade de cima das letras cheia, metade de baixo em contorno.',{topline:'RECORDS'}),
 t('stripes','Striped name','Lettering','AlfaSlabOne','GROOVY','Letras preenchidas por listras que afinam para baixo, em estilo anos 70.',{tagline:'EST. 1972'}),
 t('speed-lines','Speed lines','Lettering','Oswald','EXPRESS','Nome inclinado com linhas de velocidade à esquerda.',{topline:'SAME DAY',tagline:'DELIVERY CO'}),
 // Lettering: assimetria
 t('left-bar','Left bar','Lettering','Oswald','NORTH STUDIO','Composição alinhada à esquerda com barra vertical grossa.',{topline:'DESIGN & PRINT',tagline:'EST. 2026'}),
 t('year-sides','Year sides','Lettering','AlfaSlabOne','BARBER CO','Ano dividido nas laterais do nome, entre filetes.',{topline:'FINE GROOMING',tagline:'EST. 1987'}),
 // Selos
 t('rope-seal','Rope seal','Selos','Oswald','SEAFARER','Selo com borda de corda torcida.',{topline:'NAUTICAL SUPPLY',tagline:'EST. 2026'}),
 t('wax-seal','Wax seal','Selos','PirataOne','ROYAL','Lacre de cera sólido, de borda irregular, com textos vazados.',{topline:'SEALED WITH CARE',tagline:'EST. 2026'}),
 // Emblemas
 t('marquee','Marquee','Emblemas','BebasNeue','CINEMA','Letreiro com fileira de lâmpadas e aba sólida no topo.',{topline:'NOW SHOWING',tagline:'TONIGHT 8 PM'}),
 // Lettering: lote 2
 t('tiles','Letter tiles','Lettering','BebasNeue','PIXEL','Cada letra numa célula, alternando cheias e vazadas.',{topline:'GAME STUDIO',tagline:'EST. 2026'}),
 t('tilted-ribbon','Tilted ribbon','Lettering','AlfaSlabOne','KICKOFF','Faixa sólida inclinada com o nome vazado.',{topline:'SPORTS CLUB',tagline:'EST. 2026'}),
 t('stair','Stair','Lettering','Oswald','URBAN FARM','Duas palavras em escada, ligadas por filetes.',{topline:'FRESH PRODUCE',tagline:'EST. 2026'}),
 t('vertical-tag','Vertical tag','Lettering','BebasNeue','HIGHLINE','Nome com o texto complementar na vertical, ao lado de um filete.',{tagline:'EST. 2026'}),
 t('initials-block','Initials block','Lettering','Oswald','BLUE HARBOR','Bloco sólido com as iniciais à esquerda e o nome à direita.',{topline:'ARCHITECTS',tagline:'EST. 2026'}),
 t('open-frame','Open frame','Lettering','AlfaSlabOne','OUTSIDE','Moldura aberta de um lado, com o nome passando para fora.',{topline:'THINK',tagline:'THE BOX'}),
 t('checker-band','Checker band','Lettering','Bungee','PIT STOP','Nome entre duas faixas quadriculadas de bandeira de corrida.',{topline:'RACING TEAM',tagline:'EST. 2026'}),
 t('bunting','Bunting','Lettering','AlfaSlabOne','FIESTA','Varal de bandeirolas sobre o nome.',{tagline:'EST. 2026'}),
 // Emblemas: molduras novas
 t('triangle','Triangle','Emblemas','Oswald','SUMMIT','Triângulo com contorno duplo e o nome na base.',{topline:'ALPINE CLUB',tagline:'EST. 2026'}),
 t('pennant-down','Inverted triangle','Emblemas','BebasNeue','VANGUARD','Triângulo invertido com o nome no topo.',{topline:'TRADING CO',tagline:'EST. 2026'}),
 t('greek-cross','Greek cross','Emblemas','BarlowCondensed','APOTHECARY','Cruz de braços iguais com o nome no braço horizontal.',{topline:'FARMÁCIA',tagline:'EST. 2026'}),
 t('film-strip','Film strip','Emblemas','BebasNeue','PICTURES','Tira de filme com perfurações e o nome no quadro.',{topline:'INDEPENDENT',tagline:'EST. 2026'}),
 t('horseshoe','Horseshoe','Emblemas','AlfaSlabOne','LUCKY','Ferradura sólida com furos de cravo e o nome dentro.',{topline:'SALOON',tagline:'EST. 1880'}),
 t('pick','Guitar pick','Emblemas','Oswald','AMPLIFIED','Palheta com contorno duplo.',{topline:'MUSIC STORE',tagline:'EST. 2026'}),
 t('drop','Drop','Emblemas','BarlowCondensed','PURE WATER','Gota com contorno duplo e o nome no bojo.',{topline:'SPRING',tagline:'EST. 2026'}),
 t('police-badge','Police badge','Emblemas','AlfaSlabOne','PATROL','Distintivo com pontas e contorno duplo.',{topline:'CITY',tagline:'DEPARTMENT'}),
 t('neck-label','Neck label','Emblemas','PirataOne','Reserve','Rótulo de gargalo, mais largo em cima e curvo.',{topline:'SMALL BATCH',tagline:'EST. 2026'}),
 t('ziggurat','Ziggurat','Emblemas','BebasNeue','PARAMOUNT','Moldura de topo escalonado, em estilo art déco.',{topline:'THEATRE',tagline:'EST. 1928'}),
 t('hanging-sign','Hanging sign','Emblemas','AlfaSlabOne','THE INN','Placa pendurada por duas correntes.',{topline:'FOOD & LODGING',tagline:'EST. 2026'}),
 t('id-badge','ID badge','Emblemas','Oswald','STAFF ONLY','Crachá com presilha, iniciais em disco e código de barras.',{tagline:'ACCESS ALL AREAS'}),
 t('street-sign','Street sign','Emblemas','BebasNeue','MAIN ST','Placa de rua em seta, com poste.',{topline:'THIS WAY',tagline:'EST. 2026'}),
 t('warning','Warning sign','Emblemas','Oswald','HIGH VOLTAGE','Triângulo sólido de cantos arredondados com textos vazados.',{topline:'CAUTION',tagline:'EST. 2026'}),
 // Selos: bordas novas
 t('sawtooth','Sawtooth seal','Selos','Oswald','SHARP','Anel com dentes triangulares apontando para dentro.',{tagline:'EST. 2026'}),
 t('checker-ring','Checker ring','Selos','BarlowCondensed','GRAND PRIX','Anel quadriculado em duas fileiras.',{topline:'MOTOR CLUB',tagline:'EST. 2026'}),
 t('engraving','Engraving','Selos','BebasNeue','HORIZON','Selo com metade de baixo em hachura de gravura.',{topline:'OUTDOOR SUPPLY',tagline:'EST. 2026'}),
 t('text-ring','Text ring','Selos','AlfaSlabOne','LOOP','Texto complementar repetido em volta do círculo inteiro.',{topline:'COFFEE ROASTERS',tagline:'EST. 2026'}),
 t('globe','Globe','Selos','BebasNeue','WORLDWIDE','Globo com meridianos e paralelos e faixa sólida no meio.',{topline:'GLOBAL SHIPPING',tagline:'EST. 2026'}),
 t('target','Target','Selos','Oswald','BULLSEYE','Anéis concêntricos com uma coroa sólida de textos vazados.',{topline:'ARCHERY CLUB',tagline:'EST. 2026'}),
 t('chain-seal','Chain seal','Selos','BebasNeue','IRONWORKS','Selo com borda de corrente.',{topline:'HEAVY DUTY',tagline:'EST. 2026'}),
 // Cruzamentos: os tratamentos novos dentro de molduras
 t('shadow-seal','Shadow seal','Selos','AlfaSlabOne','DINER','Selo circular com o nome em sombra sólida.',{topline:'ALL DAY BREAKFAST',tagline:'EST. 2026'}),
 t('extrude-plate','Extruded plate','Emblemas','Bungee','GARAGE','Hexágono alongado com o nome extrudado.',{topline:'CUSTOM BUILT',tagline:'EST. 2026'}),
 t('sticker-disc','Sticker disc','Selos','Lobster','Sunset','Disco sólido com o nome em contorno de adesivo passando por cima.',{topline:'BEACH BAR',tagline:'EST. 2026'}),
 t('split-seal','Half fill seal','Selos','BebasNeue','MIDNIGHT','Selo com o nome meio cheio, meio contorno.',{topline:'RECORD SHOP',tagline:'EST. 2026'}),
 t('stripes-hex','Striped hexagon','Emblemas','AlfaSlabOne','DISCO','Hexágono duplo com o nome listrado.',{topline:'DANCE CLUB',tagline:'EST. 1977'}),
 t('speed-pill','Speed pill','Emblemas','Oswald','COURIER','Cápsula com o nome inclinado e linhas de velocidade.',{topline:'EXPRESS',tagline:'NATIONWIDE'}),
 t('hatch-shield','Hatched shield','Emblemas','BebasNeue','FORGE','Escudo com o nome em sombra hachurada.',{topline:'IRON & STEEL',tagline:'EST. 2026'}),
 t('shadow-ticket','Shadow ticket','Emblemas','AlfaSlabOne','ADMIT','Ingresso de cantos chanfrados com o nome em sombra.',{topline:'GOOD FOR ONE',tagline:'EST. 2026'}),
 t('rope-frame','Rope frame','Emblemas','Oswald','BOATHOUSE','Retângulo arredondado com borda de corda.',{topline:'LAKESIDE',tagline:'EST. 2026'}),
 t('rope-oval','Rope oval','Emblemas','BarlowCondensed','LIGHTHOUSE','Oval com borda de corda.',{topline:'COASTAL GOODS',tagline:'EST. 2026'}),
 t('wax-monogram','Wax monogram','Selos','PirataOne','GOLDEN CROWN','Lacre de cera com iniciais grandes e o nome no arco.',{topline:'PRIVATE',tagline:'EST. 2026'}),
 t('marquee-arrow','Marquee arrow','Emblemas','BebasNeue','DRIVE IN','Seta de letreiro com lâmpadas.',{topline:'OPEN TONIGHT',tagline:'EST. 1958'}),
 t('shadow-banner','Shadow banner','Lettering','AlfaSlabOne','BIG TOP','Nome em sombra sólida sobre faixa dobrada com o texto complementar.',{topline:'CIRCUS',tagline:'EST. 2026'}),
 t('split-box','Half fill box','Emblemas','BebasNeue','NOIR','Moldura dupla com o nome meio cheio e filetes até a borda.',{topline:'CINEMA CLUB',tagline:'EST. 2026'}),
 t('left-rules','Left rules','Lettering','Oswald','MODERN TYPE','Bloco alinhado à esquerda entre filete grosso e filete fino.',{topline:'FOUNDRY',tagline:'EST. 2026'}),
 t('year-box','Year boxes','Lettering','BebasNeue','BREWERY','Ano dividido em dois quadros sólidos ao lado do nome.',{topline:'CRAFT BEER',tagline:'EST. 1996'}),
 t('outlined-ring','Outlined ring','Selos','Pacifico','Aloha','Nome em contorno de adesivo atravessando o anel.',{topline:'SURF SHOP',tagline:'EST. 2026'}),
 t('extrude-badge','Extruded badge','Emblemas','Bungee','BOOM','Escudo arredondado com o nome extrudado.',{topline:'FIREWORKS',tagline:'EST. 2026'}),
 t('tiles-seal','Tiles seal','Selos','BebasNeue','CODE','Selo circular com o nome em células.',{topline:'DEV STUDIO',tagline:'EST. 2026'}),
 t('speed-seal','Speed seal','Selos','Oswald','RUSH','Selo com o nome inclinado e linhas de velocidade.',{topline:'RUNNING CLUB',tagline:'EST. 2026'}),
];

let serial=0;
// Máscara com áreas visíveis (white) e removidas (black); o conteúdo aparece só na diferença.
function masked(content,white,black=''){
 const id=`r7-cut-${++serial}`;
 return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="500"><g fill="white" color="white">${white}</g><g fill="black" color="black">${black}</g></mask></defs><g mask="url(#${id})">${content}</g>`;
}
// Reaplica os contornos de texto com outros atributos. O traço é dividido pela escala de cada
// contorno, para ter a mesma espessura no canvas qualquer que seja o tamanho do texto.
function restyle(svg,attrs){
 return svg.replace(/<path d="([^"]*)" transform="([^"]*)"\s*\/>/g,(_,d,tr)=>{const s=Number(/scale\(([-\d.]+)\)/.exec(tr)?.[1]??1);return `<path d="${d}" transform="${tr}" ${attrs(s)}/>`;});
}
const stroked=(svg,w,fill='none')=>restyle(svg,s=>`fill="${fill}" stroke="currentColor" stroke-width="${n(w/s)}" stroke-linejoin="round"`);
const shift=(svg,dx,dy)=>`<g transform="translate(${n(dx)} ${n(dy)})">${svg}</g>`;
const all='<rect width="600" height="500"/>';
const rad=d=>d*Math.PI/180;
const onCircle=(r,deg)=>[300+Math.cos(rad(deg))*r,250+Math.sin(rad(deg))*r];

function split(name){
 const words=String(name).trim().split(/\s+/);if(words.length<2)return [String(name).trim(),''];
 let best=1,score=Infinity;
 for(let i=1;i<words.length;i++){const d=Math.abs(words.slice(0,i).join(' ').length-words.slice(i).join(' ').length);if(d<score){score=d;best=i;}}
 return [words.slice(0,best).join(' '),words.slice(best).join(' ')];
}

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
// Contorno interno: a mesma forma reduzida em torno de um centro, como nas molduras duplas.
const inset=(svg,k,cx,cy)=>`<g transform="translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})">${svg}</g>`;
const double=(d,k,cx,cy)=>line(d)+inset(line(d,weight.inset/k),k,cx,cy);

export function renderRound7(id,config={},variant='light',background=true){
 const p=round7Templates.find(p=>p.id===id);if(!p)throw new Error('Modelo desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const {factor,accent,topAccent,foot,row,small,dashed,topArc,bottomArc,name,stack,bandName,scriptName,initials}=textKit(c);
 // Altura ocupada pelo nome do stack(), para encostar os textos de apoio no nome.
 const stackHeight=(w,h,gap)=>{
  const [a,b]=split(c.name),o={uppercase:true,spacing:1+(Number(c.spacing)||0)};
  if(!b)return fittedTextBounds(c.name,c.font,w*factor,h*1.45*factor,{...o,spacing:o.spacing+.3}).height;
  const k=Math.min(1,w/Math.max(...[a,b].map(t=>fittedTextBounds(t,c.font,1e6,h,o).width)));
  return 2*h*k*factor+gap;
 };
 // Topo, nome e base: textos de apoio a uma distância fixa do nome (drop: o quanto o efeito desce).
 // Altura de uma linha do nome: os efeitos (sombra, extrusão) escalam com ela.
 const lineHeight=(w,h,gap)=>{const H=stackHeight(w,h,gap);return split(c.name)[1]?(H-gap)/2:H;};
 const around=(H,drop=0,cy=244)=>dashed(c.topline,n(cy-H/2-34),150,16)+small(c.tagline,n(cy+H/2+drop+38),190,16)+foot(n(cy+H/2+drop+68));
 // Texto alinhado pela borda esquerda (ou direita, com align<0) em vez do centro.
 const at=(text,font,x,y,w,h,o,align=1)=>{const {width}=fittedTextBounds(text,font,w,h,o);return fitText(text,font,x+align*width/2,y,w,h,o);};
 const smallOpts={uppercase:true,spacing:2};
 // Conteúdo padrão de moldura: topo, filete, nome, filete e base dentro da caixa [y0, y1] de largura w.
 const inside=(y0,y1,w,wb=w)=>{
  const mid=(y0+y1)/2,r1=y0+56,r2=y1-56,h=Math.min(46,(r2-r1-20)/2.25);
  return topAccent(y0+14)+small(c.topline,y0+36,Math.min(170,w*.7),14)+rule(r1,Math.min(220,w*.7))+stack(mid,w*.85,h,7)+
   rule(r2,Math.min(220,wb*.6))+small(c.tagline,y1-34,Math.min(170,wb*.7),14)+foot(y1-8);
 };
 const rule=(y,w)=>line(`M${n(300-w/2)} ${n(y)}H${n(300+w/2)}`,weight.detail);
 // ---------- efeitos do nome (recebem os contornos já posicionados e a altura de uma linha) ----------
 // Sombra sólida deslocada, separada das letras por um vão.
 const dropFx=(nm,lh)=>{const o=Math.min(8,lh*.085);return {o,art:masked(shift(nm,o,o),all,stroked(nm,Math.min(10,o*1.3),'currentColor'))+nm};};
 // Sombra em hachura diagonal.
 const hatchFx=(nm,lh)=>{
  let hatch='';for(let x=-200;x<700;x+=7)hatch+=`M${x} 500L${x+500} 0`;
  const o=Math.min(11,lh*.12);
  return {o,art:masked(line(hatch,2.2),shift(nm,o,o),stroked(nm,Math.min(9,o*.8),'currentColor'))+nm};
 };
 // Letras em contorno sobre um bloco sólido em diagonal.
 const extrudeFx=(nm,lh)=>{
  const steps=Math.max(4,Math.round(Math.min(15,lh*.15))),st=Math.min(1,lh*.15/steps);
  const depth=Array.from({length:steps},(_,i)=>shift(nm,(i+1)*st,(i+1)*st)).join('');
  return {o:steps*st,art:masked(depth,all,restyle(nm,()=>''))+stroked(nm,Math.min(3.2,lh*.04))};
 };
 // Contorno afastado, como adesivo; `gapOut` abre espaço extra no que estiver atrás.
 const outlineFx=nm=>masked(all,stroked(nm,22,'currentColor'),stroked(nm,10,'currentColor'))+nm;
 // Metade de cima cheia, metade de baixo em contorno.
 const halfFx=(nm,y)=>stroked(nm,2.6)+masked(nm,`<rect width="600" height="${n(y)}"/>`);
 // Listras que afinam para baixo: a primeira metade é cheia, as seguintes perdem espessura.
 const stripeFx=(nm,top,height)=>{
  if(height<34)return nm;// pequeno demais para listras legíveis
  const bars=height<60?[.5,.22,.12]:[.42,.14,.11,.08,.06,.04],gap=height<60?.08:.045;
  let y=top,d='';for(const b of bars){d+=`M0 ${n(y)}H600V${n(y+b*height)}H0Z`;y+=(b+gap)*height;}
  return masked(path(d),nm)+stroked(nm,2.4);
 };
 // Nome inclinado com linhas de velocidade à esquerda, até xmin.
 const speedFx=(cx,cy,w,h,xmin)=>{
  const {width,height}=fittedTextBounds(c.name,c.font,w*factor,h*factor,nameOpts),left=cx-width/2;
  const lens=height<50?[.7,1,.6]:[.55,.8,1,.7,.45],span=Math.max(0,Math.min(150,left-xmin));let d='';
  lens.forEach((k,i)=>{const yy=cy-height/2+height*(i+.5)/lens.length;d+=`M${n(left-16-span*k)} ${n(yy)}H${n(left-16)}`;});
  return {width,height,left,art:`<g transform="translate(300 ${cy}) skewX(-14) translate(-300 ${-cy})">${fitText(c.name,c.font,cx,cy,w*factor,h*factor,nameOpts)+(span>20?line(d,Math.min(5,height/lens.length*.5)):'')}</g>`};
 };
 // Uma letra por célula, alternando cheias e vazadas. Nomes longos viram células ilegíveis:
 // acima de 16 letras, as células mostram as iniciais (e quem chama mostra o nome por extenso).
 const tilesFx=(cy,maxW,cap)=>{
  const full=String(c.name).trim(),long=full.length>16;
  const letters=full.split(/\s+/).filter(Boolean).slice(0,3).map(w=>w[0]).join('');
  const rows=long?[letters]:full.length>11&&split(full)[1]?split(full):[full];
  const len=Math.max(...rows.map(r=>r.length)),gap=6+(Number(c.spacing)||0),cw=Math.min(cap*factor,(maxW*factor-(len-1)*gap)/len),H=rows.length*cw+(rows.length-1)*10;
  let k=0;
  const art=rows.map((r,ri)=>[...r.toUpperCase()].map((ch,i)=>{
   if(!ch.trim())return '';
   const x=300-(r.length*cw+(r.length-1)*gap)/2+i*(cw+gap),y=cy-H/2+ri*(cw+10),cell=roundRect(n(x),n(y),n(cw),n(cw),n(cw*.12));
   const glyph=fitText(ch,c.font,x+cw/2,y+cw/2,cw*.62,cw*.62,{uppercase:true});
   return k++%2?cut(path(cell),glyph):line(cell,Math.min(3.2,cw*.06))+glyph;
  }).join('')).join('');
  return {art,H,long,full};
 };
 // Corda ao longo de uma curva fechada at(t), t de 0 a 1: fios inclinados entre as duas bordas.
 const ropeFx=(at,count,half=9)=>{
  let d='';
  for(let i=0;i<count;i++){
   const t0=i/count,t1=(i+2)/count,[x0,y0]=at(t0),[x1,y1]=at(t1%1),[xa,ya]=at((t0+.001)%1),[nx,ny]=unit([ya-y0,x0-xa]);
   d+=`M${n(x0-nx*half)} ${n(y0-ny*half)}L${n(x1+nx*half)} ${n(y1+ny*half)}`;
  }
  return path(d,'fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"');
 };
 const nameOpts={uppercase:true,spacing:1.3+(Number(c.spacing)||0)};
 let art='';
 switch(id){
  // ---------- lettering: tratamentos ----------
  case 'drop-shadow':{
   const fx=dropFx(stack(244,420,74,10),lineHeight(420,74,10));
   art=fx.art+around(stackHeight(420,74,10),fx.o);
   break;}
  case 'hatch-shadow':{
   const fx=hatchFx(stack(244,420,76,10),lineHeight(420,76,10));
   art=fx.art+around(stackHeight(420,76,10),fx.o);
   break;}
  case 'extrude':{
   const fx=extrudeFx(stack(240,400,70,12),lineHeight(400,70,12));
   art=fx.art+around(stackHeight(400,70,12),fx.o,240);
   break;}
  case 'outlined':{
   const {height}=fittedTextBounds(c.name,c.font,430*factor,140*factor,{spacing:Number(c.spacing)||0});
   art=outlineFx(scriptName(240,430,140))+row(n(240-height/2-38),5,6)+small(c.tagline,n(240+height/2+44),190,17)+foot(n(240+height/2+74));
   break;}
  case 'split-fill':{
   const {width,height}=fittedTextBounds(c.name,c.font,440*factor,120*factor,nameOpts),reach=Math.max(0,(560-width)/2-24);
   art=halfFx(name(244,440,120),244)+around(height)+
    (reach>20?line(`M${n(300-width/2-14-reach)} 244h${n(reach)}M${n(300+width/2+14)} 244h${n(reach)}`,weight.detail):'');
   break;}
  case 'stripes':{
   const {height}=fittedTextBounds(c.name,c.font,440*factor,124*factor,nameOpts);
   art=stripeFx(name(244,440,124),244-height/2,height)+around(height);
   break;}
  case 'speed-lines':{
   const {art:speed,width,height,left}=speedFx(360,250,380,96,44);
   const sm=(text,y)=>fitText(text,'BarlowCondensed',360,y,Math.min(width,220),15,smallOpts);
   art=speed+sm(c.topline,250-height/2-28)+line(`M${n(left)} ${n(250+height/2+22)}H${n(left+width)}`,weight.detail)+sm(c.tagline,250+height/2+48)+foot(n(250+height/2+76));
   break;}
  // ---------- lettering: assimetria ----------
  case 'left-bar':{
   const x0=150,W=320,opts={uppercase:true,spacing:1+(Number(c.spacing)||0)};
   const lines=split(c.name).filter(Boolean),h=(lines.length>1?64:96)*factor;
   const k=Math.min(1,W/Math.max(...lines.map(s=>fittedTextBounds(s,c.font,1e6,h,opts).width))),lh=h*k,gap=10;
   const y0=250-(lines.length*lh+(lines.length-1)*gap)/2;
   const at=(text,font,x,y,w,hh,o)=>{const {width}=fittedTextBounds(text,font,w,hh,o);return fitText(text,font,x+width/2,y,w,hh,o);};
   const small2=(text,y)=>at(text,'BarlowCondensed',x0+2,y,240,15,{uppercase:true,spacing:2});
   const blockW=x0-112+Math.max(...lines.map(s=>fittedTextBounds(s,c.font,W,lh,opts).width),fittedTextBounds(c.topline,'BarlowCondensed',240,15,{uppercase:true,spacing:2}).width);
   art=`<g transform="translate(${n((600-blockW)/2-112)} 0)">`+path(`M112 ${n(y0-50)}H128V${n(y0+lines.length*(lh+gap)+38)}H112Z`)+small2(c.topline,y0-30)+
    lines.map((s,i)=>at(s,c.font,x0,y0+lh/2+i*(lh+gap),W,lh,opts)).join('')+
    line(`M${x0+2} ${n(y0+lines.length*(lh+gap)+4)}h70`,weight.mid)+accent(x0+88,n(y0+lines.length*(lh+gap)+4),6)+small2(c.tagline,y0+lines.length*(lh+gap)+28)+'</g>';
   break;}
  case 'year-sides':{
   const year=/\d{4}/.exec(c.tagline)?.[0],big=(s,x)=>fitText(s,'BebasNeue',x,250,64,92);
   art=dashed(c.topline,144,170,16)+stack(250,250,52,8)+line('M150 196V304M450 196V304',weight.mid)+
    (year?big(year.slice(0,2),104)+big(year.slice(2),496):accent(110,250,12)+accent(490,250,12))+
    (year?row(352,3,7,22):small(c.tagline,352,190,16));
   break;}
  // ---------- selos ----------
  case 'rope-seal':{
   // Fios inclinados ao longo do anel; o passo e a inclinação imitam a torção da corda.
   const count=84,step=360/count;let d='';
   for(let i=0;i<count;i++){const [x0,y0]=onCircle(167,i*step),[x1,y1]=onCircle(185,i*step+step*2);d+=`M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;}
   art=path(d,'fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round"')+circle(162,weight.detail)+circle(190,weight.detail)+circle(150,weight.inset)+
    topArc(124,19)+bottomArc(132,19)+topAccent(178)+stack(250,205,40,6)+rule(306,90);
   break;}
  case 'wax-seal':{
   // Borda irregular por soma de senoides fixas: o mesmo lacre a cada renderização.
   const blob=poly(Array.from({length:240},(_,i)=>{const a=i*Math.PI*2/240,r=176+4*Math.sin(3*a+1)+3*Math.sin(5*a+2.3)+2.2*Math.sin(9*a+.7)+1.4*Math.sin(14*a);return [300+Math.cos(a)*r,250+Math.sin(a)*r];}));
   art=cut(path(blob),circle(124,4)+circle(160,weight.detail)+topArc(136,18,'BarlowCondensed',250,2.2)+bottomArc(146,17)+
    topAccent(166)+stack(252,190,42,6)+rule(310,80));
   break;}
  // ---------- emblemas ----------
  case 'marquee':{
   const tab='M200 76H400L412 112H188Z';
   let bulbs='';
   for(let x=118;x<=482;x+=26)bulbs+=`<circle cx="${x}" cy="138" r="5"/><circle cx="${x}" cy="362" r="5"/>`;
   for(let y=164;y<=336;y+=24.6)bulbs+=`<circle cx="106" cy="${n(y)}" r="5"/><circle cx="494" cy="${n(y)}" r="5"/>`;
   art=cut(line(roundRect(80,112,440,276,22)),path(tab,'stroke="black" stroke-width="12"'))+cut(path(tab),small(c.topline,95,170,16))+bulbs+
    line(roundRect(128,158,344,184,6),weight.inset)+stack(240,300,62,8)+rule(304,120)+accent(226,304,6)+accent(374,304,6)+small(c.tagline,324,180,14);
   break;}
  // ---------- lettering: lote 2 ----------
  case 'tiles':{
   const {art:cells,H,long,full}=tilesFx(250,470,84);
   art=cells+dashed(c.topline,n(250-H/2-30),150,16)+
    (long?fitText(full,c.font,300,n(250+H/2+30),420,24,{uppercase:true,spacing:1.5})+small(c.tagline,n(250+H/2+64),190,15):small(c.tagline,n(250+H/2+34),190,16)+foot(n(250+H/2+64)));
   break;}
  case 'tilted-ribbon':{
   const band='M70 205H530L508 250 530 295H70L92 250Z';
   art=`<g transform="rotate(-6 300 250)">${cut(path(band),bandName(250,380,52))+small(c.topline,174,220,16)+small(c.tagline,326,190,16)+foot(356)}</g>`;
   break;}
  case 'stair':{
   const o={uppercase:true,spacing:1+(Number(c.spacing)||0)},[a,b]=split(c.name),W=330;
   const h=78*factor,k=Math.min(1,W/Math.max(...[a,b].filter(Boolean).map(s=>fittedTextBounds(s,c.font,1e6,h,o).width))),lh=h*k;
   const second=b?{text:b,font:c.font,h:lh,o}:{text:c.tagline,font:'BarlowCondensed',h:22,o:smallOpts};
   const total=lh+18+second.h,y1=250-total/2+lh/2,y2=y1+lh/2+18+second.h/2,x0=95,x1=505;
   const wa=fittedTextBounds(a,c.font,W,lh,o).width,wb=fittedTextBounds(second.text,second.font,W,second.h,second.o).width;
   art=at(a,c.font,x0,y1,W,lh,o)+at(second.text,second.font,x1,y2,W,second.h,second.o,-1)+
    (x1-(x0+wa+18)>46?line(`M${n(x0+wa+18)} ${n(y1)}H${x1-18}`,weight.mid)+accent(x1-6,y1,7):'')+(x1-wb-18-x0>30?line(`M${x0} ${n(y2)}H${n(x1-wb-18)}`,weight.mid):'')+
    at(c.topline,'BarlowCondensed',x0,n(y1-lh/2-24),220,15,smallOpts)+(b?at(c.tagline,'BarlowCondensed',x1,n(y2+second.h/2+26),220,15,smallOpts,-1):'');
   break;}
  case 'vertical-tag':{
   const H=stackHeight(340,58,8);
   art=shift(stack(250,340,58,8)+dashed(c.topline,n(250-H/2-30),150,16)+foot(n(250+H/2+32)),-30,0)+line('M458 170V330',weight.detail)+
    `<g transform="translate(488 250) rotate(-90)">${fitText(c.tagline,'BarlowCondensed',0,0,170,18,smallOpts)}</g>`;
   break;}
  case 'initials-block':{
   const o={uppercase:true,spacing:1+(Number(c.spacing)||0)},lines=split(c.name).filter(Boolean),W=270,h=(lines.length>1?50:76)*factor;
   const k=Math.min(1,W/Math.max(...lines.map(s=>fittedTextBounds(s,c.font,1e6,h,o).width))),lh=h*k,H=lines.length*lh+(lines.length-1)*8;
   const textW=Math.max(...lines.map(s=>fittedTextBounds(s,c.font,W,lh,o).width),fittedTextBounds(c.topline,'BarlowCondensed',200,15,smallOpts).width);
   const bx=n((600-(130+22+textW))/2),tx=bx+152;
   art=accent(bx+65,163,8)+cut(path(roundRect(bx,185,130,130,10)),shift(initials(250,92,74),bx+65-300,0))+
    at(c.topline,'BarlowCondensed',tx,n(250-H/2-22),200,15,smallOpts)+lines.map((s,i)=>at(s,c.font,tx,250-H/2+lh/2+i*(lh+8),W,lh,o)).join('')+
    at(c.tagline,'BarlowCondensed',tx,n(250+H/2+24),200,15,smallOpts);
   break;}
  case 'open-frame':{
   const o={uppercase:true,spacing:1+(Number(c.spacing)||0)},W=390*factor,h=92*factor,{width,height}=fittedTextBounds(c.name,c.font,W,h,o);
   const x0=n(300-Math.max(width,240)/2-8),xr=n(x0+30+width*.68),top=n(250-height/2-56),bottom=n(250+height/2+56);
   art=line(`M${xr} ${top}H${x0}V${bottom}H${xr}`)+at(c.name,c.font,x0+30,250,W,h,o)+accent(xr+14,top,7)+accent(xr+14,bottom,7)+
    at(c.topline,'BarlowCondensed',x0+32,top+28,200,15,smallOpts)+at(c.tagline,'BarlowCondensed',x0+32,bottom-28,200,15,smallOpts);
   break;}
  case 'checker-band':{
   const H=stackHeight(420,64,8),cell=10,cols=40,x0=300-cols*cell/2;
   const strip=y=>{let d='';for(let r=0;r<2;r++)for(let i=0;i<cols;i++)if((i+r)%2===0)d+=`M${x0+i*cell} ${n(y+r*cell)}h${cell}v${cell}h-${cell}Z`;return path(d)+line(`M${x0} ${n(y)}H${600-x0}M${x0} ${n(y+2*cell)}H${600-x0}`,1.6);};
   art=strip(250-H/2-44)+stack(250,420,64,8)+strip(250+H/2+24)+small(c.topline,n(250-H/2-66),200,15)+small(c.tagline,n(250+H/2+70),200,15)+foot(n(250+H/2+96));
   break;}
  case 'bunting':{
   const y=x=>118+44*(1-((x-300)/215)**2);
   let flags='';
   for(let i=0;i<9;i++){const xa=300-215+i*(430/9)+4,xb=xa+430/9-8,xm=(xa+xb)/2,tri=poly([[xa,y(xa)],[xb,y(xb)],[xm,y(xm)+40]]);flags+=i%2?line(tri,weight.detail):path(tri);}
   const H=stackHeight(420,60,8);
   art=line(`M85 118Q300 ${118+88} 515 118`,weight.detail)+flags+stack(296,420,60,8)+small(c.tagline,n(296+H/2+34),190,16)+foot(n(296+H/2+62));
   break;}
  // ---------- emblemas: molduras novas ----------
  case 'triangle':
   art=double(poly([[300,62],[522,432],[78,432]]),.92,300,308.7)+topAccent(204)+small(c.topline,242,160,14)+stack(314,260,40,6)+rule(364,180)+small(c.tagline,394,230,14);
   break;
  case 'pennant-down':
   art=double(poly([[78,68],[522,68],[300,438]]),.92,300,191.3)+small(c.topline,104,240,14)+rule(130,200)+stack(186,220,40,6)+rule(240,150)+small(c.tagline,266,140,14)+foot(302);
   break;
  case 'greek-cross':
   art=line('M230 60H370V180H490V320H370V440H230V320H110V180H230Z')+line('M242 72H358V192H478V308H358V428H242V308H122V192H242Z',weight.inset)+
    small(c.topline,112,96,14)+accent(300,148,8)+stack(250,330,40,6)+small(c.tagline,362,96,14)+foot(398);
   break;
  case 'film-strip':{
   let holes='';for(let x=88;x<520;x+=30)holes+=`<rect x="${x}" y="148" width="14" height="18" rx="3"/><rect x="${x}" y="334" width="14" height="18" rx="3"/>`;
   art=cut(path('M70 140H530V180H70ZM70 320H530V360H70Z'),holes)+line('M70 140H530V360H70Z',weight.mid)+line('M126 180V320M474 180V320',weight.inset)+
    stack(250,300,44,6)+accent(98,250,8)+accent(502,250,8)+dashed(c.topline,110,170,16)+small(c.tagline,392,190,16);
   break;}
  case 'horseshoe':{
   const holes=[145,170,195,220,320,345,370,395].map(a=>{const [x,y]=onCircle(158,a);return `<circle cx="${n(x)}" cy="${n(y)}" r="5.5"/>`;}).join('');
   art=cut(path(sector(136,180,125,415)),holes)+topAccent(146)+small(c.topline,180,160,14)+stack(250,210,44,6)+rule(302,110)+small(c.tagline,414,140,15);
   break;}
  case 'pick':
   art=double('M300 440C130 300 100 80 300 70C500 80 470 300 300 440Z',.92,300,240)+topAccent(118)+small(c.topline,148,190,14)+stack(220,240,44,6)+
    rule(280,150)+small(c.tagline,310,150,14)+foot(348);
   break;
  case 'drop':
   art=double('M300 58C300 58 452 226 452 296A152 152 0 0 1 148 296C148 226 300 58 300 58Z',.92,300,300)+accent(300,180,9)+small(c.topline,218,150,14)+
    stack(294,240,44,6)+rule(350,140)+small(c.tagline,380,170,14)+foot(410);
   break;
  case 'police-badge':
   art=double(roundedPoly([[300,58],[352,92],[424,78],[442,140],[476,196],[444,256],[432,338],[300,442],[168,338],[156,256],[124,196],[158,140],[176,78],[248,92]],12),.92,300,250)+
    inside(118,404,230,150);
   break;
  case 'neck-label':
   art=double('M110 160Q300 112 490 160L452 346Q300 378 148 346Z',.93,300,250)+small(c.topline,172,200,14)+stack(250,300,46,6)+rule(304,170)+accent(203,304,6)+accent(397,304,6)+small(c.tagline,330,190,14);
   break;
  case 'ziggurat':
   art=line('M120 430V200H160V160H200V120H250V80H350V120H400V160H440V200H480V430Z')+line('M132 418V212H172V172H212V132H262V92H338V132H388V172H428V212H468V418Z',weight.inset)+
    accent(300,114,8)+small(c.topline,156,130,14)+rule(196,200)+stack(282,300,50,6)+rule(356,200)+small(c.tagline,386,200,14);
   break;
  case 'hanging-sign':{
   let links='';
   for(const x of [170,430])for(let y=86,i=0;y<180;y+=14,i++)links+=i%2?line(`M${x} ${y-6}V${y+6}`,4.5):`<ellipse cx="${x}" cy="${y}" rx="5.5" ry="9" fill="none" stroke="currentColor" stroke-width="3.6"/>`;
   art=line('M88 78H512',weight.frame)+accent(300,58,9)+`<circle cx="88" cy="78" r="9"/><circle cx="512" cy="78" r="9"/>`+links+line(roundRect(100,186,400,214,16))+
    line(roundRect(112,198,376,190,10),weight.inset)+dashed(c.topline,228,150,15)+
    stack(290,330,42,6)+small(c.tagline,358,200,14);
   break;}
  case 'id-badge':{
   let bars='',x=226,seed=[...String(c.name)].reduce((a,ch)=>a*31+ch.charCodeAt(0)>>>0,7);
   while(x<372){seed=(seed*1103515245+12345)>>>0;const w=1.5+(seed>>>16)%4;bars+=`M${n(x)} 352h${w}v46h-${w}Z`;x+=w+2+((seed>>>8)%3);}
   art=line(roundRect(185,62,230,378,22))+line(roundRect(268,86,64,14,7),weight.inset)+cut(disc(0)+`<circle cx="300" cy="182" r="54"/>`,initials(182,70,52))+
    stack(272,190,28,5)+small(c.tagline,324,170,13)+path(bars)+foot(420);
   break;}
  case 'street-sign':
   art=path('M292 318H308V446H292Z')+accent(108,250,7)+line('M84 182H468L526 250 468 318H84Z')+line('M96 194H462L511 250 462 306H96Z',weight.inset)+
    shift(bandName(240,320,60)+small(c.tagline,290,200,14),-12,0)+dashed(c.topline,150,170,16);
   break;
  case 'warning':{
   const tri=[[300,62],[526,436],[74,436]];
   art=cut(path(roundedPoly(tri,34)),inset(line(roundedPoly(tri,34),weight.inset/.86),.86,300,318)+accent(300,214,12)+small(c.topline,262,130,15)+
    stack(330,280,42,6)+small(c.tagline,398,240,14));
   break;}
  // ---------- selos: bordas novas ----------
  case 'sawtooth':{
   const teeth=Array.from({length:48},(_,i)=>{const a=i*7.5;return poly([onCircle(164,a-3.75),onCircle(146,a),onCircle(164,a+3.75)]);}).join('');
   art=circle(178)+path(teeth)+circle(164,weight.detail)+topArc(122,18)+bottomArc(130,18)+topAccent(178)+stack(250,200,40,6)+rule(306,90);
   break;}
  case 'checker-ring':{
   let d='';for(let i=0;i<40;i++)d+=sector(i%2?164:150,i%2?178:164,i*9-90,i*9-81);
   art=path(d)+circle(178,weight.inset)+circle(150,weight.inset)+topAccent(170)+small(c.topline,190,150,14)+stack(250,210,44,6)+rule(302,100)+small(c.tagline,324,150,14);
   break;}
  case 'engraving':{
   let hatch='';for(let y=292;y<420;y+=6)hatch+=`M120 ${y}H480`;
   art=circle(178)+circle(166,weight.inset)+masked(line(hatch,2),`<circle cx="300" cy="250" r="156"/>`,'<rect x="226" y="326" width="148" height="34"/>')+
    line(`M${n(300-Math.sqrt(156**2-42**2))} 292H${n(300+Math.sqrt(156**2-42**2))}`,weight.inset)+topArc(130,20)+topAccent(176)+stack(236,230,38,6)+small(c.tagline,343,130,14);
   break;}
  case 'text-ring':{
   const one=`${String(c.topline).trim()} · `,size=18,r=158,reps=Math.max(1,Math.ceil(2*Math.PI*r*.96/Math.max(1,one.length*size*.62)));
   art=circle(178)+circle(146,weight.inset)+arcText(one.repeat(reps).trim(),300,250,r,{size,spacing:2,maxAngle:2*Math.PI*.97})+
    topAccent(186)+stack(250,220,48,6)+rule(308,100)+small(c.tagline,330,140,14);
   break;}
  case 'globe':{
   const band=chordBand(146,214,286);
   const grid=['<ellipse cx="300" cy="250" rx="100" ry="146"/>','<ellipse cx="300" cy="250" rx="48" ry="146"/>'].map(e=>e.replace('/>',' fill="none" stroke="currentColor" stroke-width="2"/>')).join('')+
    line('M300 104V396M154 250H446M175 180H425M175 320H425M218 134H382M218 366H382',2);
   art=circle(178)+circle(150,weight.inset)+topArc(158,16)+bottomArc(170,16)+masked(grid,'<circle cx="300" cy="250" r="146"/>',path(band,'stroke="black" stroke-width="10"'))+
    circle(146,weight.detail)+cut(path(band),bandName(250,250,44))+accent(136,250,7)+accent(464,250,7);
   break;}
  case 'target':
   art=circle(180,weight.mid)+cut(circle(147,38),topArc(142,19)+bottomArc(150,19))+circle(116,weight.inset)+topAccent(178)+stack(250,180,38,6)+rule(300,80);
   break;
  case 'chain-seal':{
   let links='';
   for(let i=0;i<36;i++){const a=i*10,[x,y]=onCircle(172,a);links+=i%2?`<rect x="${n(x-10)}" y="${n(y-3)}" width="20" height="6" rx="3" transform="rotate(${n(a+90)} ${n(x)} ${n(y)})"/>`:
    `<ellipse cx="${n(x)}" cy="${n(y)}" rx="12.5" ry="7" fill="none" stroke="currentColor" stroke-width="4.2" transform="rotate(${n(a+90)} ${n(x)} ${n(y)})"/>`;}
   art=links+circle(154,weight.inset)+topArc(130,19)+bottomArc(138,19)+topAccent(178)+stack(250,205,40,6)+rule(306,90);
   break;}
  // ---------- cruzamentos ----------
  case 'shadow-seal':
   art=circle(178)+circle(166,weight.inset)+topArc(140,20)+bottomArc(148,20)+topAccent(180)+dropFx(stack(246,230,46,6),lineHeight(230,46,6)).art+rule(314,90);
   break;
  case 'extrude-plate':
   art=line(wideHex)+line(wideHexInset,weight.inset)+dashed(c.topline,128,170,16)+extrudeFx(stack(240,300,40,6),lineHeight(300,40,6)).art+small(c.tagline,308,170,13)+foot(372);
   break;
  case 'sticker-disc':{
   const nm=scriptName(250,470,120);
   art=cut(disc(168),stroked(nm,30,'currentColor')+topArc(140,20)+bottomArc(148,20)+row(170,3,6,22))+outlineFx(nm);
   break;}
  case 'split-seal':{
   const {width}=fittedTextBounds(c.name,c.font,230*factor,70*factor,nameOpts);
   art=circle(178)+circle(166,weight.inset)+topArc(140,20)+bottomArc(148,20)+topAccent(180)+halfFx(name(250,230,70),250)+
    (width<200?line(`M${n(300-width/2-46)} 250h30M${n(300+width/2+16)} 250h30`,weight.detail):'')+rule(312,90);
   break;}
  case 'stripes-hex':{
   const {height}=fittedTextBounds(c.name,c.font,220*factor,72*factor,nameOpts);
   art=line(hex)+line(hexInset,weight.inset)+topAccent(142)+small(c.topline,180,180,14)+stripeFx(name(252,220,72),252-height/2,height)+rule(310,150)+small(c.tagline,334,150,14);
   break;}
  case 'speed-pill':{
   const pill='M110 168H490A82 82 0 0 1 490 332H110A82 82 0 0 1 110 168Z',pillIn='M110 180H490A70 70 0 0 1 490 320H110A70 70 0 0 1 110 180Z';
   art=line(pill)+line(pillIn,weight.inset)+speedFx(330,250,270,74,70).art+accent(500,250,8)+dashed(c.topline,136,170,16)+small(c.tagline,366,190,16);
   break;}
  case 'hatch-shield':
   art=line(shield)+line(shieldInset,weight.inset)+topAccent(132)+small(c.topline,162,170,14)+hatchFx(stack(244,200,52,8),lineHeight(200,52,8)).art+
    rule(318,130)+small(c.tagline,344,140,14)+foot(380);
   break;
  case 'shadow-ticket':
   art=line(ticket)+line(ticketInset,weight.inset)+small(c.topline,136,200,14)+rule(160,200)+dropFx(stack(246,250,54,8),lineHeight(250,54,8)).art+rule(334,200)+
    small(c.tagline,360,200,14)+foot(386);
   break;
  case 'rope-frame':{
   // Perímetro do retângulo arredondado percorrido por comprimento, para os fios ficarem regulares.
   const x=94,y=112,w=412,h=276,r=40,L=2*(w+h-4*r)+2*Math.PI*r;
   const at=t=>{let d=t*L;const seg=[[w-2*r,(s)=>[x+r+s,y]],[Math.PI*r/2,(s)=>{const a=-Math.PI/2+s/r;return [x+w-r+Math.cos(a)*r,y+r+Math.sin(a)*r];}],[h-2*r,(s)=>[x+w,y+r+s]],
    [Math.PI*r/2,(s)=>{const a=s/r;return [x+w-r+Math.cos(a)*r,y+h-r+Math.sin(a)*r];}],[w-2*r,(s)=>[x+w-r-s,y+h]],[Math.PI*r/2,(s)=>{const a=Math.PI/2+s/r;return [x+r+Math.cos(a)*r,y+h-r+Math.sin(a)*r];}],
    [h-2*r,(s)=>[x,y+h-r-s]],[Math.PI*r/2,(s)=>{const a=Math.PI+s/r;return [x+r+Math.cos(a)*r,y+r+Math.sin(a)*r];}]];
    for(const [len,f] of seg){if(d<=len)return f(d);d-=len;}return [x+r,y];};
   art=ropeFx(at,Math.round(L/12))+line(roundRect(120,138,360,224,22),weight.inset)+inside(150,350,330);
   break;}
  case 'rope-oval':{
   const at=t=>[300+Math.cos(t*2*Math.PI)*226,250+Math.sin(t*2*Math.PI)*164];
   art=ropeFx(at,104)+'<ellipse cx="300" cy="250" rx="200" ry="138" fill="none" stroke="currentColor" stroke-width="3.2"/>'+
    topAccent(150)+small(c.topline,180,190,14)+stack(250,300,46,6)+rule(306,170)+small(c.tagline,330,170,14);
   break;}
  case 'wax-monogram':{
   const blob=poly(Array.from({length:240},(_,i)=>{const a=i*Math.PI*2/240,r=176+4*Math.sin(3*a+1)+3*Math.sin(5*a+2.3)+2.2*Math.sin(9*a+.7)+1.4*Math.sin(14*a);return [300+Math.cos(a)*r,250+Math.sin(a)*r];}));
   art=cut(path(blob),circle(124,4)+circle(160,weight.detail)+arcText(c.name,300,250,136,{size:18,spacing:3,maxAngle:2.2,font:'BarlowCondensed'})+bottomArc(146,17)+
    initials(238,150,104)+small(c.topline,318,110,13)+accent(300,344,7));
   break;}
  case 'marquee-arrow':{
   let bulbs='';for(let x=100;x<=420;x+=24)bulbs+=`<circle cx="${x}" cy="172" r="4.5"/><circle cx="${x}" cy="328" r="4.5"/>`;
   for(let y=196;y<=304;y+=27)bulbs+=`<circle cx="92" cy="${y}" r="4.5"/>`;
   art=line('M70 150H440L530 250 440 350H70Z')+bulbs+accent(450,250,7)+line('M112 192H430L478 250 430 308H112Z',weight.inset)+shift(stack(232,280,40,6)+small(c.tagline,294,170,13),-14,0)+dashed(c.topline,118,170,16);
   break;}
  case 'shadow-banner':{
   const H=stackHeight(420,66,10),fx=dropFx(stack(212,420,66,10),lineHeight(420,66,10)),by=n(212+H/2+fx.o+46);
   art=fx.art+dashed(c.topline,n(212-H/2-32),150,16)+solidFolded(by,180,420,40,small(c.tagline,by,170,15)).art+foot(by+46);
   break;}
  case 'split-box':{
   const {width}=fittedTextBounds(c.name,c.font,300*factor,110*factor,nameOpts),gap=width/2+14;
   art=line('M108 128H492V372H108Z')+accent(142,162,6)+accent(458,162,6)+line('M120 140H480V360H120Z',weight.inset)+small(c.topline,168,200,14)+halfFx(name(254,300,110),254)+
    (300-gap-120>16?line(`M120 254H${n(300-gap)}M${n(300+gap)} 254H480`,weight.detail):'')+small(c.tagline,336,200,14);
   break;}
  case 'left-rules':{
   const o={uppercase:true,spacing:1+(Number(c.spacing)||0)},lines=split(c.name).filter(Boolean),W=360,h=(lines.length>1?64:96)*factor;
   const k=Math.min(1,W/Math.max(...lines.map(s=>fittedTextBounds(s,c.font,1e6,h,o).width))),lh=h*k,H=lines.length*lh+(lines.length-1)*10;
   const bw=Math.max(...lines.map(s=>fittedTextBounds(s,c.font,W,lh,o).width),200),x0=n((600-bw)/2),y0=250-H/2;
   art=path(`M${x0} ${n(y0-28)}h${n(bw)}v9h-${n(bw)}Z`)+accent(n(x0+bw+16),n(y0-23.5),7)+at(c.topline,'BarlowCondensed',x0,n(y0-46),220,15,smallOpts)+
    lines.map((s,i)=>at(s,c.font,x0,y0+lh/2+i*(lh+10),W,lh,o)).join('')+line(`M${x0} ${n(y0+H+22)}h${n(bw)}`,weight.detail)+
    at(c.tagline,'BarlowCondensed',x0+bw,n(y0+H+44),220,15,smallOpts,-1);
   break;}
  case 'year-box':{
   const year=/\d{4}/.exec(c.tagline)?.[0],box=x=>roundRect(x-38,212,76,76,6);
   const digits=(s,x)=>fitText(s,'BebasNeue',x,250,52,54);
   art=cut(path(box(96))+path(box(504)),year?digits(year.slice(0,2),96)+digits(year.slice(2),504):accent(96,250,14)+accent(504,250,14))+
    stack(250,270,56,8)+dashed(c.topline,166,170,16)+row(334,3,7,22);
   break;}
  case 'outlined-ring':{
   const nm=scriptName(252,520,130);
   art=masked(circle(178)+circle(166,weight.inset)+topArc(140,20)+bottomArc(148,20)+row(366,3,6,22),all,stroked(nm,30,'currentColor'))+outlineFx(nm);
   break;}
  case 'extrude-badge':
   art=line(roundShield)+line(roundShieldInset,weight.inset)+topAccent(126)+small(c.topline,156,200,14)+extrudeFx(stack(244,230,58,8),lineHeight(230,58,8)).art+
    rule(330,140)+small(c.tagline,354,160,14)+foot(388);
   break;
  case 'tiles-seal':{
   const {art:cells,H,long,full}=tilesFx(246,240,60);
   art=circle(178)+circle(166,weight.inset)+topArc(140,20)+bottomArc(148,20)+topAccent(n(246-H/2-24))+cells+
    (long?fitText(full,c.font,300,n(246+H/2+22),220,16,{uppercase:true,spacing:1.5}):rule(n(246+H/2+22),90));
   break;}
  case 'speed-seal':{
   const fx=speedFx(322,250,226,64,138);
   art=circle(178)+circle(166,weight.inset)+topArc(140,20)+bottomArc(148,20)+topAccent(180)+fx.art+rule(n(250+fx.height/2+26),100);
   break;}
 }
 return svgDoc(c.name,p.name,variant,background,art);
}
