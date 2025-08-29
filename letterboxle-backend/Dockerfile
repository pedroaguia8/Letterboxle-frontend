# Use an official Node.js runtime as a parent image.
# The 'alpine' version is a lightweight Linux distribution, great for production.
FROM node:18-alpine

# Set the working directory inside the container.
# All subsequent commands (COPY, RUN, CMD) will be executed from this path.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
# We copy these first to take advantage of Docker's layer caching.
# The 'npm install' step will only be re-run if these files change.
COPY package*.json ./

# Install application dependencies.
# Using --only=production is a good practice for final images.
RUN npm install --only=production

# Copy the rest of your application's source code.
COPY . .

# Your app binds to a port, so we'll expose it.
# Check your server.js to confirm the port. I'll assume 3000 for this example.
EXPOSE 3012

# Define the command to run your app when the container starts.
CMD [ "node", "server.js" ]
