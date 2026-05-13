# Backend Feature Flow

Use this structure for backend features so the code stays predictable and reviewable.

## Folder Shape

```text
server/src
  app.ts
  index.ts

  config/
    environment.ts
    db.ts

  shared/
    errors/
      AppError.ts
    middleware/
      errorMiddleware.ts
      validateRequest.ts
    utils/
      asyncHandler.ts

  modules/
    feature-name/
      __tests__/
        unit/
        integration/
      feature.routes.ts
      feature.controller.ts
      feature.service.ts
      feature.repository.ts
      feature.dto.ts
      feature.validation.ts
      feature.types.ts
```

For auth specifically:

```text
server/src/modules/auth
  auth.routes.ts
  auth.controller.ts
  auth.service.ts
  auth.repository.ts
  auth.dto.ts
  auth.validation.ts
  auth.types.ts
  password.service.ts
  token.service.ts
  __tests__/
    unit/
    integration/
```

## Request Flow

```text
route
  -> validation / DTO
  -> controller
  -> service
  -> repository
  -> database
```

## File Responsibilities

### routes

Owns URL mapping only.

Example:

```ts
router.post('/email', validateRequest(emailAuthSchema), authController.loginWithEmail);
```

### validation

Owns runtime request validation.

Use this for checking required fields, email format, password length, and bad input before the controller.

### dto

Owns request and response shapes.

Example:

```ts
export interface EmailAuthRequestDto {
  email: string;
  password: string;
}
```

### controller

Owns HTTP request/response only.

Controller should be thin:

```ts
export class AuthController {
  constructor(private authService: AuthService) {}

  loginWithEmail = async (req, res) => {
    const result = await this.authService.loginWithEmail(req.body);
    res.status(200).json(result);
  };
}
```

Do not put business logic or SQL in controllers.

### service

Owns business logic.

For auth, this includes:

- normalize email
- find existing user
- verify password
- create user if missing
- create login session
- issue tokens

### repository

Owns database queries only.

Repository should not decide business rules. It should expose clear methods like:

```ts
findUserByEmail(email)
createUser(input)
createLoginSession(input)
findActiveSession(input)
revokeSession(input)
```

### types

Owns internal/domain types that are not directly request/response DTOs.

## Auth Implementation Order

1. Fix environment validation.
2. Fix database connection config.
3. Create `users` and `login_sessions` tables.
4. Create auth DTOs and validation.
5. Create user/session repositories.
6. Create password service.
7. Create token service.
8. Create auth service.
9. Create auth controller.
10. Wire auth routes into app.
11. Add tests/manual checks.

## Auth Flow

For:

```text
POST /auth/email
```

Use:

```text
auth.routes.ts
  -> auth.validation.ts
  -> auth.controller.ts
  -> auth.service.ts
  -> auth.repository.ts
  -> database
```

Service logic:

```text
normalize email
validate password policy
find user by email

if user exists:
  verify password
  reject wrong password with generic message

if user does not exist:
  generate username
  hash password
  create user

create device id
create refresh token
hash refresh token
create login session
create access token
return auth response
```

## Rules

- Controllers stay thin.
- Services own decisions.
- Repositories only talk to the database.
- DTOs describe data crossing API boundaries.
- Validation handles bad input early.
- Tests stay inside their own module.
- Unit and integration tests stay in separate folders.
- Password hashing stays in `password.service.ts`.
- JWT and refresh token logic stays in `token.service.ts`.
- Do not add Redis, queues, Google auth, OTP, or email verification until the basic auth spine is clean.
