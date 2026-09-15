# =============================================================================
# Macky Merch API - Production Dockerfile
# =============================================================================

FROM node:22-alpine AS base

# Install build dependencies for better-sqlite3 native compilation on alpine
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

# Install application dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration files
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
COPY schema.sql ./

# Seed initial database and expose API port
RUN npm run seed
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

# Start the Macky Merch server
CMD ["npm", "start"]
