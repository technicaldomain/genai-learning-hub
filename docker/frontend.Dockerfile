# Stage 1: Build
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Copy all app and lib directories
COPY apps/ ./apps/
COPY libs/ ./libs/

# Install dependencies
RUN pnpm install --ignore-scripts

# Build the frontend
RUN npx nx build frontend

# Stage 2: Serve with Nginx
FROM nginxinc/nginx-unprivileged:alpine AS production

# Use a full nginx.conf tuned for non-root runtime.
COPY docker/frontend.nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder --chown=nginx:nginx /app/dist/apps/frontend /usr/share/nginx/html

EXPOSE 8080

USER nginx

CMD ["nginx", "-g", "daemon off;"]
