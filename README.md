# cso2-master-services

This repository includes all the services required to run a master server for Nexon's Counter-Strike: Online 2.

**The master server is currently in development and is missing many features.**
You can keep track of the project's progress [here](https://github.com/Ochii/cso2-master-services/projects/1).

You can get [this client launcher](https://github.com/Ochii/cso2-launcher/) to play in the server.

## Communities

You can find other players in these.

If your community isn't listed here feel free to open pull request with it.

*Note: These communities are not run by the repository owner.*

- [Counter Strike Online Wiki's discord](https://discord.gg/GKPgrBG) (discuss at #cso2-project-discussion)
- [CSO2 Revive](https://discord.gg/3tydYTC) (in Korean)
- [Counter-Strike Online 2 - EU/RU Server](https://discord.gg/yue5Zaf) (in English)
- [反恐精英Online2(CSOL2)](https://jq.qq.com/?k=5PMEa6y) (in China, you will need [QQ](https://www.imqq.com/English1033.html) if you are not Chinese)

## Running the services

You must have the following installed and in your path:
- Node.js
- MongoDB
- cURL
- git
- tar

### Setting up

*Note: If you want to use `docker-compose`, see [Running the services with `docker-compose`](#Running-the-services-with-docker-compose)*.

The Powershell scripts must be run in Powershell version 4 or better.

To download the services, go to the master-services directory in a shell, and:

(In a *nix environment:)

```sh
git submodule update --init # needed to get the services' versions
./setup_services.sh # downloads the required services
```

(In a Windows environment:)

```powershell
git submodule update --init # needed to get the services' versions
.\setup_services.ps1 # downloads the required services
```

If you want to build them yourself instead, do:

(In a *nix environment:)

```sh
git submodule update --init # fetches the services source code
./setup_services.sh --build-services # builds the required services
```

(In a Windows environment:)

```powershell
git submodule update --init # fetches the services source code
.\setup_services.ps1 -BuildServices # builds the required services
```

### Starting the services

To start the services, do:

(In a *nix environment:)

```sh
./start_services.sh # starts the services
```

(In a Windows environment:)
```powershell
.\start_services.ps1 # starts the services
```

In *nix systems, you can stop the services by pressing CTRL+C in the shell.

## Running the services with ```docker-compose```

You must have installed both [```docker```](https://docs.docker.com/) and [```docker-compose```](https://docs.docker.com/compose/) in order to run the services all at once.

### Setting up with ```docker-compose```

The repository has two ```docker-compose``` configuration files, `docker-compose.development.yml` and `docker-compose.production.yml`.

`docker-compose.development.yml` can be used for development environments, where `docker-compose.production.yml` can be used for development production environments (such as a remote server).

Rename the configuration file you prefer to `docker-compose.yml` so you can use it with ```docker-compose```.

### Starting the services with ```docker-compose```

If this is your first time running the services, use ```docker-compose up -d``` to start them. If not you can use ```docker-compose start -d```.

To stop the services, use ```docker-compose down```.

## Services bundled

The following services bundled in this repository:

- [cso2-master-server](https://github.com/Ochii/cso2-master-server)
- [cso2-users-service](https://github.com/Ochii/cso2-users-service)
- [cso2-inventory-service](https://github.com/Ochii/cso2-inventory-service)
- [cso2-webapp](https://github.com/Ochii/cso2-webapp)

## Pull requests

Pull requests are very much welcome.

Before you create one, be sure you're in the right repository.

See [Services bundled](##Services-bundled) for a list of the services bundled here.

## License

Read `LICENSE` for the project's license information.

This project is not affiliated with either Valve or Nexon. Counter-Strike: Online 2 is owned by these companies.
