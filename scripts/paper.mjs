// Texturas de papel geradas por código: node scripts/paper.mjs
// Cada folha soma tom manchado, dente (relevo iluminado por luz rasante) e fibras.
// O ruído é periódico, então o ladrilho repete sem emenda em qualquer direção.
import {writeFileSync,mkdirSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {unlinkSync} from 'node:fs';
import {Resvg} from '@resvg/resvg-js';
const S=768;
// Gerador pseudoaleatório fixo, para a textura sair igual a cada execução.
const rng=seed=>()=>((seed=Math.imul(seed^seed>>>15,seed|1)+0x6d2b79f5|0,((seed^seed>>>14)>>>0)/4294967296));
// Ruído de gradiente com período inteiro: a grade de gradientes dá a volta na borda.
function periodicNoise(cells,seed,stretch=[1,1]){
 const r=rng(seed),cx=cells*stretch[0],cy=cells*stretch[1],g=new Float32Array(cx*cy*2);
 for(let i=0;i<cx*cy;i++){const a=r()*Math.PI*2;g[i*2]=Math.cos(a);g[i*2+1]=Math.sin(a);}
 const fade=t=>t*t*t*(t*(t*6-15)+10);
 return (x,y)=>{
  const fx=x/S*cx,fy=y/S*cy,x0=Math.floor(fx),y0=Math.floor(fy),tx=fx-x0,ty=fy-y0;
  const dot=(ix,iy,dx,dy)=>{const k=((iy%cy+cy)%cy*cx+(ix%cx+cx)%cx)*2;return g[k]*dx+g[k+1]*dy;};
  const a=dot(x0,y0,tx,ty),b=dot(x0+1,y0,tx-1,ty),c=dot(x0,y0+1,tx,ty-1),d=dot(x0+1,y0+1,tx-1,ty-1);
  const u=fade(tx),v=fade(ty);return a+(b-a)*u+(c+(d-c)*u-(a+(b-a)*u))*v;
 };
}
// Soma de oitavas (cada uma com o dobro de células), resultado aproximadamente em -1..1.
function fractal(cells,octaves,seed,stretch){
 const layers=Array.from({length:octaves},(_,i)=>periodicNoise(cells*2**i,seed+i*101,stretch));
 const map=new Float32Array(S*S);
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){let v=0,amp=1,sum=0;for(const n of layers){v+=n(x,y)*amp;sum+=amp;amp*=.5;}map[y*S+x]=v/sum*1.6;}
 return map;
}
// Luz rasante sobre o mapa de altura: devolve o fator de sombreamento (1 = plano).
function relief(height,strength,azimuth=135,elevation=50){
 const az=azimuth*Math.PI/180,el=elevation*Math.PI/180,L=[Math.cos(az)*Math.cos(el),Math.sin(az)*Math.cos(el),Math.sin(el)];
 const out=new Float32Array(S*S),h=(x,y)=>height[((y+S)%S)*S+(x+S)%S];
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const nx=-(h(x+1,y)-h(x-1,y))*strength,ny=-(h(x,y+1)-h(x,y-1))*strength,len=Math.hypot(nx,ny,1);
  out[y*S+x]=(nx*L[0]+ny*L[1]+L[2])/len/L[2];
 }
 return out;
}
function png(rgba){
 const raw=Buffer.alloc((S*4+1)*S);for(let y=0;y<S;y++){raw[y*(S*4+1)]=0;rgba.copy(raw,y*(S*4+1)+1,y*S*4,(y+1)*S*4);}
 const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^n>>>1:n>>>1;return n>>>0;});
 const crc=b=>{let c=~0;for(const x of b)c=crcTable[(c^x)&255]^c>>>8;return ~c>>>0;};
 const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([len,td,c]);};
 const head=Buffer.alloc(13);head.writeUInt32BE(S,0);head.writeUInt32BE(S,4);head[8]=8;head[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',head),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
// Fibras: curvas curtas desenhadas por cima, repetidas nos vizinhos para atravessar a borda.
function fibers(r,count,colors,len,width,opacity){
 let out='';
 for(let i=0;i<count;i++){
  const x=r()*S,y=r()*S,a=r()*Math.PI*2,l=len[0]+r()*(len[1]-len[0]),bend=(r()-.5)*l*.7;
  const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l,cx=(x+x2)/2-Math.sin(a)*bend,cy=(y+y2)/2+Math.cos(a)*bend;
  const d=`M${x.toFixed(1)} ${y.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const c=colors[Math.floor(r()*colors.length)],w=(width[0]+r()*(width[1]-width[0])).toFixed(2),o=(opacity[0]+r()*(opacity[1]-opacity[0])).toFixed(2);
  for(const dx of [-S,0,S])for(const dy of [-S,0,S])out+=`<path d="${d}" transform="translate(${dx} ${dy})" stroke="${c}" stroke-width="${w}" opacity="${o}" fill="none" stroke-linecap="round"/>`;
 }
 return out;
}
function paper({seed,base,mottle,tooth,fiberSets=[],laid}){
 const tone=fractal(3,5,seed,[1,1]);
 const height=fractal(tooth.cells,tooth.octaves,seed+7,tooth.stretch);
 const light=relief(height,tooth.strength);
 // Calibra o relevo pela variação de luz: "contrast" é o desvio-padrão desejado (0,03 = 3%).
 let sd=0;for(const v of light)sd+=(v-1)**2;sd=Math.sqrt(sd/light.length);const k=tooth.contrast/sd;
 const speck=fractal(96,2,seed+13,[1,1]);
 const [R,G,B]=hex(base),rgba=Buffer.alloc(S*S*4);
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){
  const i=y*S+x;
  let f=1+tone[i]*mottle;                                   // manchas de tom
  f*=1+(light[i]-1)*k;                           // relevo do dente
  if(laid)f*=1-laid.lines*(.5+.5*Math.cos(y/laid.pitch*Math.PI*2))-laid.chain*Math.exp(-(((x%laid.chainGap)-laid.chainGap/2)**2)/(2*laid.chainWidth**2));
  f*=1-Math.max(0,speck[i]-.55)*.25;                         // pontinhos de impureza
  rgba[i*4]=Math.min(255,R*f);rgba[i*4+1]=Math.min(255,G*f);rgba[i*4+2]=Math.min(255,B*f);rgba[i*4+3]=255;
 }
 const href='data:image/png;base64,'+png(rgba).toString('base64'),r=rng(seed+29);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><image href="${href}" width="${S}" height="${S}"/>${fiberSets.map(f=>fibers(r,...f)).join('')}</svg>`;
 return new Resvg(svg).render().asPng();
}
const papers={
 // Algodão de gráfica: dente fino e macio, poucas fibras claras.
 algodao:paper({seed:11,base:'#f1ebde',mottle:.035,tooth:{cells:200,octaves:3,strength:1,contrast:.028},
  fiberSets:[[220,['#c9bb9c','#b8a882'],[6,22],[.3,.7],[.10,.25]],[160,['#fffbf2'],[8,26],[.5,1.1],[.3,.55]]]}),
 // Kraft: marrom manchado, dente forte, muitas fibras longas.
 kraft:paper({seed:23,base:'#c3a174',mottle:.09,tooth:{cells:220,octaves:3,strength:1,contrast:.05},
  fiberSets:[[750,['#8b6941','#765631','#a5835a'],[8,36],[.35,1.1],[.18,.45]],[260,['#e0c79f'],[6,24],[.4,1],[.25,.5]]]}),
 // Jornal: cinza frio, fibras curtas e escuras.
 jornal:paper({seed:37,base:'#e3e0d6',mottle:.05,tooth:{cells:260,octaves:2,strength:1,contrast:.03},
  fiberSets:[[900,['#8e8b81','#a6a298'],[3,12],[.3,.65],[.12,.32]]]}),
 // Vergé: papel de carta com linhas finas da tela e linhas de corrente espaçadas.
 verge:paper({seed:41,base:'#f3eee2',mottle:.035,tooth:{cells:200,octaves:3,strength:1,contrast:.024},laid:{pitch:4,lines:.018,chain:.035,chainGap:192,chainWidth:2.2},
  fiberSets:[[160,['#d4c9b0'],[8,24],[.3,.7],[.12,.28]]]}),
 // Cartão preto: algodão tingido, fibras um pouco mais claras.
 preto:paper({seed:53,base:'#23211e',mottle:.06,tooth:{cells:200,octaves:3,strength:1,contrast:.07},
  fiberSets:[[320,['#3b3731','#46413a'],[6,22],[.35,.9],[.25,.5]]]}),
};
const out=new URL('../static/paper/',import.meta.url);mkdirSync(out,{recursive:true});
// O site usa JPEG (cerca de 180 KB por folha); a conversão usa o sips do macOS.
for(const [name,data] of Object.entries(papers)){
 const png=new URL(`${name}.png`,out),jpg=new URL(`${name}.jpg`,out);
 writeFileSync(png,data);
 execFileSync('sips',['-s','format','jpeg','-s','formatOptions','82',png.pathname,'--out',jpg.pathname],{stdio:'ignore'});
 unlinkSync(png);
}
console.log('Texturas geradas em static/paper/:',Object.keys(papers).join(', '));
