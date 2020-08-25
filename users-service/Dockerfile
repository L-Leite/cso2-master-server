FROM mhart/alpine-node:13

# create dir
WORKDIR /srv/users-service

# copy dependencies and build files
COPY package.json yarn.lock gulpfile.js tsconfig.json .eslintrc.js ./

# get source code
COPY src ./src

# get the patch for postgres library
COPY patches ./patches

# copy default inventory_item type OID
COPY docker/default_inventory_item_oid.ts ./src/config/inventory_item_oid.ts

# install npm dependencies
RUN yarn install --frozen-lockfile 

# build service from source
RUN npx gulp build

# start the service
CMD [ "node", "dist/service.js" ]