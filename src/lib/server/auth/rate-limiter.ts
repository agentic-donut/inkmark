export interface RateLimiterOptions {
	maxFailures: number;
	windowMs: number;
	now: () => number;
	/** Teto de chaves guardadas, para um atacante trocando de IP não encher a memória. */
	maxKeys?: number;
}

export type RateLimitState = {allowed: true} | {allowed: false; retryAfterMs: number};

interface Failures {
	count: number;
	/** Quando a janela desta chave termina. */
	resetAt: number;
}

/** Limita tentativas de login por chave (IP) em memória. Reiniciar o servidor zera os contadores. */
export class LoginRateLimiter {
	private readonly entries = new Map<string, Failures>();
	private readonly maxKeys: number;

	constructor(private readonly options: RateLimiterOptions) {
		this.maxKeys = options.maxKeys ?? 10_000;
	}

	check(key: string): RateLimitState {
		const entry = this.active(key);
		if (!entry || entry.count < this.options.maxFailures) return {allowed: true};
		return {allowed: false, retryAfterMs: entry.resetAt - this.options.now()};
	}

	/** Quantas falhas a chave tem na janela atual (0 se nenhuma). */
	failures(key: string): number {
		return this.active(key)?.count ?? 0;
	}

	recordFailure(key: string): void {
		const entry = this.active(key);
		if (entry) {
			entry.count += 1;
			return;
		}
		if (this.entries.size >= this.maxKeys) this.evict();
		this.entries.set(key, {count: 1, resetAt: this.options.now() + this.options.windowMs});
	}

	reset(key: string): void {
		this.entries.delete(key);
	}

	private active(key: string): Failures | undefined {
		const entry = this.entries.get(key);
		if (entry && entry.resetAt <= this.options.now()) {
			this.entries.delete(key);
			return undefined;
		}
		return entry;
	}

	private evict(): void {
		const now = this.options.now();
		for (const [key, entry] of this.entries) if (entry.resetAt <= now) this.entries.delete(key);
		if (this.entries.size >= this.maxKeys) {
			const oldest = this.entries.keys().next().value;
			if (oldest !== undefined) this.entries.delete(oldest);
		}
	}
}

function expandIPv6(address: string): number[] | null {
	const withoutZone = address.split('%')[0];
	const [head, tail, ...extra] = withoutZone.split('::');
	if (extra.length > 0) return null;
	const toGroups = (part: string): number[] | null => {
		if (part === '') return [];
		const groups: number[] = [];
		for (const piece of part.split(':')) {
			if (piece.includes('.')) {
				// Sufixo IPv4 ("::ffff:1.2.3.4") ocupa dois grupos.
				const octets = piece.split('.').map(Number);
				if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
					return null;
				}
				groups.push(octets[0] * 256 + octets[1], octets[2] * 256 + octets[3]);
			} else if (/^[0-9a-f]{1,4}$/i.test(piece)) {
				groups.push(parseInt(piece, 16));
			} else {
				return null;
			}
		}
		return groups;
	};
	const first = toGroups(head);
	const last = toGroups(tail ?? '');
	if (!first || !last) return null;
	if (tail === undefined) return first.length === 8 ? first : null;
	const missing = 8 - first.length - last.length;
	return missing < 1 ? null : [...first, ...new Array<number>(missing).fill(0), ...last];
}

/**
 * Chave de limite de um endereço. Quem tem IPv6 costuma controlar um /64 inteiro (2^64 endereços);
 * contar por endereço deixaria o atacante trocar de "IP" a cada tentativa. Então IPv6 vale pelo /64,
 * e IPv4 mapeado em IPv6 (`::ffff:1.2.3.4`) vale como o IPv4 de verdade.
 */
export function normalizeClientKey(address: string): string {
	const trimmed = address.trim().toLowerCase();
	if (!trimmed.includes(':')) return trimmed || 'unknown';
	const groups = expandIPv6(trimmed);
	if (!groups) return trimmed;
	const mapped = groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff;
	if (mapped) return `${groups[6] >> 8}.${groups[6] & 255}.${groups[7] >> 8}.${groups[7] & 255}`;
	return `${groups
		.slice(0, 4)
		.map((g) => g.toString(16))
		.join(':')}::/64`;
}
