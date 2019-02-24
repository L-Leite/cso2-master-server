# cso2-master-server

[![Build Status](https://travis-ci.org/Ochii/cso2-master-server.svg?branch=master)](https://travis-ci.org/Ochii/cso2-master-server)

A master server for Nexon's Counter-Strike: Online 2 written in Typescript on top of NodeJS.

Used by this [client launcher](https://github.com/Ochii/cso2-launcher/).

If you **wish to help** then please read the [contributing guide](https://github.com/Ochii/cso2-master-server/blob/master/.github/PULL_REQUEST_TEMPLATE.md) to know how.

## Running

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

### Command line arguments

Options:

- ```-i, --ip-address [ip]``` (*optional*) The IP address to listen on (default: auto-detect)
- ```-p, --port-master [port]``` (*optional*) The server's (TCP) port (default: 30001)
- ```-P, --port-holepunch [port]``` (*optional*) The server's holepunch (UDP) port (default: 30002)
- ```-l, --log-packets``` (*optional*) Log the incoming and outgoing packets

## Contributors

- [JusicP](https://github.com/JusicP)

## License

Read ```LICENSE``` for the project's license information.

I'm not affiliated with either Valve or Nexon, just like I don't own Counter-Strike Online 2.
