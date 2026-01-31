FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arg for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve@14

# Copy built files
COPY --from=builder /app/dist ./dist

# Default port
ENV PORT=8080

# Serve static files
CMD ["sh", "-c", "serve dist -s -l ${PORT}"]
