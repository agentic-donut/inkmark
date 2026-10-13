import type {Ornament} from '../editor/types';

export type Category = 'Lettering' | 'Selos' | 'Emblemas';
export type Variant = 'light' | 'dark';

/** Vem do código (motor de desenho). */
export interface TemplateDefinition {
	id: string;
	name: string;
	category: Category;
	font: string;
	ornament?: Ornament;
	sample?: string;
	topline?: string;
	tagline?: string;
	desc?: string;
	tilt?: boolean;
}

/** Vem do admin (persistido). */
export interface TemplateSettings {
	hidden?: boolean;
	featured?: boolean;
	order?: number;
	name?: string;
	category?: Category;
}

export interface CatalogSettings {
	defaultTemplate: string | null;
	/** A chave é o id do modelo. */
	templates: Record<string, TemplateSettings>;
	updatedAt: string | null;
}

export interface CatalogEntry extends TemplateDefinition {
	hidden: boolean;
	featured: boolean;
	order: number;
}
