// Registro de modelos: cada fonte de modelos (motor original, selos, rodadas 3 a 9) declara
// suas definições e seu renderizador. Acrescentar uma rodada é registrar uma nova fonte,
// sem tocar no despacho.
import {templates as originalTemplates, renderLogo as renderOriginal} from './engine.js';
import {badgeTemplates, renderBadge} from './badges.js';
import {proposalTemplates, renderProposal} from './proposals.js';
import {round4Templates, renderRound4} from './proposals4.js';
import {round5Templates, renderRound5} from './proposals5.js';
import {round6Templates, renderRound6} from './proposals6.js';
import {round7Templates, renderRound7} from './proposals7.js';
import {round8Templates, renderRound8} from './proposals8.js';
import {round9Templates, renderRound9} from './proposals9.js';
export {fonts, registerFont} from './engine.js';

/** Adapta renderizadores no formato (id, config, variant, background) ao formato do registro. */
const byId = (renderById) => (config, variant, background) =>
	renderById(config.template, config, variant, background);

export const templates = [];
const renderers = new Map();
let fallback = null;

/** Registra uma fonte de modelos. A ordem das chamadas define a ordem do catálogo. */
function registerSource({definitions, render}) {
	for (const definition of definitions) {
		if (renderers.has(definition.id)) throw new Error(`Modelo duplicado: ${definition.id}`);
		renderers.set(definition.id, render);
		templates.push(definition);
	}
	fallback ??= render;
}

registerSource({definitions: originalTemplates, render: renderOriginal});
registerSource({definitions: badgeTemplates, render: byId(renderBadge)});
registerSource({definitions: proposalTemplates, render: byId(renderProposal)});
registerSource({definitions: round4Templates, render: byId(renderRound4)});
registerSource({definitions: round5Templates, render: byId(renderRound5)});
registerSource({definitions: round6Templates, render: byId(renderRound6)});
registerSource({definitions: round7Templates, render: byId(renderRound7)});
registerSource({definitions: round8Templates, render: byId(renderRound8)});
registerSource({definitions: round9Templates, render: byId(renderRound9)});

/** Modelo desconhecido cai no renderizador do motor original, que usa o primeiro modelo. */
export function renderLogo(config = {}, variant = 'light', background = true) {
	const render = renderers.get(config.template) ?? fallback;
	return render(config, variant, background);
}
