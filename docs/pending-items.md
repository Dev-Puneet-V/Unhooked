# Pending Items

This file tracks things we are intentionally not implementing right now. Each item should have a short reason so we remember the decision later.

## Auth

- Email OTP login
  - Deferred because it adds email delivery, retry, expiry, abuse prevention, and user friction.

- Phone OTP login
  - Deferred because it requires an SMS provider, costs money, needs rate limiting, and creates support issues when OTP delivery fails.

- Mandatory email verification
  - Deferred because it slows first-time onboarding. Add later before sensitive flows such as payouts or account recovery.

- Passkeys
  - Deferred because it is a bigger auth surface. Consider later as a passwordless login option after basic auth is stable.

- Auto-generating and emailing passwords for Google users
  - Avoided because sending passwords over email is risky and creates unnecessary secret-handling complexity.

- Redis-backed access token validation on every request
  - Deferred because short-lived JWT access tokens can be verified by the backend without a database or Redis lookup.

- Enforcing one active access token per refresh token
  - Deferred because mobile apps can trigger parallel refresh flows, and strict one-token rules add edge cases without enough MVP benefit.

- Immediate logout of already-issued access tokens
  - Deferred because short access-token TTLs are acceptable for MVP. Revisit if security requirements become stricter.

## Mobile UI

- Final Figma-quality auth design
  - Deferred until the basic screen and auth behavior are in place.

- Full shared component library
  - Deferred because we only have one real screen right now. Extract components when repetition appears.

- Landscape/orientation support
  - Deferred because quiz/auth mobile apps usually start portrait-first. Revisit if we decide to support tablets or landscape.

- Advanced responsive scaling rules
  - Deferred because simple ratio scaling is easier to understand. Improve only if we see real layout issues.

## Backend

- Job queue for auth-critical work
  - Deferred because login/register should complete synchronously. Use queues later for welcome emails, verification emails, notifications, and retryable work.

- Email verification provider setup
  - Deferred until email verification or password reset becomes part of the active scope.

- Redis infrastructure
  - Deferred until we need rate limiting, queues, temporary verification tokens, or revocation cache.

## Infrastructure

- Kubernetes/GKE
  - Deferred because Cloud Run is simpler and enough for MVP/staging.

- Managed Redis/Memorystore
  - Deferred until Redis has a real product need.

- Complex cloud networking/load balancers
  - Deferred because they add cost and setup time before we have traffic that needs them.

- Production-grade observability dashboards
  - Deferred until the backend is deployed and has meaningful runtime behavior to observe.
