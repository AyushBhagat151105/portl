FROM oven/bun:1.2-slim AS deps
WORKDIR /app

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY packages/ ./packages/

RUN bun install --ignore-scripts

FROM oven/bun:1.2-slim AS builder
WORKDIR /app

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

COPY --from=deps /app ./
COPY apps/server ./apps/server

RUN cd packages/db && bunx prisma generate

FROM oven/bun:1.2-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/server ./apps/server

EXPOSE 3000

CMD ["bun", "run", "apps/server/src/index.ts"]
