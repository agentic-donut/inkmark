// Desgaste de tinta: falhas de impressão (pontinhos, riscos e manchas gastas) que deixam ver o papel.
// O filtro trabalha nas coordenadas da logo (600×500), então o desgaste acompanha a marca em qualquer tamanho.
// Para cada nível: limiar dos pontinhos, dos riscos, peso das manchas e aspereza da borda.
const settings={1:{dots:.785,scratch:.86,patch:.05,edge:.45},2:{dots:.745,scratch:.82,patch:.10,edge:.65},3:{dots:.71,scratch:.785,patch:.16,edge:.9}};
// Converte o canal vermelho do ruído em alfa e corta num limiar: acima dele, a tinta falha.
const alpha=(input,result)=>`<feColorMatrix in="${input}" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" result="${result}"/>`;
const hole=(input,limit,result)=>`<feColorMatrix in="${input}" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -24 ${(24*limit).toFixed(2)}" result="${result}"/>`;
export function wearFilter(level,seed=7){
 const s=settings[level];if(!s)return '';
 return wearFilterWith(s,`ink-wear-${level}-${seed}`,seed);
}
// Mesmo filtro com parâmetros próprios (usado por acabamentos que precisam de um desgaste fora dos níveis).
export function wearFilterWith(s,id,seed=7){
 return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="600" height="500" color-interpolation-filters="sRGB">`+
  `<feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="2" seed="${seed}" result="n1"/>${alpha('n1','fine')}`+
  `<feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="${seed+5}" result="n2"/>${alpha('n2','coarse')}`+
  `<feComposite in="fine" in2="coarse" operator="arithmetic" k2="1" k3="${s.patch}" k4="${(-s.patch*.5).toFixed(3)}" result="mix"/>${hole('mix',s.dots,'dots')}`+
  `<feTurbulence type="fractalNoise" baseFrequency="0.006 0.22" numOctaves="2" seed="${seed+11}" result="n3"/>${alpha('n3','streak')}${hole('streak',s.scratch,'scratch')}`+
  `<feComposite in="dots" in2="scratch" operator="in" result="mask"/>`+
  `<feComposite in="SourceGraphic" in2="mask" operator="in" result="worn"/>`+
  `<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="${seed+17}" result="n4"/>`+
  `<feDisplacementMap in="worn" in2="n4" scale="${s.edge}" xChannelSelector="R" yChannelSelector="G"/>`+
 `</filter>`;
}
// Aplica o desgaste a um SVG gerado pelo catálogo: só a arte recebe o filtro, o fundo continua liso.
export function applyWear(svg,level,seed=7){
 if(!settings[level])return svg;
 const id=`ink-wear-${level}-${seed}`;
 return svg.replace(/(<g fill="[^"]+" color="[^"]+")>/,`<defs>${wearFilter(level,seed)}</defs>$1 filter="url(#${id})">`);
}
