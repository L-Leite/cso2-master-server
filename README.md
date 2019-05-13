# cso2-master-server

[![Build Status](https://travis-ci.org/Ochii/cso2-master-server.svg?branch=master)](https://travis-ci.org/Ochii/cso2-master-server)

A master server for Nexon's Counter-Strike: Online 2 written in Typescript on top of NodeJS.

Used by this [client launcher](https://github.com/Ochii/cso2-launcher/).

**You can no longer use this by itself**, see [cso2-master-services](https://github.com/Ochii/cso2-master-services) for more information.

## Starting the master server

### With docker-compose

Go to [cso2-master-services](https://github.com/Ochii/cso2-master-services) to learn how to start the master server with docker-compose.

### By itself

**You must have an user service and an inventory service running somewhere.**

You can start the master server with:

```sh
# environment variables
export USERSERVICE_HOST=127.0.0.1 # the user service's host
export USERSERVICE_PORT=30100 # the user service's port
export INVSERVICE_HOST=127.0.0.1 # the inventory service's host
export INVSERVICE_PORT=30101 # the inventory service's port

# starts the master server
node dist/server.js
```

You **must** set those environment variables, or the service will not start.

### Command line arguments

**These are deprecated, and will be removed soon.**

Options:

- ```-i, --ip-address [ip]``` (*optional*) The IP address to listen on (default: auto-detect)
- ```-p, --port-master [port]``` (*optional*) The server's (TCP) port (default: 30001)
- ```-P, --port-holepunch [port]``` (*optional*) The server's holepunch (UDP) port (default: 30002)
- ```-l, --log-packets``` (*optional*) Log the incoming and outgoing packets

## Pull requests

Pull requests are very much welcome.

Please read the [contributing guide](https://github.com/Ochii/cso2-master-service/blob/master/.github/PULL_REQUEST_TEMPLATE.md) before contributing.

## Contributors

- [JusicP](https://github.com/JusicP)
- [dounai2333](https://github.com/dounai2333)

## License

Read ```LICENSE``` for the project's license information.

Counter-Strike: Online 2 is owned by Valve and Nexon. Neither of these companies are involved with this project.
