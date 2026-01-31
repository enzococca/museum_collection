FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE $PORT

# Serve static files
CMD serve dist -s -l $PORT
