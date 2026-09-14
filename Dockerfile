# =========================================================================
# Production Multi-Stage Dockerfile for Rental Platform
# Hardened, Minimal Alpine Base with Non-Root Execution
# =========================================================================

# Stage 1: Base Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* ./

# Install dependencies (reproducible clean install)
RUN npm ci --legacy-peer-deps

# -------------------------------------------------------------------------
# Stage 2: Application Builder
# -------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Inherit dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=true

# Build production application bundle
RUN npm run build

# -------------------------------------------------------------------------
# Stage 3: Production Runtime Environment
# -------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

# Install security utilities and dumb-init for clean PID 1 signal handling
RUN apk add --no-cache dumb-init wget ca-certificates tzdata

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user and group for hardened security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts and server files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/n8n ./n8n

# Set secure ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose primary application port
EXPOSE 3000

# Container Healthcheck targeting operational endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Launch production server via dumb-init for clean signal forwarding
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
