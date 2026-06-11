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
FROM nginx:alpine AS production

# Copy custom nginx config template (rendered by /docker-entrypoint.d/20-envsubst-on-templates.sh)
COPY docker/frontend.nginx.conf /etc/nginx/templates/default.conf.template

# Copy built files
COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
