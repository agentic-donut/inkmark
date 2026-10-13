import type {WearLevel} from '../editor/types';

export function wearFilter(level: WearLevel, seed?: number): string;
export interface WearParams {
	dots: number;
	scratch: number;
	patch: number;
	edge: number;
}
export function wearFilterWith(params: WearParams, id: string, seed?: number): string;
export function applyWear(svg: string, level: WearLevel, seed?: number): string;
