# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache curl git

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN echo "Building SvelteKit application..." && \
    echo "VITE_API_BASE_URL=/api/v1" > .env.local && \
    echo "PUBLIC_WS_URL=/ws" >> .env.local && \
    npm run build && \
    echo "Build completed, checking output..." && \
    ls -la build/ && \
    test -f build/index.js || (echo "❌ Build failed: index.js not found in build/" && ls -la build/ && exit 1) && \
    echo "✅ Dashboard build successful"

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S svelte -u 1001 -G nodejs

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Change ownership of the app directory
RUN chown -R svelte:nodejs /app

# Switch to non-root user
USER svelte

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000/health || curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "build/index.js"]