#!/usr/bin/env bash

# install and use the current node version set in the environment variable
nvm install $CURRENT_NODE_VERSION
nvm use $CURRENT_NODE_VERSION

# print tools versions
echo 'NodeJS version:'
node --version

echo 'npm version:'
npm --version

echo 'yarn version:'
yarn --version

echo 'postgresql version:'
psql --version

# install dependencies
yarn install