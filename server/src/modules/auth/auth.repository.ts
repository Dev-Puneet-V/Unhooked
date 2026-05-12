import { pool } from "../../config/db.js";

export interface AuthUserRecord {
  id: number;
  email: string;
  name: string | null;
  username: string;
}

export interface LoginSessionRecord {
  id: number;
  user_id: number;
  device_id: string;
}

export const findUserByEmail = async (email: string) => {
  const result = await pool.query<AuthUserRecord>(
    `
      SELECT id, email, name, username
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0];
};

export const findUserById = async (id: number) => {
  const result = await pool.query<AuthUserRecord>(
    `
      SELECT id, email, name, username
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0];
};

export const usernameExists = async (username: string) => {
  const result = await pool.query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)",
    [username]
  );

  return result.rows[0]?.exists ?? false;
};

export const createGoogleUser = async (params: {
  email: string;
  name: string | null;
  username: string;
}) => {
  const result = await pool.query<AuthUserRecord>(
    `
      INSERT INTO users (email, name, username, password_hash)
      VALUES ($1, $2, $3, NULL)
      RETURNING id, email, name, username
    `,
    [params.email, params.name, params.username]
  );

  return result.rows[0];
};

export const createLoginSession = async (params: {
  userId: number;
  refreshTokenHash: string;
  deviceId: string;
  expiresAt: Date;
}) => {
  const result = await pool.query<LoginSessionRecord>(
    `
      INSERT INTO login_sessions (
        user_id,
        refresh_token_hash,
        device_id,
        expires_at
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, device_id
    `,
    [
      params.userId,
      params.refreshTokenHash,
      params.deviceId,
      params.expiresAt
    ]
  );

  return result.rows[0];
};

export const findActiveSessionByRefreshTokenHash = async (
  refreshTokenHash: string
) => {
  const result = await pool.query<LoginSessionRecord>(
    `
      SELECT id, user_id, device_id
      FROM login_sessions
      WHERE refresh_token_hash = $1
        AND is_active = TRUE
        AND expires_at > NOW()
      LIMIT 1
    `,
    [refreshTokenHash]
  );

  return result.rows[0];
};

export const revokeSessionByRefreshTokenHash = async (
  refreshTokenHash: string
) => {
  await pool.query(
    `
      UPDATE login_sessions
      SET is_active = FALSE,
          revoked_at = NOW(),
          updated_at = NOW()
      WHERE refresh_token_hash = $1
        AND is_active = TRUE
    `,
    [refreshTokenHash]
  );
};

export const rotateRefreshToken = async (params: {
  sessionId: number;
  refreshTokenHash: string;
  expiresAt: Date;
}) => {
  await pool.query(
    `
      UPDATE login_sessions
      SET refresh_token_hash = $1,
          expires_at = $2,
          updated_at = NOW()
      WHERE id = $3
    `,
    [params.refreshTokenHash, params.expiresAt, params.sessionId]
  );
};
