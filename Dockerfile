# ============ Stage 1: Builder ============
# Install all dependencies and build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build tools)
RUN npm ci

# Copy application source code
COPY . .

# Build CSS for production (Tailwind minified output)
RUN npm run build-css-prod

# Compile TypeScript to JavaScript
RUN npm run build

# ============ Stage 2: Development ============
# Full development image with all dependencies and hot reload capability
FROM node:18-alpine AS development

WORKDIR /app

# Copy pre-built node_modules from builder (huge size savings!)
COPY --from=builder /app/node_modules ./node_modules

# Copy only package files for reference
COPY package*.json ./

# Expose the port
EXPOSE 3000

# Run as non-root user for security
USER node

# Set NODE_ENV to development
ENV NODE_ENV=development

# Run TypeScript directly with tsx for development
# Source code comes from docker-compose volume mount
CMD ["npx", "tsx", "src/index.ts"]

# ============ Stage 3: Production ============
# Minimal runtime image with only production dependencies
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files from builder
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Copy built CSS from builder stage
COPY --from=builder /app/public ./public

# Copy views for Nunjucks templating
COPY --from=builder /app/views ./views

# Run as non-root user for security
USER node

# Expose the port your app runs on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Run the compiled JavaScript directly with Node (no tsx needed)
CMD ["node", "dist/index.js"]