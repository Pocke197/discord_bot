# ---------- Etapa 1: base común ----------
FROM node:24-slim AS base
RUN corepack enable
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod
RUN node_modules/.bin/prisma --version

# ---------- Etapa 2: compilar ----------
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./ 
RUN pnpm install --frozen-lockfile

COPY prisma/ ./prisma/
COPY prisma7.config.ts ./prisma7.config.ts
RUN pnpm prisma:generate

COPY . .
RUN pnpm build

# ---------- Etapa 3: imagen final ----------
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma7.config.ts ./prisma7.config.ts
EXPOSE 3000
USER node
CMD ["node", "dist/main"]