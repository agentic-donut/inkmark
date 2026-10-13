import {fitText,arcText,fittedTextBounds} from './engine.js';
import {weight,n,path,line,circle,dotted,disc,ellipse,cut,svgDoc,regular,hex,hexInset,shield,shieldInset,bow,plate,slimPlate,ticket,ticketInset,notchedBand,rosette,burst,folded,textKit} from './kit.js';

// Rodada 3: variações dos sete modelos aprovados, com os mesmos pesos, fontes e recursos
// (faixas que interrompem a moldura, vazados com máscara, textos curvos em contorno).
// Entram no catálogo para o usuário revisar no app e descartar os que não quiser.
const t=(id,name,category,font,sample,desc,options={})=>({id,name,category,font,sample,desc,ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',...options});
export const proposalTemplates=[
 t('shield-plate','Shield plate','Emblemas','BarlowCondensed','IRONWORKS','Escudo com faixa angular atravessando a moldura.',{tagline:'EST. 2026'}),
 t('hex-band','Hexagon band','Emblemas','AlfaSlabOne','VINTAGE','Hexágono em contorno com faixa sólida e nome vazado.'),
 t('plate-solid','Solid plate','Selos','BarlowCondensed','DESIGN','Selo circular com faixa angular sólida e nome vazado.',{ornament:'diamond',topline:'ORIGINAL',tagline:'PREMIUM GOODS'}),
 t('rosette-solid','Solid rosette','Selos','BarlowCondensed','HIGH QUALITY','Roseta sólida com textos e anel vazados.'),
 t('bow-circle','Bow circle','Selos','AlfaSlabOne','VINTAGE','Selo circular com faixa curva e letras em arco.',{tagline:'EST. 1990'}),
 t('ticket','Ticket frame','Emblemas','BarlowCondensed','BRAND CRAFT','Moldura retangular chanfrada com nome em duas linhas.'),
 t('ring-band','Ring band','Selos','BarlowCondensed','NORTH CLUB','Anel largo sólido com textos curvos vazados.'),
 t('coin-solid','Solid coin','Selos','AlfaSlabOne','QUALITY GOODS','Disco sólido com anel pontilhado e nome vazados.'),
 t('circle-ribbon','Ribbon seal','Selos','AlfaSlabOne','GRAPHIC','Selo circular com faixa dobrada e pontas recortadas.',{tagline:'EST. 2026'}),
 t('scallop-outline','Scallop outline','Selos','BarlowCondensed','PREMIUM','Roseta em contorno com anel interno e textos curvos.'),
 t('starburst','Starburst','Selos','BebasNeue','BEST CHOICE','Selo de raios sólido com textos vazados.'),
 t('ring-split','Split ring','Selos','BebasNeue','MOTOR WORKS','Círculo duplo com o nome entre duas linhas horizontais.',{tagline:'EST. 1984'}),
 t('circle-banner','Banner seal','Selos','BarlowCondensed','COFFEE HOUSE','Selo circular com nome central e faixa inferior vazada.'),
 t('stamp-stars','Star stamp','Selos','Oswald','STANDARD','Carimbo com anel pontilhado e estrelas laterais.'),
 t('rosette-plate','Rosette plate','Selos','BarlowCondensed','AWARD','Roseta em contorno atravessada por faixa angular.',{ornament:'diamond'}),
 t('circle-square','Square seal','Emblemas','BarlowCondensed','BRAND NAME','Moldura quadrada com selo circular e cantos marcados.'),
 t('hex-plate','Hexagon plate','Emblemas','BarlowCondensed','GARAGE','Hexágono com faixa angular e textos retos.',{ornament:'diamond',tagline:'EST. 1990'}),
 t('hex-flat','Wide hexagon','Emblemas','BebasNeue','OUTDOOR','Hexágono deitado com nome em linha única.',{tagline:'EST. 2026'}),
 t('hex-ring','Hexagon ring','Emblemas','BarlowCondensed','TRAIL CO','Hexágono sólido com selo circular vazado.'),
 t('shield-bow','Shield bow','Emblemas','AlfaSlabOne','ROYAL','Escudo sólido com faixa curva e letras em arco.',{tagline:'EST. 1990'}),
 t('shield-classic','Classic shield','Emblemas','Oswald','HERITAGE','Escudo em contorno com nome entre linhas.'),
 t('shield-banner','Shield banner','Emblemas','AlfaSlabOne','DEFENDER','Escudo com faixa dobrada atravessando a moldura.',{tagline:'EST. 2026'}),
 t('ticket-solid','Solid ticket','Emblemas','BarlowCondensed','MAIN STREET','Moldura chanfrada sólida com textos vazados.'),
 t('frame-title','Title frame','Emblemas','BebasNeue','GOOD LIFE','Moldura retangular com textos interrompendo as bordas.',{tagline:'EST. 2026'}),
 t('oval-label','Oval label','Emblemas','Oswald','BREWING CO','Oval duplo com nome central e textos retos.'),
 t('oval-band','Oval band','Emblemas','AlfaSlabOne','DINER','Oval duplo com faixa sólida e nome vazado.'),
 t('arch','Arch frame','Emblemas','BarlowCondensed','HOME GOODS','Moldura em arco com texto curvo no topo.'),
 t('diamond-band','Diamond band','Emblemas','BarlowCondensed','ATELIER','Losango duplo com faixa angular.',{ornament:'diamond'}),
 t('octagon','Octagon','Emblemas','Oswald','HARDWARE','Octógono duplo com nome entre linhas.'),
 t('pill','Pill label','Emblemas','AlfaSlabOne','SUPPLY','Cápsula dupla com textos acima e abaixo.',{tagline:'EST. 2026'}),
];

export function renderProposal(id,config={},variant='light',background=true){
 const p=proposalTemplates.find(p=>p.id===id);if(!p)throw new Error('Proposta desconhecida.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const {accent,topAccent,foot,small,dashed,topArc,bottomArc,name,stack,bandName,arcName}=textKit(c);
 let art='';
 switch(id){
  case 'shield-plate':
   art=cut(line(shield)+line(shieldInset,weight.inset),path(slimPlate))+line(slimPlate)+
       small(c.topline,151,150,15)+topAccent(182)+bandName(250,300,46)+accent(118,250)+accent(482,250)+
       dashed(c.tagline,330,130,16)+foot(368);
   break;
  case 'hex-band':
   art=line(hex)+line(hexInset,weight.inset)+cut(path(notchedBand),bandName(252,268,50))+
       small(c.topline,150,150,15)+topAccent(182)+small(c.tagline,336,170,16)+foot(370);
   break;
  case 'plate-solid':
   art=cut(circle(174)+circle(162,weight.inset),path(plate))+
       arcText(c.topline,300,250,138,{size:23,spacing:4,maxAngle:2.2,font:'BebasNeue'})+
       arcText(c.tagline,300,250,146,{bottom:true,size:22,spacing:4,maxAngle:2.5,font:'BebasNeue'})+
       cut(path(plate),bandName(250,263,62)+accent(129,250)+accent(471,250))+
       topAccent(172)+line('M262 330H338',weight.detail);
   break;
  case 'rosette-solid':
   art=cut(path(rosette()),circle(146,weight.inset)+
       arcText(c.topline,300,250,123,{size:21,spacing:2.4,maxAngle:2.7})+
       arcText(c.tagline,300,250,132,{bottom:true,size:20,spacing:2.4,maxAngle:2.7})+
       topAccent(172)+stack(250,235,43,6)+line('M247 314H353',weight.detail));
   break;
  case 'bow-circle':
   art=cut(circle(174)+circle(162,weight.inset),path(bow))+line(bow)+
       topArc(140)+topAccent(168)+arcName()+dashed(c.tagline,352,125,17);
   break;
  case 'ticket':
   art=line(ticket)+line(ticketInset,weight.inset)+dashed(c.topline,140,150,15)+topAccent(170)+
       line('M178 196H422M178 318H422',weight.detail)+stack(257,240,46,8)+
       small(c.tagline,350,170,16)+foot(374);
   break;
  case 'ring-band':
   art=cut(circle(153,50),topArc(146,21)+bottomArc(168,20)+accent(147,250,8)+accent(453,250,8))+
       circle(118,weight.inset)+topAccent(178)+stack(250,190,40,6)+line('M262 312H338',weight.detail);
   break;
  case 'coin-solid':
   art=cut(disc(178),dotted(162)+circle(148,weight.inset)+topArc(122,20)+bottomArc(131,19)+
       topAccent(176)+stack(250,225,42,6)+line('M250 312H350',weight.detail));
   break;
  case 'circle-ribbon':{
   const r=folded(250,104,496,72);
   art=cut(circle(174)+circle(162,weight.inset),path(r.area))+r.art+
       topArc(140)+topAccent(170)+bandName(250,350,48)+dashed(c.tagline,340,125,17);
   break;}
  case 'scallop-outline':
   art=line(rosette(166,16,10))+circle(148,weight.inset)+topArc(126,20)+bottomArc(134,19)+
       topAccent(176)+stack(250,225,42,6)+line('M250 312H350',weight.detail);
   break;
  case 'starburst':
   art=cut(path(burst()),circle(150,weight.inset)+topArc(128,20)+bottomArc(136,19)+
       topAccent(178)+stack(250,225,44,6)+line('M250 314H350',weight.detail));
   break;
  case 'ring-split':
   art=circle(174)+circle(162,weight.inset)+line('M145 208H455M145 292H455',weight.inset)+
       topArc(140)+topAccent(176)+bandName(250,290,58)+dashed(c.tagline,330,125,17)+foot(366);
   break;
  case 'circle-banner':{
   const banner='M110 322H490L470 346 490 370H110L130 346Z';
   art=cut(circle(172)+circle(160,weight.inset),path(banner))+cut(path(banner),fitText(c.tagline,'BarlowCondensed',300,346,250,19,{uppercase:true,spacing:2}))+
       topArc(138)+topAccent(170)+stack(240,240,44,6);
   break;}
  case 'stamp-stars':
   art=circle(176)+dotted(162)+circle(150,weight.inset)+topArc(128,20)+bottomArc(137,19)+
       accent(178,250,8)+accent(422,250,8)+topAccent(180)+stack(250,205,42,6)+line('M255 312H345',weight.detail);
   break;
  case 'rosette-plate':
   art=cut(line(rosette(166,16,10))+circle(148,weight.inset),path(plate))+line(plate)+
       topArc(126,20)+bottomArc(134,19)+topAccent(176)+bandName(250,263,58)+accent(129,250)+accent(471,250);
   break;
  case 'circle-square':
   art=line('M120 70H480V430H120Z')+line('M132 82H468V418H132Z',weight.inset)+circle(150,weight.inset)+
       topArc(128,20)+bottomArc(137,19)+topAccent(178)+stack(250,210,42,6)+line('M255 312H345',weight.detail)+
       accent(152,102,7)+accent(448,102,7)+accent(152,398,7)+accent(448,398,7);
   break;
  case 'hex-plate':
   art=cut(line(hex)+line(hexInset,weight.inset),path(slimPlate))+line(slimPlate)+
       small(c.topline,150,150,15)+topAccent(182)+bandName(250,300,46)+accent(118,250)+accent(482,250)+
       dashed(c.tagline,336,120,16)+foot(372);
   break;
  case 'hex-flat':
   art=line('M180 95H420L500 250 420 405H180L100 250Z')+line('M186.6 107H413.4L486.5 250 413.4 393H186.6L113.5 250Z',weight.inset)+
       dashed(c.topline,145,150,15)+topAccent(176)+bandName(250,300,70)+line('M220 304H380',weight.detail)+small(c.tagline,338,170,16)+foot(368);
   break;
  case 'hex-ring':
   art=cut(path(hex),line(hexInset,weight.inset)+circle(130,weight.inset)+
       topArc(108,18)+bottomArc(116,17)+foot(114)+foot(386)+stack(252,180,36,6));
   break;
  case 'shield-bow':
   art=cut(path(shield),line(shieldInset,weight.inset)+path(bow)+small(c.topline,150,150,15)+topAccent(182)+
       dashed(c.tagline,342,125,16)+foot(378))+line(bow)+arcName(66);
   break;
  case 'shield-classic':
   art=line(shield)+line(shieldInset,weight.inset)+small(c.topline,142,150,15)+topAccent(172)+
       line('M190 198H410M190 304H410',weight.detail)+stack(251,215,44,6)+small(c.tagline,334,150,15)+foot(372);
   break;
  case 'shield-banner':{
   const r=folded(250,128,472,66);
   art=cut(line(shield)+line(shieldInset,weight.inset),path(r.area))+r.art+
       small(c.topline,150,150,15)+topAccent(182)+bandName(250,300,46)+dashed(c.tagline,338,125,16)+foot(374);
   break;}
  case 'ticket-solid':
   art=cut(path(ticket),line(ticketInset,weight.inset)+dashed(c.topline,140,150,15)+topAccent(170)+
       line('M178 196H422M178 318H422',weight.detail)+stack(257,240,46,8)+small(c.tagline,350,170,16)+foot(374));
   break;
  case 'frame-title':{
   const opts={uppercase:true,spacing:2};
   const gap=(text,y)=>{const {width}=fittedTextBounds(text,'BarlowCondensed',220,18,opts);return width?`<rect x="${n(300-width/2-16)}" y="${y-20}" width="${n(width+32)}" height="40"/>`:'';};
   art=cut(line('M95 130H505V370H95Z')+line('M107 142H493V358H107Z',weight.inset),gap(c.topline,130)+gap(c.tagline,370))+
       fitText(c.topline,'BarlowCondensed',300,130,220,18,opts)+fitText(c.tagline,'BarlowCondensed',300,370,220,18,opts)+
       bandName(250,300,78)+accent(134,250,8)+accent(466,250,8);
   break;}
  case 'oval-label':
   art=ellipse(205,150)+ellipse(193,138,weight.inset)+dashed(c.topline,158,150,15)+topAccent(186)+
       bandName(250,300,58)+line('M240 300H360',weight.detail)+small(c.tagline,328,170,16)+foot(360);
   break;
  case 'oval-band':{
   const band='M80 210H520L504 250 520 290H80L96 250Z';
   art=cut(ellipse(205,150)+ellipse(193,138,weight.inset),path(band))+cut(path(band),bandName(250,330,52))+
       small(c.topline,150,150,15)+topAccent(180)+small(c.tagline,326,170,16)+foot(358);
   break;}
  case 'arch':
   art=line('M160 410V240A140 140 0 0 1 440 240V410Z')+line('M172 398V240A128 128 0 0 1 428 240V398Z',weight.inset)+
       arcText(c.topline,300,240,106,{size:19,spacing:3,maxAngle:2,font:'BarlowCondensed'})+topAccent(166)+
       stack(262,215,42,6)+line('M245 326H355',weight.detail)+small(c.tagline,356,170,16)+foot(382);
   break;
  case 'diamond-band':
   art=cut(line('M300 70 470 250 300 430 130 250Z')+line('M300 86.5 453.5 250 300 413.5 146.5 250Z',weight.inset),path(slimPlate))+line(slimPlate)+
       small(c.topline,166,110,14)+topAccent(193)+bandName(250,300,46)+accent(118,250)+accent(482,250)+small(c.tagline,316,110,14)+foot(346);
   break;
  case 'octagon':
   art=line(regular(8,184,Math.PI/8))+line(regular(8,171,Math.PI/8),weight.inset)+dashed(c.topline,142,150,15)+topAccent(172)+
       line('M180 198H420M180 304H420',weight.detail)+stack(251,225,44,6)+small(c.tagline,334,160,15)+foot(366);
   break;
  case 'pill':
   art=line('M145 175H455A75 75 0 0 1 455 325H145A75 75 0 0 1 145 175Z')+line('M145 187H455A63 63 0 0 1 455 313H145A63 63 0 0 1 145 187Z',weight.inset)+
       topAccent(110)+dashed(c.topline,145,150,16)+bandName(250,300,62)+accent(118,250,8)+accent(482,250,8)+small(c.tagline,358,170,16)+foot(388);
   break;
 }
 return svgDoc(c.name,p.name,variant,background,art);
}
