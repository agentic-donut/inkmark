export const TOAST_DURATION_MS = 3500;

/** Uma mensagem curta por vez; some sozinha, e uma nova mensagem reinicia a contagem. */
export class ToastState {
	message = $state('');
	visible = $state(false);

	#timer: ReturnType<typeof setTimeout> | undefined;

	show(message: string): void {
		clearTimeout(this.#timer);
		this.message = message;
		this.visible = true;
		this.#timer = setTimeout(() => (this.visible = false), TOAST_DURATION_MS);
	}

	dismiss(): void {
		clearTimeout(this.#timer);
		this.visible = false;
	}
}
