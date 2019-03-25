FROM node:11

# create dir
WORKDIR /srv/master-service

# get dependencies
COPY package*.json ./

RUN npm ci
RUN npm i -g typescript

# Bundle app source
COPY . .

EXPOSE 42069
CMD [ "bash", "-c", "\"npm run build-ts && npm run start -- --ip-address $SERVER_IP_ADDRESS\""" ]