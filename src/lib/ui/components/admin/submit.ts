import type {SubmitFunction} from '$app/forms';

/**
 * Comportamento comum dos formulários do admin com JavaScript: não zera os campos,
 * devolve o foco ao botão usado (a lista se reordena e o DOM se move) e avisa ao terminar (com o id do botão usado, para quem mudar a lista de lugar refazer o foco).
 */
export function adminSubmit(
	onDone?: (succeeded: boolean, focusId: string) => void
): SubmitFunction {
	return ({submitter}) => {
		const focusId = submitter instanceof HTMLElement ? submitter.id : '';
		return async ({result, update}) => {
			await update({reset: false});
			if (focusId) document.getElementById(focusId)?.focus();
			onDone?.(result.type === 'success', focusId);
		};
	};
}
