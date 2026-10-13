import type {Reroute} from '@sveltejs/kit/hooks';
import {rerouteTarget} from '#lib/i18n/routing.ts';

// Tira o prefixo de idioma (/en/..., /es/...) para o roteador achar a página; o admin nunca tem prefixo.
export const reroute: Reroute = ({url}) => rerouteTarget(url);
