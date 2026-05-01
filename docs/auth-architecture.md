# Auth Architecture

## Goal

Build a fast, low-friction auth flow that is simple for users, safe enough for an MVP, and structured so we can add stronger verification later without rewriting the system.

This product is a daily quiz app, so onboarding speed matters. Auth should not become a heavy flow where users leave the app, search email/SMS, copy codes, and come back before they can play.

## MVP Decision

Use two login methods:

1. Google sign-in as the primary path.
2. Email + password as the secondary path.

If a user does not exist, create the account during the same flow and log them in.

For MVP, avoid:

- Email OTP login.
- SMS OTP login.
- Passkeys.
- Mandatory email verification before using the app.

These are valuable later, but they add implementation, provider, support, retry, abuse-prevention, and user-experience complexity. We will add them when the product needs stronger identity verification, especially around rewards, payouts, account recovery, or fraud prevention.

## Deferred Verification Options

Later we may add:

- Email verification link for account trust.
- Passkeys for passwordless login.
- Phone OTP for prize/payout verification.
- Step-up verification before sensitive actions such as updating UPI details.

Passkeys should be treated as a future passwordless auth method, not as email verification itself. Email verification should use a signed verification link or code. Passkeys can later reduce password friction and improve account security.

## Email Policy

Emails must be:

- Required.
- Unique.
- Normalized to lowercase.
- Trimmed before validation.
- Validated using a standard email validator.

Recommended limits:

- Minimum length: 5.
- Maximum length: 254.

Database:

- Store normalized email.
- Add a unique index on `email`.
- Do not allow duplicate accounts with casing differences.

## Password Policy

Password rules should avoid user friction while still rejecting very weak passwords.

Recommended MVP policy:

- Minimum length: 8.
- Maximum length: 128.
- Must include at least two of:
  - letter
  - number
  - symbol
- Reject common weak passwords such as `password123`, `12345678`, and email-derived passwords.

Do not require overly complex rules like mandatory uppercase, lowercase, number, symbol, and frequent rotation. Those rules often make users choose worse passwords.

Password storage:

- Never store plaintext passwords.
- Hash passwords using `argon2id` or `bcrypt`.
- Prefer `argon2id` if available in the server stack.
- Never log passwords or generated temporary passwords.

## Google Sign-In Flow

1. Mobile receives Google ID token.
2. Mobile sends ID token to the backend.
3. Backend verifies the token with Google.
4. Backend finds user by normalized email.
5. If user does not exist, backend creates user.
6. Backend creates a login session.
7. Backend returns app access token and refresh token.

The backend must not trust only the email string from the app. It must verify the Google token.

## Email + Password Flow

1. User enters email and password.
2. Backend normalizes and validates email.
3. If user exists, verify password.
4. If user does not exist, create user with hashed password.
5. Backend creates a login session.
6. Backend returns app access token and refresh token.

This gives fast registration without a separate sign-up screen.

## Username Strategy

Username should be short, readable, and unique. Do not rely only on the email prefix because different emails can conflict, such as:

- `puneet@gmail.com`
- `puneet@yahoo.com`

Recommended strategy:

1. Take a clean base from the email local part.
2. Keep only lowercase letters and numbers.
3. Truncate base to 8 to 12 characters.
4. Add a short random suffix generated with crypto-safe randomness.

Example:

```text
email: puneet.sharma@gmail.com
base: puneetsharma
username: puneetsh9k2
```

Avoid using `Date.now()` for randomness. It can be guessed and may collide under load. Use crypto randomness instead.

Database:

- `username` should be required.
- `username` should be unique.
- Retry username generation if a collision happens.

## Generated Password For Google Users

For Google-created accounts, do not email the user a generated password by default.

Reason:

- It increases risk if email is compromised.
- It creates another secret we must generate, queue, email, and support.
- Users who joined with Google may not want password login.
- Password emails can look suspicious.

Better MVP approach:

- Create Google account with `passwordHash = null`.
- If the user later wants email/password login, provide a "set password" flow from inside the app.
- Later, support password setup through a signed email link.

If we still decide to send onboarding email, keep it informational only:

- Welcome message.
- Username.
- No password.
- No sensitive token.

This email can go through a background job queue.

## User Schema

Initial shape:

