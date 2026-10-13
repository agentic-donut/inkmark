// Fachada tipada do motor de desenho. Todo o resto do app acessa o motor por aqui.
export {fonts, registerFont, renderLogo, templates} from './registry.js';
export {applyWear, wearFilter} from './ink.js';
export {EFFECT_LEVELS, applyEffects} from './effects';
export type {EffectKey, EffectSettings} from './effects';
