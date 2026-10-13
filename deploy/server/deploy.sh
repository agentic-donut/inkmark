#!/usr/bin/env bash
# Faz o deploy de um commit da main no servidor: o portão (a suíte de testes dentro do build da
# imagem), a imagem entregue ao k3s, os manifestos com ela, o rollout e o caminho de volta quando
# ele falha. Um portão vermelho para antes de mudar qualquer coisa, então o Inkmark que está no ar
# continua. O túnel público (deploy/cloudflared/) é aplicado em todo deploy: sem mudança, o
# Kubernetes não reinicia nada.
#
#   deploy.sh <commit>
#
# O start-deploy o roda, solto do push; ele é instalado ao lado, na pasta hooks do repositório de
# deploy, por `npm run deploy:install`. A última linha diz como acabou:
# `inkmark-deploy: deployed|unchanged|superseded|failed <commit>`, que o deploy.log do Mac lê.
set -Eeuo pipefail

readonly commit="$1"
# Instalado como <repositório>/hooks/deploy.sh.
repository="$(cd "$(dirname "$0")/.." && pwd)"
readonly repository
readonly home="$HOME/inkmark-deploy"
readonly work="$home/work/$commit"
readonly image="inkmark:$commit"
readonly namespace=inkmark
# Onde o app guarda o banco no disco do servidor (o hostPath de deploy/deployment.yaml).
readonly data=/srv/inkmark/data
# Quantas cópias do banco, tiradas antes de uma troca de migrações, ficam em $data/backups.
readonly backups_kept=5
# Um rollout é a abertura do banco e o início do app: segundos. O pod antigo sai antes de o novo
# subir (Recreate), então um que falha não é esperado por muito tempo.
readonly rollout_timeout=5m
# O que não muda nada da imagem, do portão nem dos manifestos: um commit só disto não é construído
# e o Inkmark não é reiniciado.
readonly not_deployed='^(docs/|\.githooks/|deploy/server/|scripts/deploy-|[^/]+\.md$|LICENSE$)'
# Os manifestos do túnel: mudá-los não reinicia o Inkmark.
readonly tunnel_paths='^deploy/cloudflared/'
# O BuildKit guarda o cache (as camadas do próximo build) até este tamanho; o resto é podado.
readonly build_cache_limit="${INKMARK_DEPLOY_BUILD_CACHE:-10gb}"
# O único comando que o usuário do servidor roda como root.
readonly import=(/usr/local/bin/k3s ctr images import -)
# O kubeconfig que o usuário lê; o hook roda sem o shell de login que o define.
export KUBECONFIG="${KUBECONFIG:-$HOME/.kube/config}"

step="começando"
say() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }
ended() {
  say "$2"
  echo "inkmark-deploy: $1 $commit"
  exit "$([ "$1" = failed ] && echo 1 || echo 0)"
}
# Uma falha inesperada diz em que passo aconteceu.
trap 'ended failed "o deploy falhou em: $step"' ERR
# A pasta de trabalho some de qualquer jeito. As imagens sem nome que um build novo deixou para
# trás saem, e o cache do BuildKit além do limite é podado (o cache é do BuildKit, então a poda
# guarda as camadas que o próximo build reaproveita).
# shellcheck disable=SC2329  # chamada pelo trap EXIT, mais abaixo
cleanup() {
  rm -rf "$work"
  docker image prune --force >/dev/null 2>&1 || true
  docker builder prune --force --max-used-space "$build_cache_limit" >/dev/null 2>&1 || true
}

main_now() { git --git-dir="$repository" rev-parse refs/heads/main; }
deployment() { kubectl --namespace "$namespace" get deployment "$1" --output "jsonpath=$2"; }
# Um Secret do namespace tem a chave $2 com valor? (Sem imprimir o valor.)
secret_has() {
  [ -n "$(kubectl --namespace "$namespace" get secret "$1" --output "jsonpath={.data.$2}" 2>/dev/null)" ]
}

step="esperando o deploy anterior"
mkdir -p "$home/logs" "$home/work"
exec 9>"$home/deploy.lock"
if ! flock --nonblock 9; then
  say "outro deploy está rodando: este espera por ele"
  flock 9
