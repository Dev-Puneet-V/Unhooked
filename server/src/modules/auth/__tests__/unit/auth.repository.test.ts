import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QueryResult, QueryResultRow } from "pg";

import { AUTH_ROLES } from "../../auth.constants.js";

vi.mock("../../../../config/db.js", () => ({
  pool: {
    query: vi.fn()
  }
}));

import { pool } from "../../../../config/db.js";
import {
  createEmailUser,
  createGoogleUser,
  createLoginSession,
  findActiveSessionByRefreshTokenHash,
  findUserByEmail,
  findUserById,
  revokeSessionByRefreshTokenHash,
  rotateRefreshToken,
  usernameExists
} from "../../auth.repository.js";

const userRecord = {
  id: 1,
  email: "puneet@example.com",
  name: null,
  password_hash: "password-hash",
  username: "puneet",
  role_code: AUTH_ROLES.user
};

const sessionRecord = {
  id: 10,
  user_id: userRecord.id,
  device_id: "device-id"
};

const queryResult = <TRow extends QueryResultRow>(rows: TRow[]): QueryResult<TRow> => ({
  rows,
  rowCount: rows.length,
  command: "",
  oid: 0,
  fields: []
});

describe("auth repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds user by email", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([userRecord]));

    await expect(findUserByEmail(userRecord.email)).resolves.toEqual(userRecord);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("WHERE users.email = $1"), [
      userRecord.email
    ]);
  });

  it("returns undefined when user email does not exist", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([]));

    await expect(findUserByEmail("missing@example.com")).resolves.toBeUndefined();
  });

  it("finds user by id", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([userRecord]));

    await expect(findUserById(userRecord.id)).resolves.toEqual(userRecord);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("WHERE users.id = $1"), [
      userRecord.id
    ]);
  });

  it("checks whether username exists", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([{ exists: true }]));

    await expect(usernameExists(userRecord.username)).resolves.toBe(true);

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)",
      [userRecord.username]
    );
  });

  it("defaults username existence to false when database returns no row", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([]));

    await expect(usernameExists(userRecord.username)).resolves.toBe(false);
  });

  it("creates a Google user with null password", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([userRecord]));

    await expect(
      createGoogleUser({
        email: userRecord.email,
        name: "Puneet",
        username: userRecord.username
      })
    ).resolves.toEqual(userRecord);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("password_hash"), [
      userRecord.email,
      "Puneet",
      userRecord.username
    ]);
  });

  it("creates an email user with password hash", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([userRecord]));

    await expect(
      createEmailUser({
        email: userRecord.email,
        passwordHash: userRecord.password_hash,
        username: userRecord.username
      })
    ).resolves.toEqual(userRecord);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), [
      userRecord.email,
      userRecord.username,
      userRecord.password_hash
    ]);
  });

  it("creates a login session", async () => {
    const expiresAt = new Date("2026-07-13T00:00:00.000Z");
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([sessionRecord]));

    await expect(
      createLoginSession({
        userId: userRecord.id,
        refreshTokenHash: "refresh-token-hash",
        deviceId: sessionRecord.device_id,
        expiresAt
      })
    ).resolves.toEqual(sessionRecord);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO login_sessions"), [
      userRecord.id,
      "refresh-token-hash",
      sessionRecord.device_id,
      expiresAt
    ]);
  });

  it("finds active session by refresh token hash", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([sessionRecord]));

    await expect(findActiveSessionByRefreshTokenHash("hash")).resolves.toEqual(sessionRecord);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE refresh_token_hash = $1"),
      ["hash"]
    );
  });

  it("revokes active session by refresh token hash", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([]));

    await revokeSessionByRefreshTokenHash("hash");

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SET is_active = FALSE"),
      ["hash"]
    );
  });

  it("rotates refresh token for a session", async () => {
    const expiresAt = new Date("2026-07-13T00:00:00.000Z");
    vi.mocked(pool.query as any).mockResolvedValue({
      ...queryResult([]),
      rowCount: 1
    });

    await expect(
      rotateRefreshToken({
      sessionId: sessionRecord.id,
      currentRefreshTokenHash: "old-refresh-token-hash",
      refreshTokenHash: "new-refresh-token-hash",
      expiresAt
      })
    ).resolves.toBe(true);

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("SET refresh_token_hash = $1"), [
      "new-refresh-token-hash",
      expiresAt,
      sessionRecord.id,
      "old-refresh-token-hash"
    ]);
  });

  it("returns false when refresh token rotation does not update a session", async () => {
    vi.mocked(pool.query as any).mockResolvedValue(queryResult([]));

    await expect(
      rotateRefreshToken({
        sessionId: sessionRecord.id,
        currentRefreshTokenHash: "stale-refresh-token-hash",
        refreshTokenHash: "new-refresh-token-hash",
        expiresAt: new Date("2026-07-13T00:00:00.000Z")
      })
    ).resolves.toBe(false);
  });
});
