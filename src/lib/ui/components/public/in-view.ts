import type {Action} from 'svelte/action';

/**
 * Avisa uma única vez quando o elemento chega perto da tela, para desenhar os cards sob demanda.
 * Sem IntersectionObserver (navegador antigo) avisa na hora: melhor lento do que vazio.
 */
export const inView: Action<Element, () => void> = (node, onEnter) => {
	if (typeof IntersectionObserver === 'undefined') {
		onEnter();
		return;
	}
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((entry) => entry.isIntersecting)) return;
			observer.disconnect();
			onEnter();
		},
		{rootMargin: '400px 0px'}
	);
	observer.observe(node);
	return {destroy: () => observer.disconnect()};
};
