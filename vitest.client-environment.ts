import type {Environment} from 'vitest/runtime';

// Ambiente mínimo sem DOM: só faz o Vitest compilar o Svelte em modo "client",
// que é o que ativa as runes (reatividade de verdade) nos testes de estado.
const environment: Environment = {
	name: 'svelte-client',
	viteEnvironment: 'client',
	setup() {
		return {teardown() {}};
	}
};

export default environment;
