# Stage 1: Build the React/Vite application
FROM node:22-alpine AS build

# Set the working directory for the build stage
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source code and build the application
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
# Copy the built assets from the "build" stage
COPY --from=build /app/dist /usr/share/nginx/html
# Copy the custom Nginx configuration to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

