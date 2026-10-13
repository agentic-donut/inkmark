/**
 * Executa tarefas assíncronas uma de cada vez, na ordem de chegada.
 * Evita que duas requisições leiam as mesmas configurações e uma apague a mudança da outra.
 */
export class SerialQueue {
	private tail: Promise<unknown> = Promise.resolve();

	run<T>(task: () => Promise<T>): Promise<T> {
		const result = this.tail.then(task, task);
		this.tail = result.catch(() => undefined);
		return result;
	}
}