fi
# Só depois de ter o lock: um deploy do mesmo commit que ainda espera nunca apaga a pasta de
# trabalho do que está rodando.
trap cleanup EXIT

if [ "$(main_now)" != "$commit" ]; then
  ended superseded "a main passou de $commit: o deploy dela vem a seguir"
fi

step="conferindo a importação como root"
if ! sudo -n -l "${import[@]}" >/dev/null 2>&1; then
  ended failed "o sudo não pode rodar '${import[*]}' sem senha: ponha a regra do sudoers (docs/deploy.md)"
fi

# Sem os Secrets o app e o túnel não sobem: nada muda.
step="conferindo os Secrets"
for pair in inkmark:admin-password inkmark:session-secret cloudflared:token; do
  if ! secret_has "${pair%%:*}" "${pair#*:}"; then
    ended failed "o Secret ${pair%%:*} não existe ou não tem a chave ${pair#*:}: crie-o (docs/deploy.md)"
  fi
done

step="lendo o que está no ar"
running="$(deployment inkmark '{.spec.template.spec.containers[0].image}' 2>/dev/null || true)"
running="${running#inkmark:}"
ready="$(deployment inkmark '{.status.readyReplicas}' 2>/dev/null || true)"
known_running=false
restart=true
if [ -n "$running" ] && git --git-dir="$repository" cat-file -e "$running^{commit}" 2>/dev/null; then
  known_running=true
fi
if [ "$running" = "$commit" ] && [ "${ready:-0}" -ge 1 ]; then
  restart=false
  unchanged="$commit já está no ar"
elif $known_running && [ "${ready:-0}" -ge 1 ]; then
  changed="$(git --git-dir="$repository" diff --name-only "$running" "$commit" \
    | { grep -Ev "$not_deployed" || true; })"
  # O Inkmark reinicia por tudo que não é nem documentação/deploy, nem o túnel.
  if [ -z "$(grep -Ev "^$|$tunnel_paths" <<<"$changed" || true)" ]; then
    restart=false
  fi
  unchanged="nada que entra no Inkmark mudou desde ${running:0:12}: não foi reconstruído nem reiniciado"
else
  unchanged="nada a fazer"
fi

step="extraindo $commit"
rm -rf "$work"
mkdir -p "$work/checkout"
git --git-dir="$repository" archive "$commit" | tar -x -C "$work/checkout"

# A kustomization que aplica a pasta $1 do checkout com a imagem inkmark na tag $2.
overlay() {
  printf '%s\n' \
    "apiVersion: kustomize.config.k8s.io/v1beta1" \
    "kind: Kustomization" \
    "resources:" \
    "  - ../checkout/$1" \
    "images:" \
    "  - name: inkmark" \
    "    newTag: \"$2\""
}

