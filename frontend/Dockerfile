# Stage 1: Build
FROM oven/bun:1 AS build

WORKDIR /app

# Copy root workspace files (monorepo)
COPY package.json ./package.json
COPY bun.lock ./bun.lock

# Copy frontend package.json
COPY frontend/package.json ./frontend/package.json

# Install dependencies
RUN cd frontend && bun install

# Copy frontend source code and config files
COPY frontend/src ./frontend/src
COPY frontend/index.html ./frontend/index.html
COPY frontend/tsconfig.json ./frontend/tsconfig.json
COPY frontend/tsconfig.app.json ./frontend/tsconfig.app.json
COPY frontend/tsconfig.node.json ./frontend/tsconfig.node.json
COPY frontend/vite.config.ts ./frontend/vite.config.ts
COPY frontend/eslint.config.js ./frontend/eslint.config.js

# Copy backend for type imports (eden treaty)
COPY backend/package.json ./backend/package.json
COPY backend/src ./backend/src

ENV NODE_ENV=production

# Build the frontend
RUN cd frontend && bun run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
