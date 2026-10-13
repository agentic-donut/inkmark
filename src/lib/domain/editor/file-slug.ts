/** Nome de arquivo seguro a partir do nome da marca: sem acentos, minúsculo, hifenizado. */
export function fileSlug(name: string): string {
	const slug = name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return slug || 'logo';
}
