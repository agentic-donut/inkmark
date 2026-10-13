# Imagem de produção do Inkmark, em estágios: dependências, testes, build e a imagem final, que leva
# só o necessário para rodar. Construída no servidor pelo deploy; os segredos nunca entram aqui
# (vêm do Secret do k3s).
#
#   docker build --target test .   roda a suíte de testes (é o portão do deploy: vermelho, nada muda)
#   docker build .                 imagem de produção; o build só começa depois dos testes verdes

FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Os testes rodam durante o build da imagem. O marcador abaixo é o que o estágio seguinte exige:
# sem testes verdes não existe imagem de produção. Nada deste estágio vai para a imagem final.
FROM deps AS test
COPY . .
RUN npm test && touch /tmp/tests-passed

FROM deps AS build
COPY --from=test /tmp/tests-passed /tmp/tests-passed
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
ENV NODE_ENV=production \
	PORT=3000 \
	DATABASE_PATH=/data/inkmark.db
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
# O usuário `node` (uid 1000) da imagem oficial: é o dono de /srv/inkmark/data no servidor.
USER node
EXPOSE 3000
CMD ["node", "build"]
