FROM mhart/alpine-node:13

# create dir
WORKDIR /srv/users-service

# copy dependencies and build files
COPY package.json yarn.lock gulpfile.js tsconfig.json tslint.json ./

# get source code
COPY src ./src

# install npm dependencies
RUN yarn install --frozen-lockfile 

# build service from source
RUN npx gulp build

# start the service
CMD [ "node", "dist/service.js" ]