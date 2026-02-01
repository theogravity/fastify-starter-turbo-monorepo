# Backend AGENTS.md

Backend-specific documentation for the Fastify API server.

## URLs

- API server: http://localhost:3080
- OpenAPI docs: http://localhost:3080/docs
- PGAdmin: http://localhost:5050

## Commands

### Development

```bash
bun run dev                # Start dev server with watch
bun run test               # Run tests
```

### Building

```bash
bun run build              # Compile TypeScript to dist/
bun run compile            # Create bytecode-compiled binary
bun run prod               # Run production build
```

### Database Migrations

```bash
bun run db:migrate:create  # Create a new migration
bun run db:migrate:latest  # Run all pending migrations
bun run db:migrate:undo    # Rollback last migration
```

### OpenAPI Generation

```bash
bun run generate           # Generate OpenAPI schema (outputs to packages/backend-client/openapi.yml)
```

## Code Generation (Scaffolding)

Run `turbo gen` from the repo root to access these generators.

### 1. API Route (`api:route`)

Creates a complete REST endpoint with route, schema, controller, and tests.

**Prompts:**
1. Resource folder name (plural, e.g., "users")
2. HTTP method (GET, POST, PUT, DELETE, PATCH)
3. Route path (e.g., "/noun" or "/:id")
4. Operation name (e.g., "createUser")

**Generated files:**
- `src/api/{resource}/{operation-name}.ts` - Route and controller
- `src/api/{resource}/__tests__/{operation-name}.test.ts` - Test file
- Updates `src/api/{resource}/index.ts` and `src/api/routes.ts`

### 2. Database Table (`db:table`)

Creates database table with repository, types, and migration.

**Prompts:**
1. Table name (singular, camelCase, e.g., "product")

**Generated files:**
- `src/db/repositories/{table-name}s.repository.ts`
- `src/db/types/{table-name}s.db-types.ts`
- `src/db/migrations/{timestamp}-create-{table-name}s-table.ts`
- Updates type index, repository index, and context injection

### 3. Service (`service`)

Creates a business logic service class.

**Prompts:**
1. Service name (PascalCase, e.g., "UserProfiles")

**Generated files:**
- `src/services/{service-name}.service.ts`
- Updates `src/services/index.ts` and context injection

## Project Architecture

### API Structure

Routes are organized by resource in `src/api/{resource}/`:

```
src/api/
├── users/
│   ├── index.ts                      # Registers all user routes
│   ├── create-email-user.ts          # POST /users/email
│   ├── get-user-by-id.ts             # GET /users/:id
│   └── __tests__/
│       ├── create-email-user.test.ts
│       └── get-user-by-id.test.ts
├── health/
│   └── ...
└── routes.ts                         # Main router registering all resources
```

### Route File Structure

Each route file contains:

1. **Request/Response schemas** using TypeBox
2. **Route registration function** that registers schemas and the route
3. **Controller function** with the business logic

Example:

```typescript
// Schema definitions
const CreateUserRequestSchema = Type.Object({
  $id: "CreateUserRequest",
  // ... fields
});
const CreateUserResponseSchema = Type.Object({
  $id: "CreateUserResponse",
  // ... fields
});

// Route registration
export async function createUserRoute(fastify: FastifyInstance) {
  fastify.addSchema(CreateUserRequestSchema);
  fastify.addSchema(CreateUserResponseSchema);
  fastify.post("/users", routeOpts, createUserController);
}

// Controller
export async function createUserController(request, reply) {
  const { repositories, services } = request.ctx;
  // Implementation
}
```

### Service Layer

Services in `src/services/` contain business logic:

```typescript
export class UserProfilesService extends BaseService {
  async updateProfile(userId: string, data: ProfileData) {
    // Business logic here
  }
}
```

Access via `request.ctx.services.userProfiles`.

### Repository Layer

Repositories in `src/db/repositories/` handle database operations:

```typescript
export class UsersRepository extends BaseRepository {
  async createUser(data: NewUser): Promise<UserDb> {...}
  async getUserById(id: string): Promise<UserDb | null> {...}
}
```

Access via `request.ctx.repositories.users`.

### Context Injection

The request context (`src/api-lib/context.ts`) provides:
- Database instance
- All repositories
- All services
- Logger

## Testing

### Overview

Tests use **Vitest** as the test runner with **Testcontainers** to spin up an isolated PostgreSQL database for each test run. This ensures tests run against a real database with all migrations applied.

