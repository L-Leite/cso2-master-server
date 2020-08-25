FROM mhart/alpine-node:13

WORKDIR /srv/website
COPY package.json yarn.lock gulpfile.js tsconfig.json .eslintrc.js ./

# get source code
COPY src ./src

# copy prebuilt files
COPY assets ./assets

# install dependencies
RUN yarn install --frozen-lockfile

# build app from source
RUN npx gulp build

# start the service
CMD [ "node", "dist/app.js" ]