if $restart; then
  step="rodando o portão (os testes)"
  say "portão: a suíte de testes, num build da imagem (docker build --target test)"
  # O build só termina se os testes passarem; o resultado do docker decide.
  if ! docker build --target test "$work/checkout"; then
    ended failed "o portão está vermelho: nada foi implantado, o Inkmark que está no ar continua"
  fi

  step="construindo a imagem"
  say "imagem: $image"
  docker build --tag "$image" "$work/checkout"
  step="entregando a imagem ao k3s"
  docker save "$image" | sudo -n "${import[@]}"

  if [ "$(main_now)" != "$commit" ]; then
    ended superseded "a main passou de $commit enquanto isso: o deploy dela vem a seguir"
  fi

  # Mudou o esquema do banco? Então o app novo pode deixar o banco num formato que o antigo se
  # recusa a abrir (o app barra banco mais novo que o código): uma cópia sai antes de trocar.
  migrations_changed=true
  if $known_running && git --git-dir="$repository" diff --quiet "$running" "$commit" -- \
    src/lib/server/catalog/migrations.ts src/lib/server/auth/revoked-sessions.ts; then
    migrations_changed=false
  fi
  backup=""
  if $migrations_changed && [ -n "$running" ] && [ -f "$data/inkmark.db" ]; then
    step="copiando o banco"
    backup="$data/backups/$(date -u '+%Y%m%dT%H%M%SZ')-${commit:0:12}"
    mkdir -p "$backup"
    cp -p "$data"/inkmark*.db "$data"/inkmark*.db-wal "$data"/inkmark*.db-shm "$backup/" 2>/dev/null || true
    say "as migrações mudaram: cópia do banco em $backup"
    find "$data/backups" -mindepth 1 -maxdepth 1 -type d | sort | head -n "-$backups_kept" \
      | xargs -r rm -rf
  fi

  step="aplicando deploy/"
  say "apply: deploy/ com $image"
  mkdir -p "$work/overlay"
  overlay deploy "$commit" >"$work/overlay/kustomization.yaml"
  kubectl apply -k "$work/overlay"

  step="esperando o rollout do Inkmark"
  if kubectl --namespace "$namespace" rollout status deployment/inkmark --timeout="$rollout_timeout"; then
    # O docker guarda só as imagens deste commit; o k3s guarda as dele e o kubelet libera as que
    # nenhum pod usa quando o disco enche.
    docker images --format '{{.Repository}}:{{.Tag}}' inkmark \
      | grep -v -F -x -e "$image" \
      | xargs -r docker rmi >/dev/null || true
  else
    step="voltando"
    if [ -z "$running" ]; then
      ended failed "o rollout falhou, e não há Inkmark anterior para onde voltar: kubectl -n $namespace logs deploy/inkmark"
    fi
    if $migrations_changed; then
      # O app novo pode ter alterado o banco, que o anterior não abre: voltar é decisão de uma pessoa.
      kubectl --namespace "$namespace" scale deployment/inkmark --replicas=0
      say "o rollout falhou, e $commit mudou as migrações: o Inkmark anterior pode não abrir o banco"
      say "que o novo deixou. O app está parado; nada foi desfeito."
      if [ -n "$backup" ]; then
        say "Para voltar, no servidor, com o app parado: ponha a cópia de volta e desfaça o rollout:"
        say "  rm -f '$data'/inkmark*.db* && cp -p '$backup'/* '$data/'"
      else
        say "Este deploy não tirou cópia do banco. Para voltar, desfaça o rollout:"
      fi
      say "  kubectl -n $namespace rollout undo deployment/inkmark && kubectl -n $namespace scale deployment/inkmark --replicas=1"
      ended failed "o rollout falhou; o Inkmark fica parado até ser religado à mão"
    fi
    kubectl --namespace "$namespace" rollout undo deployment/inkmark
    if ! kubectl --namespace "$namespace" rollout status deployment/inkmark --timeout="$rollout_timeout"; then
      ended failed "o rollout falhou, e o Inkmark anterior também não voltou: kubectl -n $namespace get pods"
    fi
    ended failed "o rollout falhou: de volta ao Inkmark anterior, ${running:0:12}"
  fi
fi

# O túnel, em todo deploy. Um Deployment igual ao que roda não reinicia nada.
tunnel_changed=false
if [ -f "$work/checkout/deploy/cloudflared/kustomization.yaml" ]; then
  step="aplicando deploy/cloudflared"
  say "apply: deploy/cloudflared"
  applied="$(kubectl apply -k "$work/checkout/deploy/cloudflared")"
  printf '%s\n' "$applied"
  if grep -Eq ' (created|configured)$' <<<"$applied"; then
    tunnel_changed=true
  fi
  step="esperando o rollout do túnel"
  if ! kubectl --namespace "$namespace" rollout status deployment/cloudflared --timeout="$rollout_timeout"; then
    step="desfazendo o túnel"
    kubectl --namespace "$namespace" rollout undo deployment/cloudflared || true
    ended failed "o túnel não ficou pronto (o token do Secret cloudflared vale? kubectl -n $namespace logs deploy/cloudflared); o Inkmark em si está no ar pela rede local"
  fi
fi

if $restart; then
  name="$(kubectl --namespace "$namespace" get ingress inkmark \
    --output 'jsonpath={.spec.rules[0].host}' 2>/dev/null || true)"
  ended deployed "implantado $commit (rede local: http://${name:-o servidor}/)"
fi
if $tunnel_changed; then
  ended deployed "túnel de $commit aplicado; o Inkmark continua ${running:0:12}"
fi
ended unchanged "$unchanged"
