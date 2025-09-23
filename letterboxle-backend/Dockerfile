FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory.
# We copy these first to take advantage of Docker's layer caching.
# The 'npm install' step will only be re-run if these files change.
COPY package*.json ./

RUN npm install --only=production

# Copy the rest of the application's source code.
COPY . .

EXPOSE 3012

CMD [ "node", "server.js" ]
