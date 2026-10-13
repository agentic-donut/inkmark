import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import {TOAST_DURATION_MS, ToastState} from './toast-state.svelte';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('ToastState', () => {
	test('mostra a mensagem e some depois do prazo', () => {
		const toast = new ToastState();
		toast.show('Olá');
		expect(toast).toMatchObject({message: 'Olá', visible: true});
		vi.advanceTimersByTime(TOAST_DURATION_MS);
		expect(toast.visible).toBe(false);
		expect(toast.message).toBe('Olá');
	});

	test('uma nova mensagem reinicia a contagem', () => {
		const toast = new ToastState();
		toast.show('Primeira');
		vi.advanceTimersByTime(TOAST_DURATION_MS - 100);
		toast.show('Segunda');
		vi.advanceTimersByTime(TOAST_DURATION_MS - 100);
		expect(toast).toMatchObject({message: 'Segunda', visible: true});
		vi.advanceTimersByTime(100);
		expect(toast.visible).toBe(false);
	});

	test('dismiss esconde na hora', () => {
		const toast = new ToastState();
		toast.show('x');
		toast.dismiss();
		expect(toast.visible).toBe(false);
	});
});
