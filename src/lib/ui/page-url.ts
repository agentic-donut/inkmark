import {goto} from '$app/navigation';
import {page as route} from '$app/state';
import {PAGE_PARAM, parsePage} from '#lib/domain/pagination/index.ts';

/** Página pedida pela URL atual; 1 se não houver ou for inválida. */
export function readPageParam(): number {
	return parsePage(route.url.searchParams.get(PAGE_PARAM));
}

/**
 * Reflete a página na URL sem navegar: troca a entrada do histórico e não roda as `load` de novo.
 * A página 1 é a URL limpa.
 */
export function writePageParam(pageNumber: number): void {
	// `page.url` não acompanha as navegações rasas; o endereço de verdade é o do navegador.
	const current = window.location.href;
	const url = new URL(current);
	if (pageNumber <= 1) url.searchParams.delete(PAGE_PARAM);
	else url.searchParams.set(PAGE_PARAM, String(pageNumber));
	if (url.href === current) return;
	// A URL é a da própria página (só muda o parâmetro), não uma rota a resolver.
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	void goto(url, {shallow: true, replace: true});
}
