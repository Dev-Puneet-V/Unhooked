# Testing strategy

## Test pyramid

- Unit tests cover small, deterministic logic with dependencies mocked or replaced by fakes.
- Integration tests cover module boundaries such as HTTP routes, middleware, validation, and response shapes.
- End-to-end tests should be added later for the highest-value user flows once the app is more stable.

## Backend

Use Vitest for backend tests.

```bash
cd server
npm test
```

Current examples:

- `src/modules/auth/__tests__/unit/auth.validation.test.ts` is a unit test for auth request validation.
- `src/modules/auth/__tests__/unit/auth.service.test.ts` is a unit test for auth service decisions such as email login, Google login, refresh rotation, and logout hashing.
- `src/modules/auth/__tests__/integration/auth.routes.test.ts` is an integration-style route test using Supertest. It exercises Express routing, request validation, middleware, status codes, and JSON responses while mocking the service layer.

Backend conventions:

- Tests must stay inside the module they protect.
- Separate unit and integration tests with `__tests__/unit` and `__tests__/integration`.
- Keep pure validation and utility tests close to the behavior they protect.
- Test successful and failing paths for each route.
- Mock external boundaries: database, OAuth providers, token stores, and network calls.
- Avoid requiring Postgres for ordinary route tests. Add separate database integration tests only when the repository SQL itself is the thing being verified.

## Mobile

Use Jest for React Native tests.

```bash
cd mobile
npm test
```

Current examples:

- `src/app/__tests__/integration/App.test.tsx` is a smoke test that verifies the app renders.
- `src/shared/services/__tests__/unit/tokenService.test.ts` is a unit test with a fake storage dependency.
- `src/shared/services/__tests__/unit/storageService.test.ts` is a unit test for MMKV normal storage and Keychain secure storage behavior.

Mobile conventions:

- Tests must stay inside the module or shared layer they protect.
- Separate unit and integration tests with `__tests__/unit` and `__tests__/integration`.
- Mock native modules in `jest.setup.js`.
- Prefer testing services and state transitions without rendering when UI is not the behavior under test.
- For screens, test visible outcomes and user actions instead of implementation details.
