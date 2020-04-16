
FROM mhart/alpine-node:13

# create dir
WORKDIR /srv/master-service

# copy dependencies and build files
COPY package.json yarn.lock gulpfile.js tsconfig.json tslint.json ./

# get source code
COPY src ./src

# install dependencies
RUN yarn install --frozen-lockfile 

# build service from source
RUN npx gulp build

CMD [ "node", "dist/server.js", "--interface", "eth0" ]
