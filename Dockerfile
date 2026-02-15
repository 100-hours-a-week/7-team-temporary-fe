# syntax=docker/dockerfile:1.7

FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,id=next-cache,target=/app/.next/cache \
    pnpm build

FROM node:20-slim AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
