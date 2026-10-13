/** Largura em que a prova ao vivo passa para o topo da página, longe dos classificados. */
const NARROW_LAYOUT_QUERY = '(max-width: 1000px)';

export function isNarrowLayout(): boolean {
	return window.matchMedia(NARROW_LAYOUT_QUERY).matches;
}

/** Rola até o elemento com animação, a menos que a pessoa prefira menos movimento. */
export function scrollToElement(element: Element): void {
	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	element.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block: 'start'});
}