### Running Tests

```bash
bun run test               # Run all tests
```

### Test Infrastructure

#### Global Setup (`src/test-utils/global-setup.ts`)

Before tests run, the global setup:
1. Starts a PostgreSQL container via Testcontainers
2. Sets database environment variables (`DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`)
3. Runs all migrations against the test database

#### Global Teardown (`src/test-utils/global-teardown.ts`)

After tests complete, containers are stopped and cleaned up.

### Test Utilities

All test utilities are in `src/test-utils/` and imported via `@/test-utils`.

#### `testFastify` - HTTP Testing

A pre-configured Fastify instance for making HTTP requests in tests. It wraps Fastify's `inject()` method with additional features:

```typescript
import { testFastify } from "@/test-utils/test-server";

const response = await testFastify.inject({
  method: "POST",
  url: "/users/email",
  payload: { email: "test@example.com", password: "pass123" },
  headers,
  expectedStatusCode: 200,  // Fails test if status doesn't match
});
```

**Custom options:**
- `expectedStatusCode` (default: `200`) - Expected HTTP status. Test fails if response doesn't match, and logs the full request/response for debugging.
- `disableExpectedStatusCodeCheck` - Set to `true` to skip status code validation.

When a request fails the status check, the test server automatically logs:
- The full request (method, URL, payload, headers)
- The full response body

This makes debugging failed tests much easier.

#### `testFramework` - Test Data Generation

The `ApiTestingFramework` class provides methods to generate test fixtures:

```typescript
import { testFramework } from "@/test-utils/test-framework";
```

**`generateTestFacets(params?)`** - Creates a test user and returns headers for authenticated requests:

```typescript
const { user, headers } = await testFramework.generateTestFacets({
  withLogging: true,  // Enable server-side logging for this test
});

// user: The created User object
// headers: Object with test-user-id and test-logging-enabled headers
```

**`generateNewUsers(count)`** - Creates multiple test users:

```typescript
const users = await testFramework.generateNewUsers(5);
```

#### Test Headers

Tests use special `test-` prefixed headers for mocking authentication:

| Header | Purpose |
|--------|---------|
| `test-user-id` | Sets `request.userId` to simulate authenticated user |
| `test-logging-enabled` | Set to `"true"` to enable server logging for this request |

These headers are processed by test plugins (`src/test-utils/plugins/`) and are only available in the test environment.

### Enabling Logging in Tests

By default, server-side logging is disabled during tests to reduce noise. Enable it when debugging:

**Option 1: Via `generateTestFacets`**
```typescript
const { headers } = await testFramework.generateTestFacets({
  withLogging: true,
});
```

**Option 2: In endpoint code**
```typescript
// Inside a controller
request.log.enableLogging();
```

### Writing Tests

#### Test File Location

Tests live in `__tests__/` directories alongside the code they test:
```
src/api/users/
├── create-email-user.ts
├── get-user-by-id.ts
└── __tests__/
    ├── create-email-user.test.ts
    └── get-user-by-id.test.ts
```

#### Complete Example

```typescript
import { faker } from "@faker-js/faker";
import { describe, expect, it } from "vitest";
import { testFramework } from "@/test-utils/test-framework";
import { testFastify } from "@/test-utils/test-server";
import type { CreateEMailUserResponse } from "../create-email-user.route";

describe("Create e-mail user API", () => {
  it("should create an e-mail user", async () => {
    const { headers } = await testFramework.generateTestFacets({
      withLogging: true,
    });

    const response = await testFastify.inject({
      method: "POST",
      url: "/users/email",
      payload: {
        givenName: faker.person.firstName(),
        familyName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
      expectedStatusCode: 200,
      headers,
    });

    expect(response.json<CreateEMailUserResponse>().user.id).toBeDefined();
  });

  it("should return 400 for invalid email", async () => {
    const { headers } = await testFramework.generateTestFacets();

    await testFastify.inject({
      method: "POST",
      url: "/users/email",
      payload: {
        givenName: "John",
        familyName: "Doe",
        email: "not-an-email",
        password: "password123",
      },
      expectedStatusCode: 400,
      headers,
    });
  });
});
```

### Available Libraries

- **`@faker-js/faker`** - Generate realistic test data (names, emails, etc.)
- **`vitest`** - Test runner, assertions (`describe`, `it`, `expect`, `beforeAll`, `afterAll`)
- **`testcontainers`** - Docker-based test infrastructure
