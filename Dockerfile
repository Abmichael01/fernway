# ------------------------------------------------------------------------------
#  Fernway Online Banking (Next.js 16) – Production Dockerfile (Dokploy)
# ------------------------------------------------------------------------------

FROM node:22-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

WORKDIR /app

# -- Stage 1: Install dependencies --
FROM base AS deps
COPY frontend/package.json frontend/pnpm-lock.yaml frontend/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# -- Stage 2: Build Next.js app --
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./
ENV NODE_ENV=production
RUN pnpm build

# -- Stage 3: Production runtime --
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
