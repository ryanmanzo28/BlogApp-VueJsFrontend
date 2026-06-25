# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY VueJS-Frontend/package.json VueJS-Frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY VueJS-Frontend/. .

# Build Vite frontend
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY VueJS-Frontend/package.json VueJS-Frontend/package-lock.json ./
RUN npm ci --only=production

# Copy built frontend from builder
COPY --from=builder /app/dist ./dist

# Copy server and necessary files
COPY VueJS-Frontend/server.js .
COPY VueJS-Frontend/main.js .
COPY VueJS-Frontend/index.vue .
COPY VueJS-Frontend/assets ./assets
COPY VueJS-Frontend/login.html .
COPY VueJS-Frontend/signup.html .
COPY VueJS-Frontend/logout.html .
COPY VueJS-Frontend/write.html .
COPY VueJS-Frontend/article.html .
COPY VueJS-Frontend/profile.html .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/db-health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "server.js"]
