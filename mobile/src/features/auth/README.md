# Auth

Sign-in, sign-up, password reset, and session handling **specific to the auth flow**.

Suggested layout as this grows:

- `screens/` — e.g. `LoginScreen.tsx`, `RegisterScreen.tsx`
- `hooks/` — e.g. `useAuthForm.ts`
- `api/` — auth endpoints only (shared HTTP client lives under `src/shared/api/`)
