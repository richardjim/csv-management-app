# ==========================
# Stage 1: Backend dependencies
# ==========================
FROM node:18-alpine AS backend-deps

WORKDIR /app/backend-api
# Copy only package files to leverage Docker cache
COPY backend-api/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ==========================
# Stage 2: Frontend build
# ==========================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==========================
# Stage 3: Production image
# ==========================
FROM node:18-alpine AS production

# Install system dependencies
RUN apk add --no-cache dumb-init wget

# Create app directory
WORKDIR /app

# Copy backend source code
COPY backend-api/ ./backend-api/

# Copy backend node_modules from stage 1
COPY --from=backend-deps /app/backend-api/node_modules ./backend-api/node_modules

# Copy built frontend from stage 2
COPY --from=frontend-builder /app/frontend/build ./backend-api/public

# Create necessary directories
RUN mkdir -p ./backend-api/uploads ./backend-api/temp

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /app && chmod -R 755 /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-5000}/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the backend server
CMD ["node", "./backend-api/server.js"]