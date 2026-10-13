#!/usr/bin/env bash
# `npm run deploy:log`: o último envio que os hooks do git iniciaram e a resposta do servidor,
# lidos do .git/deploy.log.
set -euo pipefail

log="$(git rev-parse --path-format=absolute --git-common-dir)/deploy.log"
readonly log

if [ ! -f "$log" ]; then
  echo "Nenhum deploy ainda: $log não existe." >&2
  exit 1
fi
# Mostra só o último bloco, o que começa na última linha "== <data>".
awk '/^== [0-9][0-9][0-9][0-9]-/ { last = "" } { last = last $0 "\n" } END { printf "%s", last }' "$log"
