import {expect, test, vi} from 'vitest';
import {DEFAULT_CONFIG} from '../domain/editor/defaults';
import {createInkRenderer} from './renderer';

function fakeEngine() {
	return {
		renderLogo: vi.fn(() => '<svg>base</svg>'),
		applyEffects: vi.fn(
			(svg: string, fx: {halftone: number; bleed: number; pressure: number; wear: number}) =>
				`${svg}+h${fx.halftone}b${fx.bleed}p${fx.pressure}w${fx.wear}`
		)
	};
}

test('desenha com o motor e entrega os quatro efeitos da configuração', () => {
	const engine = fakeEngine();
	const config = {
		...DEFAULT_CONFIG,
		wear: 2 as const,
		halftone: 1 as const,
		bleed: 3 as const,
		pressure: 2 as const
	};
	const svg = createInkRenderer(engine).render(config, 'dark');
	expect(svg).toBe('<svg>base</svg>+h1b3p2w2');
	expect(engine.renderLogo).toHaveBeenCalledWith(config, 'dark', true);
	expect(engine.applyEffects).toHaveBeenCalledWith('<svg>base</svg>', {
		halftone: 1,
		bleed: 3,
		pressure: 2,
		wear: 2
	});
});

test('os efeitos recebem o SVG já desenhado (desenho e depois efeitos)', () => {
	const order: string[] = [];
	const engine = {
		renderLogo: vi.fn(() => {
			order.push('render');
			return 'svg';
		}),
		applyEffects: vi.fn((svg: string) => {
			order.push('effects');
			return svg;
		})
	};
	createInkRenderer(engine).render(DEFAULT_CONFIG, 'light');
	expect(order).toEqual(['render', 'effects']);
});

test('a configuração padrão só pede o desgaste leve', () => {
	const engine = fakeEngine();
	createInkRenderer(engine).render(DEFAULT_CONFIG, 'light');
	expect(engine.applyEffects).toHaveBeenCalledWith('<svg>base</svg>', {
		halftone: 0,
		bleed: 0,
		pressure: 0,
		wear: 1
	});
});

test('repassa a opção de fundo ao motor', () => {
	const engine = fakeEngine();
	const renderer = createInkRenderer(engine);
	renderer.render(DEFAULT_CONFIG, 'light', {background: false});
	expect(engine.renderLogo).toHaveBeenLastCalledWith(DEFAULT_CONFIG, 'light', false);
	renderer.render(DEFAULT_CONFIG, 'light', {});
	expect(engine.renderLogo).toHaveBeenLastCalledWith(DEFAULT_CONFIG, 'light', true);
});
