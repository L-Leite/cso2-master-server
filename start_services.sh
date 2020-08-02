#!/bin/sh

#
# this script starts the cso2 master server services
# to stop the services press CTRL+C
# you can customize the variables below
#

set -e

# customizable variables start

# defines the environment where the services are running
# can be 'development' or 'production'
export NODE_ENV=development

# mongodb database connection information
export DB_HOST=127.0.0.1
export DB_PORT=27017
export DB_NAME=cso2

# the ports which the services will listen to
export USERS_PORT=30100
export INVENTORY_PORT=30101
export WEBAPP_PORT=8080

# information used by the master server
# tells it where the user and inventory services are
export USERSERVICE_HOST=127.0.0.1
export USERSERVICE_PORT=$USERS_PORT
export INVSERVICE_HOST=127.0.0.1
export INVSERVICE_PORT=$INVENTORY_PORT

# customizable variables end

trap "exit" INT TERM ERR
trap "kill 0" EXIT

cd ./users-service
node dist/service.js &
cd ../

#cd ./master-server
#node dist/server.js &
#cd ../

cd ./webapp
node dist/app.js &
cd ../

wait
