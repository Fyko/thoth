FROM node:18.9.0-slim AS builder

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@thoth/bot --docker

FROM node:18.9.0-slim
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY .yarn .yarn
COPY .yarnrc.yml .
RUN yarn install
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.json tsconfig.json
RUN yarn turbo run build --filter=@thoth/bot
CMD ["node", "services/bot/dist/index.js"]
