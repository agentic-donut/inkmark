import {createHash, timingSafeEqual} from 'node:crypto';

/** Compara strings em tempo constante. O hash iguala os tamanhos sem vazar o comprimento da senha. */
export function safeEqual(a: string, b: string): boolean {
	const digestA = createHash('sha256').update(a).digest();
	const digestB = createHash('sha256').update(b).digest();
	return timingSafeEqual(digestA, digestB);
}

/** Compara buffers em tempo constante; tamanhos diferentes são rejeitados antes (timingSafeEqual lançaria erro). */
export function safeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
	return a.length === b.length && timingSafeEqual(a, b);
}
