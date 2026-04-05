FROM oven/bun:1-slim AS base

FROM base AS pruned
WORKDIR /app
RUN bun add -g turbo
COPY . .
RUN turbo prune bot --docker

FROM base AS builder
ENV CI true
WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=pruned /app/out/json/ .
COPY --from=pruned /app/out/bun.lock ./bun.lock
RUN bun install --frozen-lockfile

# Build the project
COPY --from=pruned /app/out/full/ .
COPY turbo.json turbo.json
RUN bun run turbo run build --filter bot

FROM oven/bun:1-slim AS runner
WORKDIR /app
COPY --from=builder /app .
WORKDIR /app/apps/bot
CMD ["bun", "run", "--smol", "src/index.ts"]
