FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests — layer-caches npm install separately from source code
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

RUN npm ci

COPY packages ./packages
COPY apps/web ./apps/web

# NEXT_PUBLIC_* vars must be baked into the bundle at build time
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build --workspace=apps/web

# ── Production runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Next.js standalone output in a monorepo places files under apps/web/ within the standalone dir
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
