export type CatalogAdminErrorCode = 'unknown-template' | 'invalid-name' | 'invalid-category';

export class CatalogAdminError extends Error {
	constructor(
		readonly code: CatalogAdminErrorCode,
		message: string
	) {
		super(message);
		this.name = 'CatalogAdminError';
	}
}
