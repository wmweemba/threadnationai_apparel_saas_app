FROM node:20-alpine AS builder
WORKDIR /app

# Build tools for sharp native compilation (fallback if prebuilt unavailable for this platform)
RUN apk add --no-cache python3 make g++ vips-dev

# Copy workspace manifests first — layer-caches npm install separately from source code
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install all deps with full workspace context
RUN npm ci

# Copy source files
COPY packages ./packages
COPY apps/api ./apps/api

# Compile TypeScript → dist/
RUN npm run build --workspace=apps/api

# ── Production runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# vips runtime library (not -dev headers) for sharp
RUN apk add --no-cache vips

# Copy workspace manifests for production install
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install production deps only (workspace-aware, uses root lockfile)
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
