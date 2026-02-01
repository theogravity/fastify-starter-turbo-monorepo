# AGENTS.md

This document describes how this project works and how to perform common operations.

## Project Overview

This is a **Bun-powered TypeScript monorepo** using Turborepo for orchestration. It contains a Fastify API backend with auto-generated TypeScript client SDK.

### Directory Structure

```
fastify-starter-turbo-monorepo/
├── apps/
│   └── backend/                    # Fastify API server
├── packages/
│   ├── tsconfig/                   # Shared TypeScript configuration
│   ├── backend-errors/             # Error handling package
│   └── backend-client/             # Generated TypeScript client SDK
├── turbo.json                      # Turbo task configuration
├── package.json                    # Root workspace definition
├── biome.json                      # Linting and formatting
└── lefthook.yml                    # Git hooks
```

### Technology Stack

- **Runtime**: Bun (>= 1.0.0)
- **Framework**: Fastify v5
- **Database**: PostgreSQL with Kysely (type-safe query builder)
- **Validation**: TypeBox (generates OpenAPI schemas)
- **Testing**: Vitest + Testcontainers
- **Linting/Formatting**: Biome
- **Monorepo**: Turborepo + Bun workspaces

## Common Commands

### Development

```bash
bun run start              # Start dev mode with watch (turbo watch dev)
turbo watch dev            # Same as above
```

### Building

```bash
turbo build                # Build all packages
turbo run build            # Same as above
```

### Testing

```bash
turbo test                 # Run tests across all packages
```

### Linting and Formatting

```bash
turbo run lint             # Lint all packages
turbo run verify-types     # Type check all packages

# Format specific files
biome check --write --unsafe src
```

### Cleaning

```bash
bun run clean              # Remove node_modules, turbo cache, dist, .hashes.json
bun run clean:turbo        # Remove .turbo directories only
bun run clean:dist         # Remove dist directories only
```

## Code Generation

Use `turbo gen` to generate boilerplate code:

```bash
turbo gen
```

See `apps/backend/AGENTS.md` for details on available generators.

## Build Dependencies

The Turbo pipeline ensures correct build order:

1. `@internal/backend-errors` builds first
2. `@internal/backend` depends on backend-errors
3. `@internal/backend-client` depends on backend's OpenAPI generation

For development, `build:dev` tasks use `hash-runner` for incremental builds.

## Package Synchronization

Keep dependencies in sync across packages:

```bash
bun run syncpack:update    # Update all dependencies
bun run syncpack:format    # Format package.json files
bun run syncpack:lint      # Check for version mismatches
```

## Git Hooks (Lefthook)

**Pre-commit:**
- Formats package.json files
- Runs `turbo run lint:staged` on staged TypeScript files

**Pre-push:**
- Runs type checking (`turbo run verify-types`)
- Runs full lint (`turbo run lint`)
