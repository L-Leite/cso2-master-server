# cso2-master-server

[![Build Status](https://travis-ci.org/L-Leite/cso2-master-server.svg?branch=master)](https://travis-ci.org/L-Leite/cso2-master-server)

A master server for Nexon's Counter-Strike: Online 2 written in Typescript on top of NodeJS.

Used by this [client launcher](https://github.com/L-Leite/cso2-launcher/).

**You can no longer use this by itself**, see [cso2-master-services](https://github.com/L-Leite/cso2-master-services#running-the-services) for more information.

## Starting the master server

*Note: go to [cso2-master-services](https://github.com/L-Leite/cso2-master-services#running-the-services) for download and build scripts.*

***Note: You must have an user service running somewhere.***

You can start the master server with:

```sh
# environment variables
export USERSERVICE_HOST=127.0.0.1 # the user service's host
export USERSERVICE_PORT=30100 # the user service's port

# starts the master server
node dist/server.js
```

You **must** set those environment variables, or the service will not start.

See the [command line arguments](#command-line-arguments) for more options.

### Starting with docker-compose

Go to [cso2-master-services](https://github.com/L-Leite/cso2-master-services) to learn how to start the master server with docker-compose.

### Command line arguments

Options:

- ```-i, --ip-address [ip]``` (*optional*) The IP address to listen on (don't use --interface with this)
- ```-I, --interface [intf]``` (*optional*) The interface to be used by the server (don't use --ip-address with this)
- ```-p, --port-master [port]``` (*optional*) The server's (TCP) port (default: 30001)
- ```-P, --port-holepunch [port]``` (*optional*) The server's holepunch (UDP) port (default: 30002)
- ```-l, --log-packets``` (*optional*) Log the incoming and outgoing packets

If you don't specify an IP address or an interface, the server **will ask you which network interface to listen on**.

## Contributing

Bug reports and pull requests are very much welcome.

See the [current project's progress](https://github.com/L-Leite/cso2-master-services/projects/1) for more information.

## Contributors

- [JusicP](https://github.com/JusicP)
- [dounai2333](https://github.com/dounai2333)

## License

`cso2-masters-server` is licensed under the MIT License.

This project is not affiliated with either Valve Software or Nexon.
