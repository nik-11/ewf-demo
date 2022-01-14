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
