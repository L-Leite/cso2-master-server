# cso2-master-server

This repository includes all the services required to run a game server for Counter-Strike: Online 2.

You can get [this client launcher](https://github.com/L-Leite/cso2-launcher) to play in the server.

A [test game server](https://cso2.leite.xyz) is available at the IP address `51.68.197.15` .

## Discuss

Join the [CSO2 Server Development Matrix room](https://matrix.to/#/#cso2:matrix.leite.xyz) for game server development discussion.

### Community run discussions

-   [Counter Strike Online Wiki's discord](https://discord.gg/GKPgrBG) (discuss at #cso2-project-discussion, in English)
-   [CSO2 Revive](https://discord.gg/3tydYTC) (in Korean)
-   [Counter-Strike Online 2 - EU/RU Server](https://discord.gg/yue5Zaf) (in English)
-   [反恐精英 Online2(CSOL2)](https://jq.qq.com/?k=5PMEa6y) (in Chinese, requires [QQ](https://www.imqq.com/English1033.html))

## Running the game server

### With Docker and `docker-compose`

You must have installed both [`docker`](https://docs.docker.com/) and [`docker-compose`](https://docs.docker.com/compose/) for these steps.

The repository has two `docker-compose` configuration files:

-   `docker-compose.development.yml` can be used for development environments
-   `docker-compose.production.yml` can be used for development production environments (such as a remote server).

#### Example start command

```sh
docker-compose -f docker-compose.development.yml up -d --build
```

#### Example stop command

```sh
docker-compose -f docker-compose.development.yml down
```

### With Gulp

These steps require [Node.js](https://nodejs.org/en/download/) and [PostgreSQL](https://www.postgresql.org/download/) to be installed in your system.

#### Setting up

In a shell, run

```sh
./config/init_db.sh # initializes the database user and tables
yarn # installs gulp and other build dependencies
npx gulp build # builds the game server components
```

#### Starting the server

In a shell, run

```sh
npx gulp start
```

You can stop the server by pressing CTRL+C in the terminal.

## License

Licensed under the MIT license, see `COPYING` for more information.

This project is not affiliated with either Valve or Nexon. Counter-Strike: Online 2 is owned by these companies.
