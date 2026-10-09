# Stage 1: Build the React/Vite application
FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS build

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
FROM docker.io/nginxinc/nginx-unprivileged:1.31.6-alpine3.24@sha256:b9241c6e7b8e9a862f129d8d4199ab64b10390949a78bdd5603379b32c844083
# Copy the built assets from the "build" stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy the custom Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 8080 and start Nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
