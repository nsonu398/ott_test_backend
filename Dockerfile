FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Make the videos directory
RUN mkdir -p videos

# Expose the port your app runs on
EXPOSE 3000

CMD [ "node", "server.js" ]