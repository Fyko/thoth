FROM node:20-alpine AS base

FROM base AS pruned
WORKDIR /app

RUN apk add --no-cache libc6-compat
RUN apk update
RUN yarn global add turbo

COPY . .

RUN turbo prune --scope bot --docker

FROM base as builder
ENV CI true
WORKDIR /app
RUN apk add --no-cache libc6-compat
RUN apk update

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

FROM node:20-alpine as runner
WORKDIR /app
COPY --from=builder /app .
WORKDIR /app/apps/bot
CMD ["node", "dist/index.js"]
