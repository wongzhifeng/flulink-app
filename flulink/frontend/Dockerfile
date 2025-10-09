# Multi-stage build for FluLink Frontend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY flulink/frontend/package*.json ./
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY flulink/frontend/ .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY flulink/frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
