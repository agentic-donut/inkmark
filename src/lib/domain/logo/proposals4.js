import {fitText,arcText} from './engine.js';
import {weight,n,path,line,circle,dotted,dottedLine,disc,ellipse,solidEllipse,cut,svgDoc,hex,hexInset,wideHex,wideHexInset,shield,shieldInset,roundShield,roundShieldInset,
 slimPlate,diamondShape,diamondInset,archShape,archInset,roundRect,notchedRect,rosette,burst,gear,sector,chordBand,folded,solidFolded,archedRibbon,laurel,crown,mountains,rays,ticks,textKit} from './kit.js';

// Rodada 4: 50 modelos a partir das referências de selos de garantia, faixas em arco,
// emblemas vintage e composições abertas. Entram no catálogo para revisão no app.
const t=(id,name,category,font,sample,desc,options={})=>({id,name,category,font,sample,desc,ornament:'stars',topline:'PREMIUM QUALITY',tagline:'AUTHENTIC GOODS',...options});
export const round4Templates=[
 // Selos
 t('line-seal','Line seal','Selos','AlfaSlabOne','GUARANTEED','Círculo com duas linhas que atravessam a moldura.',{topline:'SATISFACTION',tagline:'SATISFACTION'}),
 t('disc-center','Center disc','Selos','AlfaSlabOne','SUPERB QUALITY','Anel duplo com disco central sólido e nome vazado.'),
 t('open-disc','Open disc','Selos','AlfaSlabOne','BEST','Disco sólido entre linhas, com textos curvos sem moldura.',{topline:'SATISFACTION GUARANTEE',tagline:'SATISFACTION GUARANTEE'}),
 t('band-inside','Inner band','Selos','AlfaSlabOne','FINEST QUALITY','Faixa sólida recortada pelo círculo, com fileiras de estrelas.',{topline:'GUARANTEED',tagline:'GUARANTEED'}),
 t('half-rings','Star arcs','Selos','AlfaSlabOne','ORIGINAL','Arcos sólidos com estrelas vazadas acima e abaixo do nome.',{topline:'SATISFACTION',tagline:'GUARANTEE'}),
 t('serrated-solid','Serrated seal','Selos','AlfaSlabOne','PREMIUM QUALITY','Borda serrilhada sólida com textos retos.'),
 t('serrated-outline','Serrated outline','Selos','BarlowCondensed','BEST PRODUCT','Borda serrilhada em contorno com textos curvos.',{topline:'PREMIUM',tagline:'QUALITY'}),
 t('star-columns','Star columns','Selos','AlfaSlabOne','BEST','Anel duplo com estrelas nas laterais e disco central.',{topline:'PREMIUM',tagline:'QUALITY'}),
 t('gear-seal','Gear seal','Selos','BebasNeue','MOTOR CLUB','Engrenagem sólida com selo interno.',{ornament:'diamond',tagline:'EST. 1980'}),
 t('laurel-ring','Laurel ring','Selos','Oswald','HIGH QUALITY','Anel duplo com ramos de louro ao redor do nome.'),
 t('arched-seal','Arched ribbon seal','Selos','AlfaSlabOne','PREMIUM','Selo circular com faixa em arco e pontas dobradas.',{tagline:'100% QUALITY'}),
 t('crown-seal','Crown seal','Selos','BarlowCondensed','ROYAL GOODS','Selo com coroa, anel pontilhado e texto curvo.'),
 t('dotted-ribbon','Dotted ribbon','Selos','AlfaSlabOne','SALES','Anel pontilhado com faixa dobrada e estrelas.',{topline:'SATISFACTION',tagline:'GUARANTEED'}),
 t('retro-bars','Retro bars','Selos','BebasNeue','RETRO','Faixa que ultrapassa o círculo, com barras nas pontas.',{topline:'NEW YORK',tagline:'HANDCRAFTED STYLE'}),
 t('ribbon-disc','Ribbon disc','Selos','AlfaSlabOne','SMITH','Disco sólido com faixa sólida dobrada na base.',{topline:'NEW YORK',tagline:'HANDCRAFTED'}),
 t('star-arc','Star arc','Selos','Oswald','GENUINE','Anel duplo com estrelas em arco sobre o nome.',{tagline:'PRODUCT'}),
 t('burst-outline','Burst outline','Selos','AlfaSlabOne','SPECIAL OFFER','Selo de raios em contorno com anel interno.'),
 t('tick-ring','Tick ring','Selos','BebasNeue','QUALITY','Anel com escala de traços radiais e nome central.',{tagline:'EST. 2026'}),
 // Emblemas
 t('shield-arched','Arched shield','Emblemas','AlfaSlabOne','SATISFACTION','Escudo pontilhado com faixa em arco.',{tagline:'GUARANTEED'}),
 t('shield-split','Split shield','Emblemas','Oswald','FIRST CLASS','Escudo com topo sólido e textos vazados.'),
 t('round-shield','Round shield','Emblemas','AlfaSlabOne','HIGH QUALITY','Escudo arredondado sólido com contorno vazado.'),
 t('shield-wreath','Wreath shield','Emblemas','Oswald','HIGH','Escudo em contorno entre ramos de louro.',{tagline:'QUALITY'}),
 t('wide-hex-solid','Wide solid hexagon','Emblemas','BebasNeue','VINTAGE','Hexágono alongado sólido com contorno pontilhado.',{topline:'EST. 2016',tagline:'HANDCRAFTED'}),
 t('wide-hex-lines','Wide hexagon lines','Emblemas','BebasNeue','VINTAGE','Hexágono alongado duplo com linhas e textos.',{topline:'TRADE MARK',tagline:'NEW YORK · 1976'}),
 t('hex-dotted','Dotted hexagon','Emblemas','BebasNeue','DESIGN','Hexágono sólido com contorno pontilhado vazado.',{topline:'SINCE 1985',tagline:'NEW YORK'}),
 t('bump-badge','Bump badge','Emblemas','Oswald','INDUSTRY','Emblema de oito lóbulos com contorno duplo.',{topline:'EST. 1950',tagline:'TRADE MARK'}),
 t('rect-dotted','Dotted plate','Emblemas','AlfaSlabOne','BEST QUALITY','Placa arredondada sólida com contorno pontilhado.'),
 t('rect-ribbon','Ribbon frame','Emblemas','AlfaSlabOne','SPECIAL','Moldura retangular com faixa dobrada.',{tagline:'EST. 2026'}),
 t('oval-dotted','Dotted oval','Emblemas','Oswald','BREWERY','Oval sólido com contorno pontilhado vazado.'),
 t('oval-arched','Arched oval','Emblemas','AlfaSlabOne','FRESH','Oval duplo com faixa em arco.',{tagline:'SINCE 1990'}),
 t('roof','Roof frame','Emblemas','BebasNeue','GARAGE','Telhado sobre placa com barras laterais.',{topline:'EST. 1980',tagline:'TRADE MARK'}),
 t('bowtie','Bow tie','Emblemas','BebasNeue','MILLER','Faixa em gravata com textos curvos acima e abaixo.',{topline:'HANDCRAFTED',tagline:'TRADE MARK'}),
 t('diamond-solid','Solid diamond','Emblemas','BarlowCondensed','ATELIER','Losango sólido com faixa clara atravessando.',{ornament:'diamond'}),
 t('notched-frame','Notched frame','Emblemas','Oswald','WORKSHOP','Moldura com cantos côncavos e nome entre linhas.'),
 t('crown-shield','Crown shield','Emblemas','AlfaSlabOne','KINGDOM','Escudo duplo com coroa e nome central.',{tagline:'EST. 1990'}),
 t('postage','Postage stamp','Emblemas','BebasNeue','POST CO','Selo postal com borda perfurada.',{tagline:'FIRST CLASS'}),
 t('arch-solid','Solid arch','Emblemas','BarlowCondensed','HOME GOODS','Arco sólido com textos vazados.'),
 t('hex-folded','Folded hexagon','Emblemas','AlfaSlabOne','VINTAGE','Hexágono duplo com faixa dobrada.',{tagline:'EST. 1990'}),
 t('wide-hex-band','Wide hexagon band','Emblemas','BebasNeue','SUPPLY CO','Hexágono alongado com faixa sólida e nome vazado.',{tagline:'EST. 2026'}),
 t('notched-solid','Solid notched plate','Emblemas','Oswald','HARDWARE','Placa sólida com cantos côncavos e textos vazados.'),
 // Lettering
 t('rays-top','Rays','Lettering','BebasNeue','VINTAGE','Nome entre leques de traços verticais.',{topline:'MODERN COMPANY',tagline:'HANDCRAFTED'}),
 t('ribbon-under','Ribbon under','Lettering','BebasNeue','MILLER','Nome com faixa sólida dobrada logo abaixo.',{topline:'TRADEMARK',tagline:'PREMIUM'}),
 t('arc-band','Arc band','Lettering','BebasNeue','MILLER','Faixa sólida com textos curvos acima e abaixo.',{topline:'HANDCRAFTED',tagline:'TRADE MARK'}),
 t('wreath','Wreath','Lettering','AlfaSlabOne','BEST CHOICE','Ramos de louro abertos ao redor do nome.'),
 t('line-breaks','Line breaks','Lettering','BebasNeue','GOOD LIFE','Linhas grossas interrompidas pelos textos.',{tagline:'EST. 2026'}),
 t('brackets','Brackets','Lettering','BebasNeue','GARAGE','Nome entre barras verticais duplas.',{topline:'EST. 1980',tagline:'TRADE MARK'}),
 t('crown-name','Crown','Lettering','AlfaSlabOne','KING','Coroa sobre o nome e texto com traços.',{tagline:'EST. 2026'}),
 t('mountain-name','Mountain','Lettering','BebasNeue','OUTDOOR','Montanhas sobre o nome e linha de apoio.',{tagline:'EXPLORE MORE'}),
 t('boxed','Boxed','Lettering','Oswald','BRAND','Nome dentro de uma caixa em contorno.',{tagline:'EST. 2026'}),
 t('solid-block','Solid block','Lettering','BebasNeue','STUDIO','Nome vazado num bloco sólido.',{tagline:'EST. 2026'}),
 t('arched-ribbon','Arched ribbon','Lettering','AlfaSlabOne','PREMIUM','Faixa em arco com pontas dobradas, sem moldura.',{tagline:'100% QUALITY'}),
 t('split-underline','Split underline','Lettering','AlfaSlabOne','BRAND','Nome com linha grossa interrompida pelo texto.',{tagline:'EST. 2026'}),
];