```text
users {
  id: uuid primary key
  email: varchar(254) unique not null
  is_email_verified: boolean default false not null
  password_hash: varchar nullable
  username: varchar unique not null
  auth_provider: enum('email', 'google', 'mixed') not null
  created_at: timestamp not null
  updated_at: timestamp not null
}
```

Notes:

- `password_hash` is nullable because Google users may not have password login enabled.
- `auth_provider = mixed` can be used after a Google user sets a password.
- Keep naming consistent with the backend ORM/database convention.

## Session Schema

Store refresh sessions in the database.

```text
login_sessions {
  id: uuid primary key
  user_id: uuid not null
  refresh_token_hash: varchar not null
  device_id: varchar not null
  is_active: boolean default true not null
  expires_at: timestamp not null
  created_at: timestamp not null
  updated_at: timestamp not null
  revoked_at: timestamp nullable
}
```

Important:

- Store a hash of the refresh token, not the raw refresh token.
- Generate `device_id` using crypto-safe randomness during login.
- Bind refresh token usage to the session and device id.
- On logout from all devices, mark all user sessions inactive.

## Access Token Strategy

Use short-lived JWT access tokens.

Recommended MVP:

- Access token TTL: 10 to 15 minutes.
- Refresh token TTL: 30 to 60 days.
- Access token includes:
  - `sub` user id
  - `sid` session id
  - `did` device id
  - `iat`
  - `exp`

Most API requests should verify the JWT locally without hitting the database or Redis. This keeps requests fast and avoids turning every API call into a session lookup.

Tradeoff:

- If the user logs out from all devices, an already-issued access token may remain valid until it expires.
- With a 10 to 15 minute TTL, this is usually acceptable for an MVP.

For sensitive actions such as changing UPI details, force a fresh session check against the database.

## Redis Decision

Do not store every access token in Redis for MVP.

Reason:

- It increases infrastructure complexity.
- It consumes memory as user count grows.
- It makes every authenticated request depend on Redis.
- JWT access tokens are already designed to be verified without storage.

Use Redis later for:

- Rate limiting.
- OTP/email verification attempt limits.
- Temporary verification tokens.
- Refresh-token rotation lock.
- Session revocation cache if needed.
- Job queue backend if we choose BullMQ.

If we need immediate logout for access tokens later, use a lightweight revocation strategy:

- Store revoked session ids or user token version in Redis.
- Keep Redis TTL aligned with the maximum access token TTL.
- Avoid storing every active access token.

## One Refresh Token To One Access Token

We do not need to enforce exactly one active access token per refresh token in MVP.

Reason:

- Mobile apps can make parallel requests.
- Token refresh can race when multiple requests detect expiry together.
- Enforcing one access token often creates edge cases without much security benefit.

Better approach:

- Keep access tokens short-lived.
- Rotate refresh tokens when refreshing.
- Detect refresh token reuse.
- Revoke the session if old refresh token reuse is detected.

## Job Queue

Use a job queue for slow or retryable tasks, not for core login completion.

Good queue candidates:

- Welcome email.
- Email verification email.
- Password setup email.
- Push notification dispatch.
- Prize payout/admin notifications.

Avoid putting required password creation into a queue for login. Auth should complete synchronously and reliably.

For Google users, no password should be generated unless the user explicitly starts a set-password flow.

## Security Controls

MVP auth should include:

- Password hashing.
- Email normalization.
- Input validation.
- Rate limiting for login attempts.
- Generic auth errors.
- Refresh token hashing.
- Refresh token rotation.
- Session revocation.
- Secure token storage on mobile.
- No sensitive values in logs.
- Environment-based secrets.

## Open Questions

- Which database/ORM will be used for users and sessions?
- Which mail provider will be used for welcome and verification emails?
- Which queue system will we use later: BullMQ + Redis, database-backed jobs, or a cloud queue?
- What exact access and refresh token TTLs do we want for launch?
- Do prizes require verified email, verified phone, or both?

## Current Recommendation

Build the MVP auth in this order:

1. Email + password login/register.
2. Google sign-in.
3. Database-backed refresh sessions.
4. Short-lived JWT access tokens.
5. Welcome email as a background job.
6. Email verification and passkeys later.
7. Redis later for rate limits, queues, and revocation cache.
