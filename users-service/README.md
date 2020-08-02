# cso2-users-service

[![Build status](https://ci.appveyor.com/api/projects/status/6slpqpr2igqfnwrh/branch/master?svg=true)](https://ci.appveyor.com/project/L-Leite/cso2-users-service/branch/master)

User service for a Nexon's Counter-Strike: Online 2 master server written in Typescript on top of Node.js.

You can find download and build scripts in [cso2-master-services](https://github.com/L-Leite/cso2-master-services#running-the-services).

## Building

After downloading the source code, go to a terminal instance, inside the source code's directory and:

```sh
npm install # installs the required dependencies
gulp build # builds the service
```

## Starting the service

You can start the user service with:

```sh
# environment variables
export USERS_PORT=30100 # tells the service to host on port 30100
export DB_HOST=127.0.0.1 # the host's database to connect
export DB_PORT=27017 # the host's database port to connect
export DB_NAME=cso2 # the database's name

# starts the service
node dist/service.js
```

You **must** set those environment variables, or the service will not start.

## Testing the service

You can test the service by running:

```sh
# environment variables
export USERS_PORT=30100 # tells the service to host on port 30100
export DB_HOST=127.0.0.1 # the host's database to connect
export DB_PORT=27017 # the host's database port to connect
export DB_NAME=cso2 # the database's name

# tests the service
gulp test
```

## License

cso2-users-service is licensed under MIT License.

This project is not affiliated with either Valve or Nexon.
