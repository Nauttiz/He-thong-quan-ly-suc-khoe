# ============================================================
# Multi-stage Dockerfile — BMI Tracker
# Stage 1 (builder): Node 18 Alpine — installs deps & builds
# Stage 2 (runner):  Nginx Alpine   — serves the static build
# ============================================================

# ---- Stage 1: Build ----------------------------------------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency manifests first to leverage layer caching
COPY package.json package-lock.json ./

# Install dependencies (legacy-peer-deps required for react 18/19 type mismatch)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Firebase config is injected at build time via build args → REACT_APP_ env vars
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID

ENV REACT_APP_FIREBASE_API_KEY=$REACT_APP_FIREBASE_API_KEY
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=$REACT_APP_FIREBASE_AUTH_DOMAIN
ENV REACT_APP_FIREBASE_PROJECT_ID=$REACT_APP_FIREBASE_PROJECT_ID
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=$REACT_APP_FIREBASE_STORAGE_BUCKET
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ENV REACT_APP_FIREBASE_APP_ID=$REACT_APP_FIREBASE_APP_ID

# Run production build (output → /app/build)
RUN npm run build

# ---- Stage 2: Serve ----------------------------------------
FROM nginx:1.25-alpine AS runner

# Remove default nginx config and copy custom SPA config
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
