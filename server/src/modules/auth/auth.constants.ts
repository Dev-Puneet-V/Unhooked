import { OAuth2Client } from "google-auth-library";

export const AUTH_ROLES = {
  admin: "admin",
  user: "user"
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];


export const googleClient = new OAuth2Client();
export const accessTokenTtlSeconds = 15 * 60;
export const refreshTokenTtlDays = 60;
export const passwordSaltRounds = 12;