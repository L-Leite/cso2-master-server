# cso2-master-server
An incomplete master server for Nexon's (South Korea) Counter-Strike: Online 2.

You can find its client [here](https://github.com/Ochii/cso2-launcher/tree/server_emulator).

## How to build

### Requirements
- [NodeJS](https://nodejs.org/)
- NPM

### Downloading
Clone the project with ```git clone https://github.com/Ochii/cso2-master-server.git```.

### Building
In the project directory, run ```npm install``` to obtain the required project dependencies.

When it's over, run ```npm build``` to build the project.

### Running
After building the project, run the server with ```npm run start```.

## Available scripts
- ```npm run start``` - Runs ```dist/server.js``` (the project must be built first)
- ```npm run build``` - Lints and builds the project
- ```npm run debug``` - Builds the project, then, debugs it
- ```npm run watch``` - Monitors ```dist/server.js``` 
- ```npm run watch-debug``` - Monitors and debugs ```dist/server.js``` 
- ```npm run build-ts``` - Only builds the project
- ```npm run watch-ts``` - Monitors the project
- ```npm run tslint``` - Lints the project

## Bug reporting and improvements
Have a look at the [issues](https://github.com/Ochii/cso2-master-server/issues) for a list of bugs found or to report them yourself.

If you wish or have any improvements that you would like to share, feel free to [open a pull request](https://github.com/Ochii/cso2-master-server/pulls).

## License
Read ```LICENSE``` for license information.

I'm not affiliated with neither Valve or Nexon, just like I don't own Counter-Strike Online 2.
