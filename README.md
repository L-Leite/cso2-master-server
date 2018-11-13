# cso2-master-server

[![Build Status](https://travis-ci.org/Ochii/cso2-master-server.svg?branch=master)](https://travis-ci.org/Ochii/cso2-master-server)

An incomplete master server for Nexon's (South Korea) Counter-Strike: Online 2.

You can find its client [here](https://github.com/Ochii/cso2-launcher/).

At the moment you can create, join and start room matches in custom mode.

## How to use

### Requirements

- [Node.js](https://nodejs.org/);
- A copy of the project transpiled to Javascript, you may [get one here](https://github.com/Ochii/cso2-master-server/releases/latest) or [build it yourself](#how-to-build)

### Obtaining the dependencies

In the project's directory, run the ```npm install --only=production``` command to obtain the server's dependencies.

### Starting the server

As an example, in your project's directory, you can run the server with ```npm run start -- --ip-address [some IP address]``` command to start the server.

**You must *not* use internal IPs** (such as 0.0.0.0 or 127.0.0.1) as the machine's IP address, **or users won't be able to join each other matches!**

See the [command line arguments section](#command-line-arguments) for more options.

## How to build

### Build requirements

- [Node.js](https://nodejs.org/)
- A clone of the project - ```git clone https://github.com/Ochii/cso2-master-server.git```

### Building

- In the project directory, run ```npm install``` to obtain the required project dependencies;

- Once that's done, you can run ```npm run build``` whenever you wish to build the project.

- After building the project, you may start the server with ```npm run start```.

### List of available NPM commands

- ```npm run start -- [server arguments]``` - Runs ```dist/server.js``` (check the available arguments [below](#command-line-arguments))
- ```npm run build``` - Lints and builds the project
- ```npm run build-ts``` - Only builds the project
- ```npm run watch-ts``` - Monitors the project
- ```npm run tslint``` - Lints the project

### Command line arguments

Options:

- ```-i, --ip-address <ip>```        The IP address to be used by the server (must not be an internal IP)
- ```-p, --port-master [port]```    (*optional*) The server's (TCP) port (default: 30001)
- ```-P, --port-holepunch [port]```  (*optional*) The server's holepunch (UDP) port (default: 30002)

## Bug reporting and improvements

Have a look at the [issues](https://github.com/Ochii/cso2-master-server/issues) for a list of issues in the project found or to report them yourself.

If you wish or have any improvements that you would like to share, feel free to [open a pull request](https://github.com/Ochii/cso2-master-server/pulls).

## License

Read ```LICENSE``` for license information.

I'm not affiliated with either Valve or Nexon, just like I don't own Counter-Strike Online 2.
