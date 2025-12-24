# Stage 1: Build
FROM oven/bun:1 AS build

WORKDIR /app

# Copy root workspace files (monorepo)
COPY package.json ./package.json
COPY bun.lock ./bun.lock

# Copy backend package.json
COPY backend/package.json ./backend/package.json

# Install dependencies (production only for smaller image)
RUN cd backend && bun install --production

# Copy backend source code
COPY backend/src ./backend/src
COPY backend/tsconfig.json ./backend/tsconfig.json

ENV NODE_ENV=production

# Stage 2: Production
# Using bun image for clustering support (requires Bun runtime)
FROM oven/bun:1-slim

WORKDIR /app

# Install openssl for JWT key generation
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy node_modules from build stage
COPY --from=build /app/backend/node_modules ./node_modules

# Copy source code for clustering (cannot compile to binary with cluster mode)
COPY --from=build /app/backend/src ./src
COPY --from=build /app/backend/tsconfig.json ./tsconfig.json

# Copy entrypoint script and convert line endings to Unix format
COPY backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Copy JWT key generation script and convert line endings to Unix format
COPY backend/generate-jwt-keys.sh /app/generate-jwt-keys.sh
RUN sed -i 's/\r$//' /app/generate-jwt-keys.sh && chmod +x /app/generate-jwt-keys.sh

# Create keys directory (will be mounted as volume)
RUN mkdir -p /app/keys

ENV NODE_ENV=production

# Expose port (will be overridden by PORT env variable)
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
