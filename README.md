# EWF Demo

This repository is built using [Turborepo](https://turborepo.org/docs), a monorepo build system.

## What's in this repo?

This repo uses [NPM](https://www.npmjs.com/) as the package manager. The following packages/apps are included:

### Apps and Packages

- `ewf-server`: a [Nest.js](https://docs.nestjs.com/) web server
- `nats-server`: a [Docker](https://docs.docker.com/get-started/overview/) container that runs a NATS server locally
- `ewf-app`: a [Next.js](https://nextjs.org) React app
- `interfaces`: a shared interface library used between `ewf-server` and `ewf-app`
- `config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

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
