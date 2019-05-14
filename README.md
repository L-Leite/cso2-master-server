# cso2-master-server

[![Build Status](https://travis-ci.org/Ochii/cso2-master-server.svg?branch=master)](https://travis-ci.org/Ochii/cso2-master-server)

A master server for Nexon's Counter-Strike: Online 2 written in Typescript on top of NodeJS.

Used by this [client launcher](https://github.com/Ochii/cso2-launcher/).

**You can no longer use this by itself**, see [cso2-master-services](https://github.com/Ochii/cso2-master-services#running-the-services) for more information.

## Running

*Note: go to [cso2-master-services](https://github.com/Ochii/cso2-master-services#running-the-services) for download and build scripts.*

To run the server, you need:

- [Node.js](https://nodejs.org/) (version 10 or better);
- A server build. You can download [prebuilt files here](https://github.com/Ochii/cso2-master-server/releases/latest) or you can [build it yourself](#building).

Then, in a terminal instance inside the server's directory, do:

```sh
npm install --only=production # installs the required dependencies (minimal dependencies)
npm run start # starts the prebuilt server
```

By the default, the server **will ask you which network interface to listen on**.

See the [command line arguments](#command-line-arguments) for more options.

## Building

After downloading the source code, go to a terminal instance, inside the source code's directory and:

```sh
npm install # installs the required dependencies
npm run build # builds the server
npm run start # starts the fresh server build
```

## Starting the master server

### With docker-compose

Go to [cso2-master-services](https://github.com/Ochii/cso2-master-services) to learn how to start the master server with docker-compose.

### By itself

**Note: You must have an user service and an inventory service running somewhere.**

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

## Contributing

Bug reports and pull requests are very much welcome.

See the [current project's progress](https://github.com/Ochii/cso2-master-services/projects/1) for more information.

## Contributors

- [JusicP](https://github.com/JusicP)
- [dounai2333](https://github.com/dounai2333)

## License

Read ```LICENSE``` for the project's license information.

I'm not affiliated with either Valve or Nexon, just like I don't own Counter-Strike Online 2.
