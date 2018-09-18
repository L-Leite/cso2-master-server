# cso2-master-server

[![Build Status](https://travis-ci.org/Ochii/cso2-master-server.svg?branch=master)](https://travis-ci.org/Ochii/cso2-master-server)

An incomplete master server for Nexon's (South Korea) Counter-Strike: Online 2.

You can find its client [here](https://github.com/Ochii/cso2-launcher/).

## How to use

### Requirements

- [Node.js](https://nodejs.org/);
- A copy of the project transpiled to Javascript, you may [get one here](https://github.com/Ochii/cso2-master-server/releases/latest) or [build it yourself](#how-to-build)

### Starting the server

In the project's directory, run the ```npm run start``` command to start the server.

It will listen to ports 30001 TCP and 30002 UDP by default.

## How to build

### Build requirements

- [Node.js](https://nodejs.org/)
- A clone of the project - ```git clone https://github.com/Ochii/cso2-master-server.git```

### Building

- In the project directory, run ```npm install``` to obtain the required project dependencies;

- Once that's done, you can run ```npm run build``` whenever you wish to build the project.

- After building the project, you may start the server with ```npm run start```.

### List of available NPM commands

- ```npm run start``` - Runs ```dist/server.js``` (the project must be built first)
- ```npm run build``` - Lints and builds the project
- ```npm run debug``` - Builds the project, then, debugs it
- ```npm run watch``` - Monitors ```dist/server.js```
- ```npm run watch-debug``` - Monitors and debugs ```dist/server.js```
- ```npm run build-ts``` - Only builds the project
- ```npm run watch-ts``` - Monitors the project
- ```npm run tslint``` - Lints the project

## Bug reporting and improvements

Have a look at the [issues](https://github.com/Ochii/cso2-master-server/issues) for a list of issues in the project found or to report them yourself.

If you wish or have any improvements that you would like to share, feel free to [open a pull request](https://github.com/Ochii/cso2-master-server/pulls).

## License

Read ```LICENSE``` for license information.

I'm not affiliated with either Valve or Nexon, just like I don't own Counter-Strike Online 2.
