// Sonda do Kubernetes: responde só "ok", sem tocar no banco nem dizer nada sobre o servidor.
import type {RequestHandler} from './$types';

export const GET: RequestHandler = () =>
	new Response('ok', {headers: {'content-type': 'text/plain', 'cache-control': 'no-store'}});
