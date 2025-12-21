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

# Compile to binary using Elysia recommended approach
# Using --external for mysql2 and its dependencies to ensure they're imported from node_modules at runtime
RUN cd backend && bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun-linux-x64 \
	--external mysql2 \
	--external lru-cache \
	--external denque \
	--external iconv-lite \
	--external long \
	--external named-placeholders \
	--external seq-queue \
	--external sqlstring \
	--outfile server \
	src/index.ts

# Stage 2: Production
# Using bun image instead of distroless to support migration scripts
FROM oven/bun:1-slim

WORKDIR /app

# Copy compiled binary from build stage
COPY --from=build /app/backend/server server

# Copy entire node_modules to ensure all transitive dependencies (like lru.min) are available
COPY --from=build /app/backend/node_modules ./node_modules

# Copy migration files and script for runtime migration
COPY --from=build /app/backend/src/migrations ./src/migrations
COPY --from=build /app/backend/src/lib/db.ts ./src/lib/db.ts

# Copy entrypoint script and convert line endings to Unix format
COPY backend/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production

# Expose port (will be overridden by PORT env variable)
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
