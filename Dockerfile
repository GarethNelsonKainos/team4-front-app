# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source code
COPY src ./src
COPY public ./public
COPY views ./views
COPY tailwind.config.js ./

# Build CSS only
RUN npm run build-css-prod

# Production stage
FROM node:20-alpine

# Install dumb-init, create user, and setup in one layer
RUN apk add --no-cache dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies and tsx, remove unnecessary files
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev && \
    npm install -g tsx && \
    rm -f /app/package-lock.json && \
    find /app/node_modules -name "*.md" -delete && \
    find /app/node_modules -name "*.markdown" -delete && \
    find /app/node_modules -name "*.map" -delete && \
    find /app/node_modules -name "CHANGELOG*" -delete && \
    find /app/node_modules -name "HISTORY*" -delete && \
    find /app/node_modules -name "LICENSE*" -delete && \
    find /app/node_modules -name ".editorconfig" -delete && \
    find /app/node_modules -name ".eslintrc*" -delete && \
    find /app/node_modules -name ".prettierrc*" -delete && \
    find /app/node_modules -name "*.ts" -not -name "*.d.ts" -delete && \
    find /app/node_modules -type d \( -name "test" -o -name "tests" -o -name "__tests__" -o -name "example" -o -name "examples" -o -name "benchmark" -o -name "benchmarks" -o -name "docs" -o -name ".git" -o -name ".github" -o -name ".vscode" \) -exec rm -rf {} + 2>/dev/null || true

# Copy application from builder
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/views ./views
COPY --chown=nodejs:nodejs tsconfig.json ./

# Switch to non-root user
USER nodejs

# Expose default port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["tsx", "src/index.ts"]
