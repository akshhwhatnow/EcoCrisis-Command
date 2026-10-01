# EcoCrisis Command - Dockerfile for Production / Containerized Deployment
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for native modules or build
RUN apk add --no-cache curl postgresql-client

# Install npm packages
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Expose ports: 3001 (Backend API), 5173 (Frontend Vite/Preview)
EXPOSE 3001 5173

# Default startup command starts the backend server
CMD ["npm", "run", "server"]
