# Learnings

## Google Auth Flow

For React Native Google sign-in with a backend, the Android OAuth client and Web Client ID have different jobs.

1. Android OAuth client proves the request is coming from the real Android app.
   - Google checks the app package name.
   - Google checks the signing SHA-1.
   - This helps Google trust that the request came from the expected Android app.

2. Web Client ID is used as the audience for the Google ID token.
   - Mobile passes the Web Client ID to Google sign-in.
   - Google returns an `idToken`.
   - That `idToken` is meant for the app/backend identified by the Web Client ID.

3. Mobile sends the Google `idToken` to the backend.
   - The mobile app should not store this token permanently.
   - It is only proof for this login attempt.

4. Backend verifies the Google `idToken`.
   - It checks that Google signed the token.
   - It checks that the token is not expired.
   - It checks that the token audience matches the same Web Client ID.
   - It checks that the Google email is verified.

5. Backend creates or logs in the app user.
   - If the user does not exist, create the user.
   - If the user already exists, log them in.
   - Then return the app's own access token and refresh token.

Simple model:

```txt
Android client = proves the Android app is real
Web Client ID = tells Google who the ID token is for
Google ID token = temporary proof sent to backend
Backend = verifies Google proof and returns app tokens
```
