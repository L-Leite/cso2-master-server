FROM mhart/alpine-node:13

WORKDIR /srv/webapp
COPY package.json yarn.lock gulpfile.js tsconfig.json tslint.json ./

# get source code
COPY src ./src

# copy static files
COPY public ./public

# install dependencies
RUN yarn install --frozen-lockfile

# build app from source
RUN npx gulp build

# start the service
CMD [ "node", "dist/app.js" ]