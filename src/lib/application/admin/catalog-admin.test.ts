import {beforeEach, describe, expect, it} from 'vitest';
import {EMPTY_SETTINGS} from '#lib/domain/catalog/index.ts';
import type {CatalogSettings} from '#lib/domain/catalog/index.ts';
import {definition} from '../../testing/fakes.ts';
import type {CatalogSettingsRepository} from '../ports.ts';
import {createCatalogAdmin} from './catalog-admin.ts';
import type {CatalogAdmin} from './catalog-admin.ts';
import {CatalogAdminError} from './errors.ts';

class InMemoryRepository implements CatalogSettingsRepository {
	saved: CatalogSettings | null = null;
	saves = 0;
	constructor(private current: CatalogSettings = structuredClone(EMPTY_SETTINGS)) {}
	async load() {
		await Promise.resolve();
		return structuredClone(this.saved ?? this.current);
	}
	async save(settings: CatalogSettings) {
		// Atraso para expor corridas se os casos de uso não serializarem.
		await new Promise((resolve) => setTimeout(resolve, 1));
		this.saved = structuredClone(settings);
		this.saves += 1;
	}
}

const definitions = [
	definition('a', {name: 'Alpha', category: 'Lettering'}),
	definition('b', {name: 'Beta', category: 'Selos'}),
	definition('c', {name: 'Gamma', category: 'Emblemas'})
];
const NOW = '2026-10-12T12:00:00.000Z';

describe('catalog admin', () => {
	let repository: InMemoryRepository;
	let admin: CatalogAdmin;

	beforeEach(() => {
		repository = new InMemoryRepository();
		admin = createCatalogAdmin({repository, definitions, now: () => NOW});
	});

	it('oculta, mostra e alterna a visibilidade, guardando só o que foge do original', async () => {
		expect((await admin.setHidden('a', true)).templates.a).toEqual({hidden: true});
		expect(repository.saved?.updatedAt).toBe(NOW);
		expect((await admin.toggleHidden('a')).templates).toEqual({});
		expect((await admin.toggleHidden('a')).templates.a).toEqual({hidden: true});
	});

	it('alterna o destaque', async () => {
		expect((await admin.toggleFeatured('b')).templates.b).toEqual({featured: true});
		expect((await admin.setFeatured('b', false)).templates).toEqual({});
	});

	it('renomeia e restaura o nome original com texto vazio ou igual ao original', async () => {
		expect((await admin.renameTemplate('a', '  Novo nome  ')).templates.a?.name).toBe('Novo nome');
		expect((await admin.renameTemplate('a', '   ')).templates).toEqual({});
		await admin.renameTemplate('a', 'Outro');
		expect((await admin.renameTemplate('a', 'Alpha')).templates).toEqual({});
	});

	it('recusa nome acima de 60 caracteres', async () => {
		await expect(admin.renameTemplate('a', 'x'.repeat(61))).rejects.toMatchObject({
			code: 'invalid-name'
		});
		expect(repository.saves).toBe(0);
	});

	it('troca a categoria e remove o override ao voltar à original', async () => {
		expect((await admin.changeCategory('a', 'Selos')).templates.a).toEqual({category: 'Selos'});
		expect((await admin.changeCategory('a', 'Lettering')).templates).toEqual({});
	});

	it('recusa categoria inválida', async () => {
		await expect(admin.changeCategory('a', 'Outra' as never)).rejects.toBeInstanceOf(
			CatalogAdminError
		);
	});

	it('move para cima e para baixo trocando com o vizinho', async () => {
		let settings = await admin.moveDown('a');
		expect(settings.templates.b?.order).toBe(0);
		expect(settings.templates.a?.order).toBe(1);
		settings = await admin.moveUp('c');
		expect(settings.templates.c?.order).toBe(1);
		expect(settings.templates.a?.order).toBe(2);
	});

	it('na borda da lista não há o que mover e nada é gravado', async () => {
		await admin.moveUp('a');
		await admin.moveDown('c');
		expect(repository.saves).toBe(0);
	});

	it('define o modelo padrão', async () => {
		expect((await admin.setDefault('b')).defaultTemplate).toBe('b');
		expect(repository.saved?.defaultTemplate).toBe('b');
	});

	it('oculta e mostra vários de uma vez com uma única gravação', async () => {
		const settings = await admin.bulkSetHidden(['a', 'b', 'a'], true);
		expect(Object.keys(settings.templates).sort()).toEqual(['a', 'b']);
		expect(repository.saves).toBe(1);
		expect((await admin.bulkSetHidden(['a', 'b'], false)).templates).toEqual({});
	});

	it('restaura o modelo mas mantém a posição na lista', async () => {
		await admin.renameTemplate('b', 'Outro');
		await admin.changeCategory('b', 'Emblemas');
		await admin.toggleFeatured('b');
		await admin.moveUp('b');
		const settings = await admin.resetTemplate('b');
		expect(settings.templates.b).toEqual({order: 0});
	});

	it('recusa ids desconhecidos em qualquer operação, sem gravar', async () => {
		const calls = [
			() => admin.setHidden('x', true),
			() => admin.toggleFeatured('x'),
			() => admin.renameTemplate('x', 'a'),
			() => admin.changeCategory('x', 'Selos'),
			() => admin.moveUp('x'),
			() => admin.setDefault('x'),
			() => admin.bulkSetHidden(['a', 'x'], true),
			() => admin.resetTemplate('x')
		];
		for (const call of calls) {
			await expect(call()).rejects.toMatchObject({code: 'unknown-template'});
		}
		expect(repository.saves).toBe(0);
	});

	it('serializa mudanças simultâneas sem perder nenhuma', async () => {
		await Promise.all([
			admin.setHidden('a', true),
			admin.setFeatured('b', true),
			admin.renameTemplate('c', 'Novo'),
			admin.setDefault('b')
		]);
		expect(repository.saved?.templates).toEqual({
			a: {hidden: true},
			b: {featured: true},
			c: {name: 'Novo'}
		});
		expect(repository.saved?.defaultTemplate).toBe('b');
	});
});
