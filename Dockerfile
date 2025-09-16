# Multi-stage build for optimized production image

# Stage 1: Build backend dependencies
FROM node:18-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    wget \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy backend source code
COPY backend/ ./backend/

# Copy production node_modules from builder stage
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/build ./backend/public

# Create necessary directories
RUN mkdir -p ./backend/uploads ./backend/temp

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set ownership of app directory
RUN chown -R nodejs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "./backend/server.js"]