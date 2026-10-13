import type {LogoConfig} from '../editor/types';
import type {TemplateDefinition, Variant} from '../catalog/types';

interface FontDefinition {
	id: string;
	name: string;
	style: string;
}

export const templates: TemplateDefinition[];
export const fonts: FontDefinition[];
export function registerFont(id: string, buffer: ArrayBuffer): void;
export function renderLogo(
	config?: Partial<LogoConfig>,
	variant?: Variant,
	background?: boolean
): string;
