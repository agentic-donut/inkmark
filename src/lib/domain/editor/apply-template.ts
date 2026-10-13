import type {TemplateDefinition} from '../catalog/types';
import type {LogoConfig} from './types';

export type TemplateChoice = Pick<TemplateDefinition, 'id' | 'font' | 'ornament'>;

/** Escolher um modelo também troca a fonte e o ornamento para os que ele pede. */
export function applyTemplate(config: LogoConfig, template: TemplateChoice): LogoConfig {
	return {
		...config,
		template: template.id,
		font: template.font,
		ornament: template.ornament ?? 'stars'
	};
}
