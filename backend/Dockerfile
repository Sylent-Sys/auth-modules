# Stage 1: Build
FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages installation
COPY package.json package.json
COPY bun.lock bun.lock

RUN bun install

# Copy source code
COPY ./src ./src
COPY tsconfig.json tsconfig.json

ENV NODE_ENV=production

# Compile to binary using Elysia recommended approach
# Using --external for mysql2 to ensure it's imported from node_modules at runtime
RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun-linux-x64 \
	--external mysql2 \
	--outfile server \
	src/index.ts

# Stage 2: Production
# Using bun image instead of distroless to support migration scripts
FROM oven/bun:1-slim

WORKDIR /app

# Copy compiled binary from build stage
COPY --from=build /app/server server

# Copy node_modules for external dependencies (mysql2)
COPY --from=build /app/node_modules ./node_modules

# Copy migration files and script for runtime migration
COPY --from=build /app/src/migrations ./src/migrations
COPY --from=build /app/src/lib/db.ts ./src/lib/db.ts

# Copy entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENV NODE_ENV=production

# Expose port (will be overridden by PORT env variable)
EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