export function renderRound4(id,config={},variant='light',background=true){
 const p=round4Templates.find(p=>p.id===id);if(!p)throw new Error('Modelo desconhecido.');
 const c={name:p.sample,topline:p.topline,tagline:p.tagline,font:p.font,ornament:p.ornament,size:100,spacing:0,...config};
 const {none,accent,topAccent,foot,row,arcRow,small,dashed,smallWidth,topArc,bottomArc,name,stack,bandName,arcName}=textKit(c);
 // Vão numa linha ou moldura para o texto passar, medido pelos contornos.
 const gap=(text,y,w=220,h=18)=>{const width=smallWidth(text,w,h);return width?`<rect x="${n(300-width/2-16)}" y="${y-20}" width="${n(width+32)}" height="40"/>`:'';};
 const opts={uppercase:true,spacing:2};
 let art='';
 switch(id){
  // ---------- selos ----------
  case 'line-seal':
   art=circle(172)+line('M88 212H512M88 288H512',weight.inset)+topArc(134,22)+bottomArc(142,22)+
       accent(300,186,8)+accent(300,316,8)+bandName(250,300,46);
   break;
  case 'disc-center':
   art=circle(176)+circle(164,weight.inset)+topArc(140,20)+bottomArc(148,20)+accent(166,250,8)+accent(434,250,8)+
       cut(disc(104),row(197,5,6)+row(303,5,6)+stack(250,165,34,6));
   break;
  case 'open-disc':
   art=cut(line('M70 202H512M88 298H530',weight.inset),disc(108))+cut(disc(96),row(196,5,6)+row(304,5,6)+stack(250,150,34,6))+
       topArc(140,21,'BarlowCondensed',250,2)+bottomArc(150,21,'BarlowCondensed',250,2);
   break;
  case 'band-inside':{
   const band=chordBand(162,215,285);
   art=circle(174)+circle(162,weight.inset)+cut(path(band),bandName(250,280,40))+row(190,5,6)+row(310,5,6)+
       topArc(138,22)+bottomArc(146,22);
   break;}
  case 'half-rings':
   art=cut(path(sector(112,152,205,335))+path(sector(112,152,25,155)),arcRow(132,220,320,5,7)+arcRow(132,40,140,5,7))+
       topArc(162,22)+bottomArc(186,22)+bandName(250,250,48)+accent(150,250,9)+accent(450,250,9);
   break;
  case 'serrated-solid':
   art=cut(path(burst(54,184,172)),disc(152))+circle(142,weight.inset)+row(176,5,6)+small(c.topline,204,170,16)+
       stack(252,230,40,6)+small(c.tagline,302,170,16)+row(328,5,6);
   break;
  case 'serrated-outline':
   art=line(burst(60,182,170),weight.mid)+circle(150,weight.inset)+topArc(128,20)+bottomArc(136,19)+topAccent(178)+stack(252,220,42,6);
   break;
  case 'star-columns':
   art=circle(176)+circle(164,weight.inset)+topArc(140,22,'BarlowCondensed',250,1.5)+bottomArc(148,22,'BarlowCondensed',250,1.5)+
       arcRow(134,150,210,5,7)+arcRow(134,-30,30,5,7)+circle(98,weight.inset)+cut(disc(86),bandName(250,130,46));
   break;
  case 'gear-seal':
   art=cut(path(gear(30,182,164)),disc(148))+circle(136,weight.inset)+topArc(114,19)+bottomArc(122,18)+topAccent(178)+stack(252,190,40,6);
   break;
  case 'laurel-ring':
   art=circle(176)+circle(164,weight.inset)+laurel(124,122,226,7,.85)+topArc(140,20)+bottomArc(148,20)+topAccent(182)+stack(252,170,38,6);
   break;
  case 'arched-seal':{
   const r=archedRibbon(236,84,98,38);
   art=cut(circle(172)+circle(160,weight.inset),path(r.area))+r.art+topArc(138,21)+topAccent(176)+arcName(62,8)+dashed(c.tagline,362,120,16);
   break;}
  case 'crown-seal':
   art=circle(176)+dotted(162)+circle(150,weight.inset)+(none?'':crown(300,178,58))+topArc(128,20)+bottomArc(137,19)+
       stack(258,210,40,6)+line('M255 316H345',weight.detail);
   break;
  case 'dotted-ribbon':{
   const r=folded(252,112,488,68);
   art=cut(circle(172)+dotted(158,weight.inset),path(r.area))+r.art+small(c.topline,160,150,16)+row(190,3,9,30)+
       bandName(252,330,46)+dashed(c.tagline,330,130,16)+row(362,3,7,24);
   break;}
  case 'retro-bars':{
   const band='M86 218H514V282H86Z';
   art=cut(circle(170)+circle(158,weight.inset),path(band))+line(band)+line('M104 228V272M116 228V272M484 228V272M496 228V272',weight.inset)+
       topArc(136,20)+topAccent(178)+bandName(250,300,46)+bottomArc(144,19)+row(320,3,7,22);
   break;}
  case 'ribbon-disc':{
   const r=solidFolded(338,150,450,46,fitText(c.tagline,'BarlowCondensed',300,338,230,18,opts));
   art=cut(disc(164),dotted(152)+topArc(128,19)+topAccent(176)+stack(238,220,46,6)+path(r.area,'stroke="black" stroke-width="16"'))+r.art;
   break;}
  case 'star-arc':
   art=circle(176)+circle(164,weight.inset)+arcRow(118,225,315,5,8)+topArc(140,21)+bottomArc(148,21)+stack(258,230,46,6)+line('M255 320H345',weight.detail);
   break;
  case 'burst-outline':
   art=line(burst(34,184,164),weight.mid)+circle(140,weight.inset)+topArc(118,18)+bottomArc(126,18)+topAccent(172)+stack(252,200,40,6);
   break;
  case 'tick-ring':
   art=circle(178,weight.mid)+ticks(160,172,96)+circle(152,weight.inset)+topArc(130,20)+bottomArc(138,19)+accent(170,250,8)+accent(430,250,8)+
       bandName(250,220,64);
   break;
  // ---------- emblemas ----------
  case 'shield-arched':{
   const r=archedRibbon(226,82,104,36);
   art=cut(line(shield)+dottedLine(shieldInset),path(r.area))+r.art+small(c.topline,140,150,15)+topAccent(176)+arcName(54)+
       dashed(c.tagline,352,120,15)+foot(384);
   break;}
  case 'shield-split':{
   const top='M300 72 443 112V200H157V112Z';
   art=line(shield)+cut(path(top),line(shieldInset,weight.inset)+small(c.topline,138,150,15)+topAccent(170))+
       cut(line(shieldInset,weight.inset),path(top))+stack(258,220,42,6)+line('M245 318H355',weight.detail)+small(c.tagline,344,150,15)+foot(378);
   break;}
  case 'round-shield':
   art=cut(path(roundShield),line(roundShieldInset,weight.inset)+topAccent(146)+small(c.topline,178,170,16)+
       stack(254,220,44,6)+line('M245 318H355',weight.detail)+small(c.tagline,344,150,15)+foot(380));
   break;
  case 'shield-wreath':
   art=laurel(196,122,228,8,1)+line(shield)+line(shieldInset,weight.inset)+small(c.topline,142,150,15)+topAccent(172)+
       stack(254,210,46,6)+line('M245 318H355',weight.detail)+small(c.tagline,344,140,15)+foot(380);
   break;
  case 'wide-hex-solid':
   art=cut(path(wideHex),dottedLine(wideHexInset)+dashed(c.topline,194,130,15)+name(250,290,60)+small(c.tagline,306,150,15)+accent(126,250,8)+accent(474,250,8));
   break;
  case 'wide-hex-lines':
   art=line(wideHex)+line(wideHexInset,weight.inset)+small(c.topline,192,150,14)+line('M180 208H420M180 292H420',weight.detail)+
       name(250,270,60)+small(c.tagline,309,150,14)+accent(136,250,8)+accent(464,250,8);
   break;
  case 'hex-dotted':
   art=cut(path(hex),dottedLine(hexInset)+small(c.topline,150,140,15)+line('M235 172H365',weight.detail)+stack(250,230,52,8)+
       line('M235 328H365',weight.detail)+small(c.tagline,350,140,15)+foot(382));
   break;
  case 'bump-badge':
   art=line(rosette(152,8,26))+line(rosette(140,8,26),weight.inset)+small(c.topline,168,120,15)+line('M200 192H400M200 308H400',weight.detail)+
       bandName(250,250,62)+small(c.tagline,332,120,15)+accent(300,142,7)+foot(358);
   break;
  case 'rect-dotted':
   art=cut(path(roundRect(105,135,390,230,22)),dottedLine(roundRect(117,147,366,206,12))+dashed(c.topline,178,150,15)+
       stack(252,290,46,6)+small(c.tagline,326,170,15)+accent(134,252,7)+accent(466,252,7));
   break;
  case 'rect-ribbon':{
   const r=folded(252,108,492,66);
   art=cut(line('M135 105H465V395H135Z')+line('M147 117H453V383H147Z',weight.inset),path(r.area))+r.art+
       small(c.topline,158,150,15)+topAccent(188)+bandName(252,330,44)+dashed(c.tagline,326,125,16)+foot(358);
   break;}
  case 'oval-dotted':
   art=cut(solidEllipse(210,152),`<ellipse cx="300" cy="250" rx="196" ry="138" fill="none" stroke="currentColor" stroke-width="3.2" stroke-dasharray="2 6" stroke-linecap="round"/>`+
       small(c.topline,165,150,15)+topAccent(194)+bandName(252,300,60)+line('M250 296H350',weight.detail)+small(c.tagline,322,150,15)+foot(352));
   break;
  case 'oval-arched':{
   const r=archedRibbon(228,82,100,36);
   art=cut(ellipse(205,152)+ellipse(193,140,weight.inset),path(r.area))+r.art+small(c.topline,148,150,15)+topAccent(180)+arcName(58)+
       dashed(c.tagline,350,120,15);
   break;}
  case 'roof':
   art=line('M128 214L300 118L472 214',weight.frame)+line('M134 214H466V306H134Z')+line('M110 230V290M490 230V290',weight.inset)+
       small(c.topline,186,90,14)+bandName(260,300,64)+dashed(c.tagline,338,130,16)+row(368,3,7,22);
   break;
  case 'bowtie':{
   const tie='M115 196Q300 222 485 196L465 252 485 308Q300 282 115 308L135 252Z';
   art=arcText(c.topline,300,340,170,{size:22,spacing:3,maxAngle:1.1,font:'BarlowCondensed'})+accent(300,138,8)+
       cut(path(tie),bandName(252,280,60))+arcText(c.tagline,300,160,174,{bottom:true,size:21,spacing:3,maxAngle:1.1,font:'BarlowCondensed'});
   break;}
  case 'diamond-solid':
   art=cut(path(diamondShape),line(diamondInset,weight.inset)+path(slimPlate,'stroke="black" stroke-width="16"')+small(c.topline,170,110,14)+topAccent(198)+
       small(c.tagline,312,110,14)+foot(342))+line(slimPlate)+bandName(250,300,46)+accent(118,250)+accent(482,250);
   break;
  case 'notched-frame':
   art=line(notchedRect(120,105,360,290,30))+line(notchedRect(132,117,336,266,22),weight.inset)+small(c.topline,150,150,15)+topAccent(178)+
       line('M170 200H430M170 300H430',weight.detail)+stack(250,240,40,6)+small(c.tagline,330,150,15)+foot(360);
   break;
  case 'crown-shield':
   art=line(shield)+line(shieldInset,weight.inset)+(none?'':crown(300,160,64))+stack(250,215,46,6)+line('M245 312H355',weight.detail)+
       dashed(c.tagline,340,120,15)+foot(376);
   break;
  case 'postage':{
   const holes=[];
   for(let x=120;x<=480;x+=20)holes.push(`<circle cx="${x}" cy="110" r="7"/>`,`<circle cx="${x}" cy="390" r="7"/>`);
   for(let y=130;y<=370;y+=20)holes.push(`<circle cx="120" cy="${y}" r="7"/>`,`<circle cx="480" cy="${y}" r="7"/>`);
   art=cut(path('M120 110H480V390H120Z'),holes.join('')+path('M136 126H464V374H136Z'))+line('M146 136H454V364H146Z',weight.inset)+
       small(c.topline,170,150,15)+topAccent(198)+stack(260,260,46,6)+small(c.tagline,330,170,16);
   break;}
  case 'arch-solid':
   art=cut(path(archShape),line(archInset,weight.inset)+topAccent(152)+small(c.topline,186,150,15)+stack(262,215,42,6)+
       line('M245 326H355',weight.detail)+small(c.tagline,354,150,15)+foot(382));
   break;
  case 'hex-folded':{
   const r=folded(252,120,480,64);
   art=cut(line(hex)+line(hexInset,weight.inset),path(r.area))+r.art+small(c.topline,150,140,15)+topAccent(182)+bandName(252,300,44)+
       dashed(c.tagline,336,120,15)+foot(370);
   break;}
  case 'wide-hex-band':{
   const band='M70 218H530L516 250 530 282H70L84 250Z';
   art=cut(line(wideHex)+line(wideHexInset,weight.inset),path(band,'stroke="black" stroke-width="16"'))+cut(path(band),bandName(250,320,42)+accent(110,250,8)+accent(490,250,8))+
       small(c.topline,192,130,14)+dashed(c.tagline,306,120,14);
   break;}
  case 'notched-solid':
   art=cut(path(notchedRect(120,120,360,260,30)),line(notchedRect(132,132,336,236,22),weight.inset)+dashed(c.topline,170,150,15)+
       stack(252,250,42,6)+small(c.tagline,326,160,15)+row(352,3,7,22));
   break;
  // ---------- lettering ----------
  case 'rays-top':
   art=small(c.topline,118,200,16)+rays(198,17,13,46)+name(250,400,78)+rays(302,17,13,46,1)+small(c.tagline,382,200,16)+foot(414);
   break;
  case 'ribbon-under':{
   const r=solidFolded(318,150,450,50,fitText(c.tagline,'BarlowCondensed',300,318,240,22,opts));
   art=small(c.topline,140,200,17)+bandName(222,400,92)+r.art+row(372,5,7,22);
   break;}
  case 'arc-band':
   art=arcText(c.topline,300,450,284,{size:23,spacing:3,maxAngle:.75,font:'BarlowCondensed'})+accent(300,140,7)+
       cut(path('M110 200H490V300H110Z'),bandName(250,330,62))+line('M110 188H490M110 312H490',weight.detail)+
       arcText(c.tagline,300,62,285,{bottom:true,size:22,spacing:3,maxAngle:.75,font:'BarlowCondensed'});
   break;
  case 'wreath':
   art=laurel(160,118,236,8,1.05)+topAccent(146)+small(c.topline,180,150,15)+stack(250,220,44,6)+small(c.tagline,322,150,15)+foot(354);
   break;
  case 'line-breaks':
   art=cut(line('M90 168H510M90 332H510'),gap(c.topline,168)+gap(c.tagline,332))+fitText(c.topline,'BarlowCondensed',300,168,220,18,opts)+
       fitText(c.tagline,'BarlowCondensed',300,332,220,18,opts)+bandName(250,400,96)+row(372,3,7,22);
   break;
  case 'brackets':
   art=line('M92 196V304M508 196V304')+line('M108 210V290M492 210V290',weight.inset)+topAccent(132)+small(c.topline,168,160,16)+
       bandName(250,360,76)+small(c.tagline,330,160,16);
   break;
  case 'crown-name':
   art=(none?'':crown(300,150,78))+bandName(244,400,92)+dashed(c.tagline,330,150,18)+row(364,3,7,22);
   break;
  case 'mountain-name':
   art=mountains(300,142,124)+bandName(250,400,84)+line('M120 306H480',weight.inset)+small(c.tagline,334,190,17)+row(366,3,7,22);
   break;
  case 'boxed':
   art=dashed(c.topline,156,150,16)+line('M100 190H500V310H100Z')+line('M112 202H488V298H112Z',weight.inset)+bandName(250,340,64)+
       small(c.tagline,344,170,16)+foot(374);
   break;
  case 'solid-block':
   art=topAccent(122)+small(c.topline,158,200,16)+cut(path('M100 186H500V314H100Z'),bandName(250,340,74))+dashed(c.tagline,344,150,17);
   break;
  case 'arched-ribbon':{
   const r=archedRibbon(226,89,110,40);
   art=topAccent(150)+small(c.topline,182,180,16)+r.art+arcName(66)+dashed(c.tagline,362,130,17);
   break;}
  case 'split-underline':
   art=topAccent(132)+small(c.topline,168,180,16)+bandName(236,400,86)+cut(line('M100 306H500',weight.frame),gap(c.tagline,306))+
       fitText(c.tagline,'BarlowCondensed',300,306,220,18,opts);
   break;
 }
 return svgDoc(c.name,p.name,variant,background,art);
}
