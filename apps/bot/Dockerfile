FROM node:20.14.0-slim AS base

FROM base AS pruned
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope bot --docker

FROM base as builder
ENV CI true
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/yarn.lock ./yarn.lock
COPY .yarn .yarn
COPY .yarnrc.yml .
RUN yarn install --inline-builds

# Build the project
COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter bot

FROM node:20.14.0-slim as runner
WORKDIR /app
COPY --from=builder /app .
WORKDIR /app/apps/bot
CMD ["node", "--enable-source-maps", "dist/index.js"]
