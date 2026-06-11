# Stage 1: Build
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json ./

# Copy all app and lib directories
COPY apps/ ./apps/
COPY libs/ ./libs/

# Install dependencies
RUN pnpm install --ignore-scripts

# Build the frontend
RUN pnpm --filter @genai-learning-hub/frontend build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY docker/frontend.nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist/apps/frontend /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
