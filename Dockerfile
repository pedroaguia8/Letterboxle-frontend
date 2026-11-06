# Stage 1: Build the React/Vite application
FROM node:26.13.0-alpine3.24@sha256:8996bb5821d62a8fd9bb27c1cb07462f3fdce6e47d640c6a881ead0b064ce216 AS build

# Set the working directory for the build stage
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install exactly what package-lock.json pins (fails if it's out of sync with package.json)
RUN npm ci

# Copy the rest of the frontend source code and build the application
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx (unprivileged image: runs as non-root, so it listens on 8080)
FROM docker.io/nginxinc/nginx-unprivileged:1.31.7-alpine3.24@sha256:b5047b9b76845eac124358373c6852377c52e4b05834a47647e955dd91cb8f1e
# Copy the built assets from the "build" stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy the custom Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 8080 and start Nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
