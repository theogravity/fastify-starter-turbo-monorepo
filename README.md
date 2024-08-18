# Fastify Turbo Monorepo Starter

This is a starter project for building an API server using Typescript, Fastify and Kysely with Postgres. 

## Features

- It is setup as a monorepo using [`turbo`](https://turbo.build/) and [`pnpm`](https://pnpm.io/).
- Outputs OpenAPI schema for the API and has a web UI for viewing it.
- A sample REST test is included using Vitest.
- Sample database migrations / repositories are included using Kysely.
- An client SDK package is included to generate typescript client code from the API schema.
- An error handler package is included to handle errors and return a consistent response.
- Code generators using `turbo gen` to create new API endpoints and database tables.

## Libraries and tools used

- [`typescript`](https://www.typescriptlang.org/)
- [`pnpm`](https://pnpm.io/) for package management
- [`changesets`](https://github.com/changesets/changesets) for version and changelogs
- [`commitlint`](https://commitlint.js.org/) for commit message linting
- [`turbo`](https://turbo.build/) for monorepo management
- [`fastify`](https://www.fastify.io/) for the API server framework
- [`kysely`](https://kysely.dev/) for the database query builder
- [`postgres`](https://www.postgresql.org/) + pgAdmin for the database
- [`testcontainers`](https://www.testcontainers.org/) for testing with a sandboxed postgres instance
- [`vitest`](https://vitest.dev/) for endpoint testing
- [`loglayer`](https://github.com/theogravity/loglayer) for formatted logging
- [`biome`](https://biomejs.dev/) for linting and formatting
- [`syncpack`](https://jamiemason.github.io/syncpack/) for keeping package versions in sync
- [`Hey API`](https://heyapi.vercel.app/) for generating the backend SDK using the generated OpenAPI schema from the backend

## Setup

- [Install docker](https://docs.docker.com/engine/install/)
- [Install pnpm](https://pnpm.io/installation)
- `pnpm install turbo --global`
- `pnpm install`
- Copy `apps/backend/.env.example` to `apps/backend/.env`

Start local postgres server:

`docker compose up -d`

Perform database migrations:

`pnpm db:migrate:lastest`

## Development

`turbo dev`

- API server: http://localhost:3080
- OpenAPI docs: http://localhost:3080/docs
- PGAdmin: http://localhost:5050

## Testing

Make sure docker is running as it uses `testcontainers` to spin up a
temporary postgres database.

`turbo test`

## Build

`turbo build`

## Generate scaffolding

Generators for the following:

- New API endpoints + tests
- Database tables and repositories

`turbo gen`

## Database migrations

- Create a migration: `pnpm db:create`
- Run migrations: `pnpm db:latest`
- Rollback migrations: `pnpm db:undo`

## Update all dependencies

`pnpm syncpack:update`

## Add a new CHANGELOG.md entry + package versioning

Create a new changeset entry:

`pnpm changeset`

Update all package versions and generate changelogs:

`pnpm changeset version`
