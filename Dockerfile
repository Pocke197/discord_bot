# ---------- Etapa 1: base común ----------
FROM node:24-slim AS base
RUN corepack enable
WORKDIR /app

# ---------- Etapa 2: compilar ----------
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---------- Etapa 3: imagen final ----------
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]