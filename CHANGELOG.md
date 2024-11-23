# fastify-starter-turbo-monorepo

## Nov-23-2024

- Client SDK generation no longer dependent on the backend build
- Faster openapi.yml generation

## Nov-17-2024

- Remove `lint-staged`. Wasn't being used.
- Update `husky` `commit-msg` to run more linting and formatting checks
- Update packages to latest versions
  * Pinned `@sinclair/typebox` to `0.33.22` and not `0.34.00` due to [a breaking change](https://github.com/sinclairzx81/typebox/blob/master/changelog/0.34.0.md) with `Static` 
- Removes query params from `apiPath` in the log context for security reasons
- **Breaking:** Removes `strictNullChecks=false` in the tsconfig for better type safety
- **Breaking**: `typechecks` script is now `verify-types`

## Sept-28-2024

- Breaking: Change the format of `ApiError` to simplify validation errors
- Update the error handler to use the new `ApiError` format
- Package updates
- Add url path to log context

## Sept-21-2024

- Upgrade fastify to v5, all packages to latest versions
- Better error handling for the backend
- Fixed bugs around logs not showing in certain cases during tests
- Add package publishing support
- Add dev build caching for faster builds during dev
- Removed AJV sanitize plugin. In real-world usage, you wouldn't want to sanitize the input to your API immediately, but later on.

## Sept-07-2024

- Added better formatting for logs
- Test response code failures now show the request and response outputs in the log
- Fix updatedAt type
- Disabled logging for tests by default now that we have proper error logging for request failures

## Sep-06-2024

- Enabled logging for tests by default
- Added auto-logging for test failures

## Sep-01-2024

- Added type exports to Request / Response in the API definitions
- Updated test to include Response typings
- Updated logging to pretty print for non-prod
- Fixed issue around error handling where the error was not being parsed properly
- Updated packages to latest versions
- Added linting / formatting to the backend-errors package
- Removed --watch flag from backend dev script
  * Should now run `turbo watch dev` to watch for changes
- Rename the `decorators` directories to `plugins` since not all items in it are decorators

## Aug-17-2024

First version.
