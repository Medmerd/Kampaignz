# Kampaignz Independent API

This directory contains the independent Express.js REST API for Kampaignz. It exposes the core domain logic (Campaigns, Missions, Sessions, Players, Rules) over standard HTTP endpoints, backed by a PostgreSQL database.

## Architecture

The API maps standard RESTful verbs (`GET`, `POST`, `PUT`, `DELETE`) to the domain repositories located in `src/main/repositories`. 

- **Entry point**: `src/server.ts` handles port binding.
- **App definition**: `src/app.ts` configures Express middleware, routes, and error handling.
- **Routing**: Domain-specific routes are located in `src/routes/`.
- **Middleware**: Custom middleware, including the centralized error handler, are in `src/middleware/`.

## Prerequisites

Before running the API, ensure you have a PostgreSQL database available and configured. The connection is managed via the environment variables used by the central repository layer (e.g., `VITE_DB_CLIENT`).

## Running the API

You can start the standalone API server directly using `tsx` from the monorepo root:

```bash
# Run in development mode
npx tsx apps/api/src/server.ts

# Or, if you want to watch for changes during development:
npx tsx watch apps/api/src/server.ts
```

By default, the server will start on port `3000`. You can override this by setting the `PORT` environment variable:

```bash
PORT=8080 npx tsx apps/api/src/server.ts
```

## Testing

The API uses `vitest` and `supertest` for integration testing. Tests are located in the `tests/api/` directory at the project root.

To run the API tests:

```bash
# Run all tests (including API tests)
npm run test

# Run only the API tests
npx vitest run tests/api/
```

## API Documentation

- **OpenAPI / Swagger**: The API specification is defined in `openapi.yaml`.
- **Postman**: A Postman collection is available at `postman_collection.json`. You can import this directly into Postman or Insomnia to easily interact with the endpoints.
