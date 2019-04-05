FROM node:11

# create dir
WORKDIR /srv/master-service

# get dependencies
COPY package*.json ./

# get source code
COPY src ./src

# get build files
COPY ts*.json ./

# install npm dependencies
RUN npm ci
RUN npm i -g typescript

RUN npm run build-ts

# Bundle app source
COPY . .

CMD [ "node", "dist/server.js", "--interface", "eth0" ]