#!/usr/bin/env bash

# setup service environment variables
export NODE_ENV=production
export USERS_PORT=30100
export DB_HOST=127.0.0.1
export DB_PORT=27017
export DB_NAME=cso2

# run service's tests
npx mocha -u tdd --timeout 999999 --colors --require ts-node/register ./test/**/*.ts