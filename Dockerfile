FROM node:18-alpine AS base
ENV CI true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk update
RUN apk add --no-cache libc6-compat

RUN corepack enable
RUN corepack prepare pnpm@latest --activate

COPY . /usr/thoth
WORKDIR /usr/thoth

FROM base AS builder

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm run build

FROM builder AS pruned

RUN pnpm --filter thoth --prod deploy pruned

FROM node:18-alpine AS proxy

WORKDIR /usr/thoth

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 thoth
USER thoth

COPY --from=pruned /usr/thoth/pruned/dist dist
COPY --from=pruned /usr/thoth/pruned/node_modules node_modules
COPY --from=pruned /usr/thoth/pruned/package.json package.json
COPY --from=pruned /usr/thoth/pruned/LICENSE LICENSE

CMD ["node", "--enable-source-maps", "dist/index.js"]
