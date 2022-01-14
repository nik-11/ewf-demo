# EWF Demo

This project is built using [Turborepo](https://turborepo.org/docs), a monorepo build system.

## What's in this repo?

This repo uses [NPM](https://www.npmjs.com/) as the package manager. The following packages/apps are included:

### Apps and Packages

- `ewf-server`: a [Nest.js](https://docs.nestjs.com/) web server that subscribes to NATS server events, and responds accordingly by emitting events on the NATS server client.
- `nats-server`: a [Docker](https://docs.docker.com/get-started/overview/) container that runs a NATS server locally.
- `ewf-app`: a [Next.js](https://nextjs.org) React app that allows users to connect to a chat client and send messages through "threads". It connects directly to `nats-server` over the `websocket` protocol.
- `interfaces`: a shared interface library used between `ewf-server` and `ewf-app`.
- `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`).
- `tsconfig`: `tsconfig.json`s used throughout the monorepo.

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Required Command-line Tools

This project was developed on Ubuntu 20.04.3 LTS using [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install).

The following dependencies are required to build and run this project. Note: other versions have not been tested - using different versions may result in unexpected issues.

```bash
node -v
v17.2.0

npm -v
8.1.4

docker -v
Docker version 20.10.11, build dea9396
```

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Install

To install all dependencies, run the following command:

```bash
npm install
```

## Build

To build all apps and packages, run the following command:

```bash
npm run build
```

## Run

To run all apps and packages, run the following command:

```bash
npm run dev
```

## Play

- Open [http://localhost:3000](http://localhost:3000) in multiple browser tabs/windows and connect to the chat client. Note: users are assigned an ID and name on connection.
  - To start a new thread, click the `New Thread` button or click on a user on the sidebar on the right.
  - Switch between threads by clicking on threads on the sidebar on the left.
  - When a thread is open, send a message using the input field at the bottom of the screen.
  - Disconnect from the chat client using the `Disconnect` button. Note: user will be reassigned a new ID and name when reconnecting.
- View ewf-server event logs by watching output `npm run dev`
- View nats-server event logs by running the following command in a new terminal:
  ```bash
  docker logs nats-server-nats-ws-1 --follow
  ```

## Known Issues

1. Due to time limitations, `ewf-app` is not mobile friendly and should only be viewed in a larger viewport.

2. Making changes when running `npm run dev` can occasionally cause the app to reload which does not correctly publish a `disconnect` event to the `nats-server`, causing the frontend and server to be de-synced (as the user is issued a new ID and name). Fix this by reloading the `ewf-app` window.

3. Not all events are synced across `ewf-server` and `ewf-app` (namely `channel.lastMessage` which is just set locally in `ewf-app` when a message is received for the given channel).
