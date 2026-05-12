import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

import ENV_VARIABLES_CONFIG from "../../config/environment.js";
import type { AuthContextDto, AuthResponseDto } from "./auth.dto.js";
import {
  createGoogleUser,
  createLoginSession,
  findActiveSessionByRefreshTokenHash,
  findUserByEmail,
  findUserById,
  revokeSessionByRefreshTokenHash,
  rotateRefreshToken,
  usernameExists,
  type AuthUserRecord
} from "./auth.repository.js";

const googleClient = new OAuth2Client();
const accessTokenTtlSeconds = 15 * 60;
const refreshTokenTtlDays = 60;

const requireEnv = (value: string | undefined, name: string) => {
  if (!value?.trim() || value.startsWith("PASTE_")) {
    throw new Error(`Missing ${name}`);
  }

  return value;
};

const signAccessToken = (params: {
  userId: number;
  sessionId: number;
  deviceId: string;
}) => {
  const secret = requireEnv(
    ENV_VARIABLES_CONFIG.JWT_ACCESS_SECRET,
    "JWT_ACCESS_SECRET"
  );

  return jwt.sign(
    {
      sid: String(params.sessionId),
      did: params.deviceId
    },
    secret,
    {
      algorithm: "HS256",
      expiresIn: accessTokenTtlSeconds,
      subject: String(params.userId)
    }
  );
};

export const verifyAccessToken = (accessToken: string): AuthContextDto => {
  const secret = requireEnv(
    ENV_VARIABLES_CONFIG.JWT_ACCESS_SECRET,
    "JWT_ACCESS_SECRET"
  );
  const payload = jwt.verify(accessToken, secret);

  if (
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    typeof payload.sid !== "string" ||
    typeof payload.did !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }

  return {
    userId: Number(payload.sub),
    sessionId: Number(payload.sid),
    deviceId: payload.did
  };
};

const createRefreshToken = () => crypto.randomBytes(48).toString("base64url");

const hashRefreshToken = (refreshToken: string) =>
  crypto.createHash("sha256").update(refreshToken).digest("hex");

const getRefreshTokenExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshTokenTtlDays);
  return expiresAt;
};

const createUsernameBase = (email: string) => {
  const [localPart] = email.split("@");
  const cleaned = localPart.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return (cleaned || "user").slice(0, 10);
};

const generateUniqueUsername = async (email: string) => {
  const base = createUsernameBase(email);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = crypto.randomBytes(2).toString("hex");
    const username = `${base}${suffix}`;

    if (!(await usernameExists(username))) {
      return username;
    }
  }

  return `${base}${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
};

const toAuthResponse = async (
  user: AuthUserRecord,
  session: { id: number; device_id: string }
): Promise<AuthResponseDto> => {
  const refreshToken = createRefreshToken();

  await rotateRefreshToken({
    sessionId: session.id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshTokenExpiry()
  });

  return {
    accessToken: signAccessToken({
      userId: user.id,
      sessionId: session.id,
      deviceId: session.device_id
    }),
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username
    }
  };
};

export const loginWithGoogle = async (
  idToken: string
): Promise<AuthResponseDto> => {
  const googleWebClientId = requireEnv(
    ENV_VARIABLES_CONFIG.GOOGLE_WEB_CLIENT_ID,
    "GOOGLE_WEB_CLIENT_ID"
  );
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: googleWebClientId
  });
  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("Google token payload is missing");
  }

  const email = payload?.email?.trim().toLowerCase();

  if (!email || !payload.email_verified) {
    throw new Error("Google account email is not verified");
  }

  const user =
    (await findUserByEmail(email)) ??
    (await createGoogleUser({
      email,
      name: payload.name ?? null,
      username: await generateUniqueUsername(email)
    }));

  const refreshToken = createRefreshToken();
  const session = await createLoginSession({
    userId: user.id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    deviceId: crypto.randomUUID(),
    expiresAt: getRefreshTokenExpiry()
  });

  return {
    accessToken: signAccessToken({
      userId: user.id,
      sessionId: session.id,
      deviceId: session.device_id
    }),
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username
    }
  };
};

export const refreshAuthTokens = async (
  refreshToken: string
): Promise<AuthResponseDto> => {
  const session = await findActiveSessionByRefreshTokenHash(
    hashRefreshToken(refreshToken)
  );

  if (!session) {
    throw new Error("Invalid refresh token");
  }

  const user = await findUserById(session.user_id);

  if (!user) {
    throw new Error("Session user not found");
  }

  return toAuthResponse(user, {
    id: session.id,
    device_id: session.device_id
  });
};

export const getAuthenticatedUser = async (auth: AuthContextDto) => {
  const user = await findUserById(auth.userId);

  if (!user) {
    throw new Error("Authenticated user not found");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username
  };
};

export const logoutWithRefreshToken = async (refreshToken: string) => {
  await revokeSessionByRefreshTokenHash(hashRefreshToken(refreshToken));
};
