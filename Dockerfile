# Dockerfile for Vite.js Project using pnpm

# ---- Build Stage ----
# Use an official Node.js runtime as a parent image (choose a specific LTS version)
# Alpine images are smaller
FROM node:lts-alpine AS build

# Install pnpm globally
RUN npm install -g pnpm@latest

# Set the working directory in the container
WORKDIR /app

# Copy package.json and the pnpm lockfile
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install project dependencies using pnpm
# Use --frozen-lockfile for CI/CD environments to ensure exact dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Vite project for production using pnpm
# This command might differ based on your package.json scripts
RUN pnpm run build

# ---- Production Stage ----
# Use a lightweight Nginx image to serve the static files
FROM nginx:stable-alpine AS production

# Set the working directory for Nginx
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy the built assets from the 'build' stage
COPY --from=build /app/dist .

# (Optional) Copy a custom Nginx configuration file if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx and serve the application
# The default Nginx command runs in the foreground, which is suitable for Docker
CMD ["nginx", "-g", "daemon off;"]
