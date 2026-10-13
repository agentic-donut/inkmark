#!/usr/bin/env bash
# `npm run deploy:install`: a preparação do servidor que não pede root. Copia deploy/server/ para lá
# e roda o `install`, que cria o repositório de deploy com seus hooks e confere o que o root faz
# uma vez, dizendo o que falta. De novo sempre que deploy/server/ mudar.
#
# O servidor é o host do remoto `deploy` (a parte antes de `:` em `git remote add deploy <host>:inkmark.git`),
# ou INKMARK_DEPLOY_HOST. O nome do servidor fica só no seu .git/config, nunca no repositório.
set -euo pipefail

cd "$(dirname "$0")/.."
host="${INKMARK_DEPLOY_HOST:-}"
if [ -z "$host" ]; then
  url="$(git remote get-url "${INKMARK_DEPLOY_REMOTE:-deploy}" 2>/dev/null)" || {
    echo "Falta o remoto do servidor: git remote add deploy <apelido-ssh>:inkmark.git" >&2
    exit 1
  }
  host="${url%%:*}"
fi
readonly host

ssh "$host" 'mkdir -p inkmark-deploy/server'
scp deploy/server/install deploy/server/post-receive deploy/server/update \
  deploy/server/start-deploy deploy/server/deploy.sh "$host:inkmark-deploy/server/"
ssh "$host" 'bash inkmark-deploy/server/install'
