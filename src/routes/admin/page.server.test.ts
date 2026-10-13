import {describe, expect, it} from 'vitest';
import {actions, load} from './+page.server.ts';

// A página do admin confere a sessão por conta própria, sem depender só do hook.
const anonymous = {admin: {enabled: true, authenticated: false}} as App.Locals;

function form(entries: Record<string, string>): Request {
	const body = new FormData();
	for (const [key, value] of Object.entries(entries)) body.set(key, value);
	return new Request('http://localhost/admin?/visibility', {method: 'POST', body});
}

describe('admin sem sessão', () => {
	it('não carrega o painel', async () => {
		await expect(load({locals: anonymous} as never)).rejects.toMatchObject({status: 401});
	});

	it('não executa nenhuma ação', async () => {
		for (const [name, run] of Object.entries(actions)) {
			const event = {request: form({id: 'gothic', hidden: 'true'}), locals: anonymous};
			await expect(run(event as never), name).rejects.toMatchObject({status: 401});
		}
	});
});
