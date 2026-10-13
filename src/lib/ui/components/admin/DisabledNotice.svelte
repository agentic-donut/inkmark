<script lang="ts">
	interface Props {
		problems: readonly string[];
	}
	let {problems}: Props = $props();
</script>

<!-- O Preflight zera margens, marcadores e a fonte do código: tudo isso é devolvido aqui. -->
<section
	class="mx-auto my-14 max-w-[640px] border border-ink px-8 pt-7 pb-[30px] outline-1 outline-offset-[5px] outline-ink [&_code]:font-[family-name:monospace] [&_pre]:font-[family-name:monospace]"
	aria-labelledby="disabled-title"
>
	<p class="label-caps tracking-caps">Aviso da tipografia</p>
	<h2 class="mt-1.5 mb-3.5 font-masthead text-[40px] leading-[1.1] font-normal" id="disabled-title">
		A redação está fechada
	</h2>
	<p class="my-4">
		O painel de administração só abre quando o servidor tem uma senha e um segredo configurados.
	</p>
	<ul class="my-4 list-disc pl-5 font-bold">
		{#each problems as problem (problem)}
			<li>{problem}</li>
		{/each}
	</ul>
	<p class="my-4">Defina as variáveis de ambiente abaixo e reinicie o servidor:</p>
	<pre class="my-3.5 overflow-x-auto bg-ink px-4 py-3.5 text-[14px] text-paper"><code
			>ADMIN_PASSWORD=sua-senha-forte
SESSION_SECRET=$(openssl rand -hex 32)</code
		></pre>
	<p class="my-3.5 text-[14px] italic">
		Opcional: <code>DATABASE_PATH</code> muda o arquivo SQLite onde o catálogo é guardado (padrão
		<code>data/inkmark.db</code>). Os detalhes estão na seção «Admin» do README.
	</p>
</section>
