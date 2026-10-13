import {describe, expect, it} from 'vitest';
import {variables} from './env.ts';

describe('ADMIN_REQUIRE_HTTPS', () => {
	const parse = (value: string | undefined) => {
		const result = variables.ADMIN_REQUIRE_HTTPS.schema['~standard'].validate(value) as {
			value?: boolean;
		};
		return result.value;
	};

	it('é desligada por padrão e por qualquer valor que não seja "true"/"1"', () => {
		for (const value of [undefined, '', ' ', 'false', '0', 'no', 'talvez']) {
			expect(parse(value), String(value)).toBe(false);
		}
	});

	it('liga com "true" ou "1", sem diferenciar maiúsculas nem espaços', () => {
		for (const value of ['true', 'TRUE', ' True ', '1']) {
			expect(parse(value), value).toBe(true);
		}
	});
});
