# =============================================
# Frontend Dockerfile - Agency CRM
# Multi-stage build: Build React, then serve with Nginx
# =============================================

# ── Stage 1: Build the React app ────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDeps needed for build)
RUN npm install

# Copy source code
COPY . .

# Build the production bundle
RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────
FROM nginx:stable-alpine

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built React files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
