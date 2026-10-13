import {fitText,arcText} from './engine.js';
import {weight,n,path,line,circle,dotted,dottedLine,disc,ellipse,cut,svgDoc,poly,regular,wideHex,wideHexInset,hex,hexInset,shield,shieldInset,
 diamondShape,diamondInset,roundRect,rosette,sector,chordBand,folded,solidFolded,laurel,ticks,beads,sunRays,wave,star,textKit} from './kit.js';

// Rodada 5: 50 modelos com estruturas que ainda não existiam no catálogo
// (medalha, roseta de prêmio, monogramas, placa, etiqueta, flâmula, asas, varsity, script).
const t=(id,name,category,font,sample,desc,options={})=>({id,name,category,font,sample,desc,ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',...options});
export const round5Templates=[
 // Selos
 t('triple-ring','Triple ring','Selos','BebasNeue','HARBOR','Três anéis de pesos diferentes e nome em linha única.',{tagline:'EST. 2026'}),
 t('split-disc','Split disc','Selos','BarlowCondensed','NORTH STAR','Topo e base sólidos com o nome na faixa clara do meio.'),
 t('ring-gaps','Ring gaps','Selos','Oswald','COMPASS','Anel duplo interrompido nas laterais por ornamentos.'),
 t('bead-ring','Bead ring','Selos','AlfaSlabOne','GOLDEN','Anel de contas com selo interno.'),
 t('sun-seal','Sun seal','Selos','BarlowCondensed','SUNNY DAYS','Disco sólido com raios ao redor e textos vazados.'),
 t('award','Award rosette','Selos','BarlowCondensed','FIRST PLACE','Roseta de prêmio com duas fitas pendentes.',{tagline:'CHAMPION'}),
 t('medal','Medal','Selos','AlfaSlabOne','WINNER','Medalha circular pendurada por uma fita.',{tagline:'EST. 2026'}),
 t('scallop-disc','Scallop disc','Selos','AlfaSlabOne','BAKERY','Roseta em contorno com disco central sólido.'),
 t('banded-arcs','Banded arcs','Selos','BebasNeue','ROAD TRIP','Arcos sólidos com textos vazados e nome atravessando.',{topline:'ADVENTURE CLUB',tagline:'EST. 2026'}),
 t('chevron-seal','Chevron seal','Selos','Oswald','FORWARD','Anel duplo com divisas apontando para o nome.'),
 t('clock-seal','Clock seal','Selos','BebasNeue','TIMELESS','Anel com marcas de hora e nome central.',{tagline:'EST. 1950'}),
 t('laurel-base','Laurel base','Selos','Oswald','CLASSIC','Anel duplo com louros na base.'),
 t('star-crest','Star crest','Selos','BarlowCondensed','ALL STARS','Estrela grande rompendo o topo do anel.'),
 t('sunset','Sunset','Selos','BebasNeue','SUNSET','Sol listrado em estilo retrô dentro do círculo.',{topline:'BEACH CLUB',tagline:'EST. 2026'}),
 t('wave-seal','Wave seal','Selos','BarlowCondensed','SURF SHOP','Anel duplo com ondas na base.',{topline:'PACIFIC COAST'}),
 t('monogram-circle','Monogram seal','Selos','AlfaSlabOne','NORTH CLUB','Iniciais grandes com o nome no arco inferior.',{tagline:'EST. 2026'}),
 // Emblemas
 t('banner-flag','Banner flag','Emblemas','Oswald','HIGHLAND','Flâmula vertical com ponta recortada.'),
 t('banner-solid','Solid banner','Emblemas','BarlowCondensed','PIONEER','Flâmula sólida com textos vazados.'),
 t('heater-band','Heater shield','Emblemas','AlfaSlabOne','GUARDIAN','Escudo clássico com faixa sólida atravessando.',{tagline:'EST. 2026'}),
 t('notch-shield','Notched shield','Emblemas','Oswald','LEGACY','Escudo com topo recortado em curvas.'),
 t('pentagon','Pentagon','Emblemas','BarlowCondensed','HOME PLATE','Pentágono em ponta com contorno duplo.'),
 t('pentagon-solid','Solid pentagon','Emblemas','BebasNeue','BALL CLUB','Pentágono sólido com contorno pontilhado vazado.',{tagline:'EST. 1920'}),
 t('octagon-solid','Solid octagon','Emblemas','Oswald','STOP SHOP','Octógono sólido com contorno pontilhado vazado.'),
 t('tall-pill','Tall pill','Emblemas','BebasNeue','TONIC','Cápsula vertical com contorno duplo.',{tagline:'EST. 2026'}),
 t('ticket-stub','Ticket stub','Emblemas','BebasNeue','ADMIT ONE','Ingresso com recortes semicirculares nas laterais.',{topline:'GOOD FOR',tagline:'GENERAL ADMISSION'}),
 t('scroll','Scroll','Emblemas','AlfaSlabOne','ARCHIVE','Pergaminho com pontas enroladas.'),
 t('tab-frame','Tab frame','Emblemas','Oswald','RECORDS','Moldura com aba sólida no topo.'),
 t('corner-frame','Corner frame','Emblemas','BebasNeue','GALLERY','Cantoneiras nos quatro cantos do nome.',{tagline:'EST. 2026'}),
 t('oval-lines','Oval lines','Emblemas','Oswald','ROASTERS','Oval duplo com o nome entre linhas.'),
 t('diamond-stack','Diamond stack','Emblemas','BarlowCondensed','ACE CLUB','Losango duplo com nome em duas linhas.',{ornament:'diamond'}),
 t('wide-hex-ribbon','Wide hexagon ribbon','Emblemas','AlfaSlabOne','VINTAGE','Hexágono alongado com faixa dobrada.',{tagline:'EST. 1990'}),
 t('gothic-arch','Gothic arch','Emblemas','BarlowCondensed','CHAPEL','Arco ogival com contorno duplo.'),
 t('winged','Winged circle','Emblemas','BebasNeue','AVIATOR','Círculo com asas de penas laterais.',{tagline:'EST. 1945'}),
 t('square-ring','Square ring','Emblemas','BarlowCondensed','CORNER SHOP','Quadrado sólido com selo circular vazado.'),
 t('license-plate','License plate','Emblemas','BebasNeue','ROUTE 66','Placa com parafusos e nome grande.',{topline:'CALIFORNIA',tagline:'MOTOR CLUB'}),
 t('luggage-tag','Luggage tag','Emblemas','Oswald','TRAVEL CO','Etiqueta com furo e cantos chanfrados.'),
 t('shield-ribbon-base','Shield ribbon','Emblemas','AlfaSlabOne','DEFENSE','Escudo com faixa sólida dobrada na base.',{tagline:'EST. 2026'}),
 t('monogram-hex','Monogram hexagon','Emblemas','AlfaSlabOne','BLUE HARBOR','Hexágono com iniciais grandes e nome abaixo.'),
 // Lettering
 t('masthead','Masthead','Lettering','BebasNeue','THE DAILY','Cabeçalho de jornal com filetes grossos e finos.',{topline:'VOL. 1 · EST. 2026',tagline:'INDEPENDENT NEWS'}),
 t('side-texts','Side texts','Lettering','BebasNeue','BRAND','Textos curtos nas laterais do nome.',{topline:'EST.',tagline:'2026'}),
 t('underline-stars','Underline stars','Lettering','AlfaSlabOne','FAMOUS','Nome com sublinhado duplo e fileira de estrelas.'),
 t('script-swoosh','Script swoosh','Lettering','Lobster','Good Times','Nome em script com traço afinado por baixo.',{tagline:'EST. 2026'}),
 t('script-banner','Script banner','Lettering','OleoScript','Sweet Home','Nome em script sobre faixa sólida dobrada.',{tagline:'BAKERY'}),
 t('script-arc','Script arc','Lettering','Pacifico','Island','Nome em script sob texto curvo.',{topline:'SURF & COFFEE',tagline:'EST. 2026'}),
 t('centered-rule','Centered rule','Lettering','Oswald','ATELIER','Filetes com ornamento central acima e abaixo do nome.',{ornament:'diamond'}),
 t('arched-name','Arched name','Lettering','AlfaSlabOne','VARSITY','Nome em arco com filete acompanhando a curva.',{tagline:'EST. 2026'}),
 t('varsity','Varsity','Lettering','Bungee','ATHLETICS','Nome em arco sobre faixa sólida dobrada.',{tagline:'EST. 2026'}),
 t('stencil-bar','Stencil bars','Lettering','BebasNeue','INDUSTRIAL','Barras sólidas com textos vazados acima e abaixo do nome.'),
 t('twin-boxes','Twin boxes','Lettering','AlfaSlabOne','HANDMADE','Nome com dois quadros de texto lado a lado.',{topline:'EST. 2026',tagline:'NEW YORK'}),
 t('dot-leaders','Dot leaders','Lettering','BebasNeue','STUDIO','Nome entre linhas pontilhadas.',{tagline:'EST. 2026'}),
];

export function renderRound5(id,config={},variant='light',background=true){
 const p=round5Templates.find(p=>p.id===id);if(!p)throw new Error('Modelo desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const {factor,none,accent,topAccent,foot,row,arcRow,small,dashed,topArc,bottomArc,name,stack,bandName,archedName,scriptName,initials,nameWidth}=textKit(c);
 const opts={uppercase:true,spacing:2};
 const smallAt=(text,x,y,w,h)=>fitText(text,'BarlowCondensed',x,y,w,h,opts);
 let art='';
 switch(id){
  // ---------- selos ----------
  case 'triple-ring':
   art=circle(178)+circle(167,weight.detail)+circle(154,weight.mid)+topArc(132,20)+bottomArc(140,20)+
       bandName(250,230,62)+accent(172,250,8)+accent(428,250,8);
   break;
  case 'split-disc':
   art=circle(178)+cut(path(chordBand(168,82.5,212))+path(chordBand(168,288,417.5)),topArc(136,20)+topAccent(182)+bottomArc(144,20))+
       bandName(250,300,52);
   break;
  case 'ring-gaps':{
   const gaps='<rect x="96" y="226" width="52" height="48"/><rect x="452" y="226" width="52" height="48"/>';
   art=cut(circle(176)+circle(162,weight.inset),gaps)+accent(123,250,11)+accent(477,250,11)+topArc(140,21)+bottomArc(148,21)+
       topAccent(182)+stack(252,220,42,6);
   break;}
  case 'bead-ring':
   art=beads(176,56,5)+circle(160,weight.frame)+circle(148,weight.inset)+topArc(126,20)+bottomArc(134,19)+topAccent(176)+stack(252,205,40,6);
   break;
  case 'sun-seal':
   art=sunRays(150,184,36)+cut(disc(144),dotted(132)+topArc(112,18)+bottomArc(120,17)+topAccent(170)+stack(250,190,38,6));
   break;
  case 'award':{
   const tail='M246 286L214 436L246 418L272 444L292 302Z';
   const tails=path(tail)+`<g transform="translate(600 0) scale(-1 1)">${path(tail)}</g>`;
   art=cut(tails,path(rosette(118,20,12,196),'stroke="black" stroke-width="14"'))+
       cut(path(rosette(118,20,12,196)),`<circle cx="300" cy="196" r="104" fill="none" stroke="currentColor" stroke-width="3.2"/>`+
       row(126,5,6)+small(c.topline,150,130,13)+stack(200,160,27,5)+small(c.tagline,250,120,13)+row(272,3,5,16));
   break;}
  case 'medal':{
   const strap='M246 34H354L332 150H268Z';
   art=cut(path(strap),path('M286 34H314V150H286Z'))+
       `<circle cx="300" cy="292" r="136" fill="none" stroke="currentColor" stroke-width="8"/><circle cx="300" cy="292" r="124" fill="none" stroke="currentColor" stroke-width="3.2"/>`+
       topArc(104,18,'BarlowCondensed',292,2)+bottomArc(112,17,'BarlowCondensed',292,2)+row(244,3,7,22)+stack(298,215,40,6);
   break;}
  case 'scallop-disc':
   art=line(rosette(166,16,10))+topArc(140,16,'BarlowCondensed',250,2.4)+bottomArc(152,15,'BarlowCondensed',250,2.6)+
       cut(disc(124),row(186,5,6)+stack(252,180,38,6)+row(316,5,6));
   break;
  case 'banded-arcs':
   art=cut(path(sector(128,178,206,334))+path(sector(128,178,26,154)),topArc(146,22)+bottomArc(168,21))+
       line('M84 216H516M84 284H516',weight.inset)+bandName(250,300,48)+accent(108,250,8)+accent(492,250,8);
   break;
  case 'chevron-seal':
   art=circle(176)+circle(164,weight.inset)+topArc(140,21)+bottomArc(148,21)+
       line('M172 228l-18 22 18 22M192 228l-18 22 18 22M428 228l18 22-18 22M408 228l18 22-18 22',weight.mid)+
       topAccent(182)+bandName(250,190,56);
   break;
  case 'clock-seal':
   art=circle(178)+ticks(150,166,60,1.6)+ticks(144,166,12,weight.mid)+circle(136,weight.inset)+topArc(114,18)+bottomArc(122,17)+
       topAccent(176)+bandName(250,200,58);
   break;
  case 'laurel-base':
   art=circle(176)+circle(164,weight.inset)+laurel(130,96,166,5,.8)+topArc(140,21)+topAccent(176)+stack(240,215,44,6)+small(c.tagline,318,120,14);
   break;
  case 'star-crest':
   art=cut(circle(170)+circle(158,weight.inset),`<circle cx="300" cy="82" r="40"/>`)+star(300,84,34)+
       small(c.topline,160,150,15)+stack(246,215,46,6)+line('M245 306H355',weight.detail)+bottomArc(146,20)+arcRow(146,190,200,2,0);
   break;
  case 'sunset':{
   const stripes=[262,282,300,316,330].map((y,i)=>`<rect x="190" y="${y}" width="220" height="${4+i*1.6}"/>`).join('');
   art=circle(178)+circle(166,weight.inset)+topArc(144,21)+cut(`<circle cx="300" cy="248" r="92"/>`,stripes+'<rect x="190" y="340" width="220" height="20"/>')+
       line('M150 340H450',weight.inset)+name(372,220,40)+small(c.tagline,404,110,12)+accent(300,140,7);
   break;}
  case 'wave-seal':
   art=circle(176)+circle(164,weight.inset)+topArc(140,21)+topAccent(178)+stack(240,220,42,6)+small(c.tagline,300,150,14)+
       line(wave(334,198,402,5,30)+wave(354,214,386,5,30),weight.inset)+(none?'':accent(300,382,6));
   break;
  case 'monogram-circle':
   art=circle(178)+circle(166,weight.inset)+topArc(142,20)+arcText(c.name,300,250,150,{bottom:true,size:22,spacing:3,maxAngle:2.4,font:'BarlowCondensed'})+
       initials(238,180,118)+line('M240 312H360',weight.detail)+small(c.tagline,332,120,13)+accent(170,250,8)+accent(430,250,8);
   break;
  // ---------- emblemas ----------
  case 'banner-flag':
   art=line('M185 70H415V395L300 340L185 395Z')+line('M197 82H403V375.6L300 326.4L197 375.6Z',weight.inset)+topAccent(118)+
       small(c.topline,150,150,15)+line('M215 172H385M215 290H385',weight.detail)+stack(231,175,40,6)+small(c.tagline,312,140,14);
   break;
  case 'banner-solid':
   art=cut(path('M185 70H415V395L300 340L185 395Z'),dottedLine('M197 82H403V375.6L300 326.4L197 375.6Z')+topAccent(118)+
       small(c.topline,150,150,15)+line('M215 172H385M215 290H385',weight.detail)+stack(231,175,40,6)+small(c.tagline,312,140,14));
   break;
  case 'heater-band':{
   const frame='M170 85H430V230Q430 360 300 430Q170 360 170 230Z',inset='M182 97H418V230Q418 352 300 416Q182 352 182 230Z';
   const band='M112 202H488L472 236 488 270H112L128 236Z';
   art=cut(line(frame)+line(inset,weight.inset),path(band,'stroke="black" stroke-width="16"'))+cut(path(band),bandName(236,300,44))+
       small(c.topline,140,150,15)+topAccent(172)+dashed(c.tagline,318,120,15)+foot(356);
   break;}
  case 'notch-shield':
   art=line('M160 95Q230 112 300 80Q370 112 440 95V260Q440 380 300 432Q160 380 160 260Z')+
       line('M172 106Q233 122 300 93Q367 122 428 106V260Q428 371 300 419Q172 371 172 260Z',weight.inset)+
       topAccent(148)+small(c.topline,180,150,15)+line('M200 200H400M200 304H400',weight.detail)+stack(252,210,44,6)+small(c.tagline,330,150,15)+foot(368);
   break;
  case 'pentagon':
   art=line('M150 85H450V300L300 425L150 300Z')+line('M162 97H438V294.4L300 409.4L162 294.4Z',weight.inset)+dashed(c.topline,136,150,15)+
       topAccent(166)+line('M180 192H420M180 300H420',weight.detail)+stack(246,225,44,6)+small(c.tagline,328,140,14)+foot(362);
   break;
  case 'pentagon-solid':
   art=cut(path('M150 85H450V300L300 425L150 300Z'),dottedLine('M162 97H438V294.4L300 409.4L162 294.4Z')+dashed(c.topline,136,150,15)+
       topAccent(166)+stack(246,240,46,6)+small(c.tagline,318,150,14)+foot(352));
   break;
  case 'octagon-solid':
   art=cut(path(regular(8,184,Math.PI/8)),dottedLine(regular(8,170,Math.PI/8))+small(c.topline,140,150,15)+topAccent(170)+
       stack(250,240,46,6)+line('M245 312H355',weight.detail)+small(c.tagline,336,150,15)+foot(366));
   break;
  case 'tall-pill':
   art=line(roundRect(205,62,190,376,95))+line(roundRect(217,74,166,352,83),weight.inset)+topAccent(134)+small(c.topline,168,120,13)+
       stack(250,150,36,6)+line('M260 314H340',weight.detail)+small(c.tagline,336,120,13)+foot(368);
   break;
  case 'ticket-stub':{
   const stub='M110 140H490V222A28 28 0 0 0 490 278V360H110V278A28 28 0 0 0 110 222Z';
   art=line(stub)+dottedLine('M150 156V344M450 156V344')+small(c.topline,180,150,15)+name(250,270,64)+small(c.tagline,320,170,15)+
       accent(130,180,6)+accent(470,180,6)+accent(130,320,6)+accent(470,320,6);
   break;}
  case 'scroll':{
   const main='M140 182H460V318H140Z';
   const ends=line(roundRect(106,168,58,164,16))+line(roundRect(436,168,58,164,16));
   art=cut(ends,path(main))+line(main)+line('M152 194H448V306H152Z',weight.inset)+topAccent(120)+small(c.topline,152,180,16)+
       bandName(250,270,56)+small(c.tagline,352,180,16);
   break;}
  case 'tab-frame':{
   const tab='M196 112H404V170H196Z';
   art=cut(line('M110 160H490V384H110Z')+line('M122 172H478V372H122Z',weight.inset),path(tab,'stroke="black" stroke-width="12"'))+
       cut(path(tab),smallAt(c.topline,300,141,170,17))+topAccent(212)+stack(272,300,48,6)+small(c.tagline,346,170,15);
   break;}
  case 'corner-frame':
   art=line('M100 172V132H140M460 132H500V172M500 328V368H460M140 368H100V328')+line('M116 148H484V352H116Z',weight.detail)+
       topAccent(178)+small(c.topline,206,170,15)+name(258,320,64)+small(c.tagline,316,170,15)+foot(338);
   break;
  case 'oval-lines':
   art=ellipse(205,150)+ellipse(193,138,weight.inset)+topAccent(138)+small(c.topline,170,150,15)+line('M126 198H474M126 302H474',weight.detail)+
       bandName(250,300,58)+small(c.tagline,330,150,15)+foot(360);
   break;
  case 'diamond-stack':
   art=line(diamondShape)+line(diamondInset,weight.inset)+small(c.topline,165,110,14)+accent(300,192,7)+stack(250,180,36,6)+
       small(c.tagline,314,110,14)+foot(342);
   break;
  case 'wide-hex-ribbon':{
   const r=folded(250,116,484,60);
   art=cut(line(wideHex)+line(wideHexInset,weight.inset),path(r.area))+r.art+small(c.topline,195,130,14)+accent(222,195,6)+accent(378,195,6)+bandName(250,320,40)+
       dashed(c.tagline,305,120,14);
   break;}
  case 'gothic-arch':
   art=line('M165 410V240Q165 130 300 75Q435 130 435 240V410Z')+line('M177 398V240Q177 138 300 88Q423 138 423 240V398Z',weight.inset)+
       topAccent(160)+small(c.topline,194,150,15)+stack(262,215,42,6)+line('M245 326H355',weight.detail)+small(c.tagline,352,150,15)+foot(380);
   break;
  case 'winged':{
   const feathers=[0,1,2,3].map(i=>{const len=150-i*26,y=206+i*24;return path(roundRect(206-len,y,len,16,8));}).join('');
   art=feathers+`<g transform="translate(600 0) scale(-1 1)">${feathers}</g>`+circle(96)+circle(84,weight.inset)+
       small(c.topline,132,200,16)+row(206,3,5,15)+stack(252,140,30,6)+small(c.tagline,296,100,12);
   break;}
  case 'square-ring':
   art=cut(path('M120 70H480V430H120Z'),circle(150,weight.inset)+topArc(128,20)+bottomArc(137,19)+topAccent(178)+stack(250,210,42,6)+
       accent(150,100,7)+accent(450,100,7)+accent(150,400,7)+accent(450,400,7));
   break;
  case 'license-plate':{
   const screw=(x,y)=>`<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="currentColor" stroke-width="3.2"/>`;
   art=line(roundRect(95,140,410,220,26))+line(roundRect(107,152,386,196,16),weight.inset)+screw(140,178)+screw(460,178)+screw(140,322)+screw(460,322)+
       small(c.topline,180,180,18)+name(252,300,76)+small(c.tagline,322,180,16)+(none?'':accent(220,180,6)+accent(380,180,6));
   break;}
  case 'luggage-tag':
   art=line('M220 85H380L415 120V420H185V120Z')+line('M225 97H375L403 125V408H197V125Z',weight.inset)+
       `<circle cx="300" cy="126" r="11" fill="none" stroke="currentColor" stroke-width="3.2"/>`+small(c.topline,172,150,14)+
       line('M215 192H385M215 308H385',weight.detail)+stack(250,170,38,6)+small(c.tagline,332,150,14)+foot(372)+(none?'':row(156,2,5,60));
   break;
  case 'shield-ribbon-base':{
   const r=solidFolded(336,150,450,44,smallAt(c.tagline,300,336,230,17));
   art=cut(line(shield)+line(shieldInset,weight.inset),path(r.area,'stroke="black" stroke-width="16"'))+r.art+
       small(c.topline,148,150,15)+topAccent(178)+stack(252,210,44,6);
   break;}
  case 'monogram-hex':
   art=line(hex)+line(hexInset,weight.inset)+small(c.topline,146,140,14)+topAccent(172)+initials(250,170,100)+
       line('M230 306H370',weight.detail)+small(c.name,330,170,18)+foot(366);
   break;
  // ---------- lettering ----------
  case 'masthead':
   art=line('M100 146H500')+small(c.topline,168,240,15)+line('M100 186H500',weight.detail)+name(250,400,84)+
       line('M100 314H500',weight.detail)+small(c.tagline,334,240,15)+line('M100 354H500')+(none?'':accent(112,168,6)+accent(488,168,6));
   break;
  case 'side-texts':
   art=topAccent(170)+smallAt(c.topline,112,250,64,22)+smallAt(c.tagline,488,250,64,22)+line('M152 212V288M448 212V288',weight.inset)+
       name(250,270,80)+line('M180 312H420',weight.detail);
   break;
  case 'underline-stars':
   art=small(c.topline,140,200,16)+name(226,400,92)+line('M130 294H470')+line('M130 308H470',weight.detail)+row(340,5,8,24)+small(c.tagline,376,200,16);
   break;
  case 'script-swoosh':
   art=small(c.topline,122,200,16)+scriptName(222,420,128)+path('M128 322Q300 286 478 296Q340 302 140 338Z')+dashed(c.tagline,372,150,17)+
       (none?'':accent(486,296,7));
   break;
  case 'script-banner':{
   const r=solidFolded(330,160,440,46,smallAt(c.tagline,300,330,220,20));
   art=topAccent(112)+scriptName(212,420,130)+r.art;
   break;}
  case 'script-arc':
   art=arcText(c.topline,300,450,290,{size:22,spacing:3,maxAngle:.7,font:'BarlowCondensed'})+scriptName(250,400,110)+
       line('M200 336H400',weight.detail)+accent(186,336,6)+accent(414,336,6)+small(c.tagline,362,170,15);
   break;
  case 'centered-rule':
   art=small(c.topline,160,200,16)+line('M140 192H284M316 192H460',weight.inset)+accent(300,192,8)+name(252,380,70)+
       line('M140 312H284M316 312H460',weight.inset)+accent(300,312,8)+small(c.tagline,342,200,16);
   break;
  case 'arched-name':
   art=dashed(c.topline,128,150,16)+archedName(250,78,450,.66)+line('M160 293.4A430 430 0 0 1 440 293.4',weight.inset)+
       small(c.tagline,330,200,16)+row(360,3,7,22);
   break;
  case 'varsity':{
   const r=solidFolded(340,160,440,46,smallAt(c.tagline,300,340,220,20));
   art=topAccent(118)+archedName(262,74,420,.68)+r.art;
   break;}
  case 'stencil-bar':
   art=cut(path('M100 140H500V180H100Z'),smallAt(c.topline,300,160,300,20))+name(250,400,86)+cut(path('M100 320H500V360H100Z'),smallAt(c.tagline,300,340,300,20))+
       (none?'':accent(120,250,8)+accent(480,250,8));
   break;
  case 'twin-boxes':
   art=name(214,400,92)+line('M128 284H292V330H128ZM308 284H472V330H308Z',weight.inset)+smallAt(c.topline,210,307,130,17)+smallAt(c.tagline,390,307,130,17)+
       row(366,5,7,22);
   break;
  case 'dot-leaders':{
   const half=(nameWidth(300,72)||200)/2;
   art=small(c.topline,184,200,16)+name(250,300,72)+dottedLine(`M80 250H${n(300-half-18)}M${n(300+half+18)} 250H520`,weight.mid)+
       small(c.tagline,318,200,16)+row(350,3,7,22);
   break;}
 }
 return svgDoc(c.name,p.name,variant,background,art);
}
