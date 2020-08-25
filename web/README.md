# cso2-webapp

[![Build Status](https://travis-ci.org/Ochii/cso2-webapp.svg?branch=master)](https://travis-ci.org/Ochii/cso2-webapp)

A web app to manage users for a Nexon's Counter-Strike: Online 2 master server written in Typescript on top of Node.js.

You can find download and build scripts in [cso2-master-services](https://github.com/Ochii/cso2-master-services#running-the-services).

## Building

After downloading the source code, go to a terminal instance, inside the source code's directory and:

```sh
npm install # installs the required dependencies
gulp build # builds the service
```

## Starting the app

**Note: You must have an user service and an inventory service running somewhere.**

You can start the web app with:

```sh
# environment variables
export USERSERVICE_HOST=127.0.0.1 # the user service's host
export USERSERVICE_PORT=30100 # the user service's port
export INVSERVICE_HOST=127.0.0.1 # the inventory service's host
export INVSERVICE_PORT=30101 # the inventory service's port

# starts the service
node dist/app.js
```

You **must** set those environment variables, or the web app will not start.

If you want to know how to run this with the other services, see [cso2-master-services](https://github.com/Ochii/cso2-master-services).

## Contributing

Bug reports and pull requests are very much welcome.

See the [current project's progress](https://github.com/Ochii/cso2-master-services/projects/1) for more information.

## License

Read ```LICENSE``` for the project's license information.

This project is not affiliated with either Valve or Nexon. Counter-Strike: Online 2 is owned by these companies.
