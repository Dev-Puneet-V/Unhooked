import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

const verifyIdToken = vi.fn();

vi.mock("google-auth-library", () => ({
  OAuth2Client: vi.fn(function OAuth2Client() {
    return {
      verifyIdToken
    };
  })
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn()
  }
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(() => "access-token"),
    verify: vi.fn()
  }
}));

vi.mock("../../../../config/environment.js", () => ({
  default: {
    GOOGLE_WEB_CLIENT_ID: "google-web-client-id",
    JWT_ACCESS_SECRET: "jwt-secret"
  }
}));

vi.mock("../../auth.repository.js", () => ({
  createEmailUser: vi.fn(),
  createGoogleUser: vi.fn(),
  createLoginSession: vi.fn(),
  findActiveSessionByRefreshTokenHash: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  revokeSessionByRefreshTokenHash: vi.fn(),
  rotateRefreshToken: vi.fn(),
  usernameExists: vi.fn()
}));

const repository = await import("../../auth.repository.js");
const service = await import("../../auth.service.js");

const user = {
  id: 1,
  email: "puneet@example.com",
  name: null,
  password_hash: "password-hash",
  username: "puneet"
};

const session = {
  id: 10,
  user_id: user.id,
  device_id: "device-id"
};

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repository.usernameExists).mockResolvedValue(false);
    vi.mocked(repository.createLoginSession).mockResolvedValue(session);
    vi.mocked(bcrypt.hash).mockResolvedValue("new-password-hash" as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  it("logs in an existing email user and creates an app session", async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(user);

    const response = await service.loginWithEmail({
      email: user.email,
      password: "password123"
    });

    expect(bcrypt.compare).toHaveBeenCalledWith("password123", "password-hash");
    expect(repository.createEmailUser).not.toHaveBeenCalled();
    expect(repository.createLoginSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id
      })
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      {
        sid: String(session.id),
        did: session.device_id
      },
      "jwt-secret",
      expect.objectContaining({
        subject: String(user.id)
      })
    );
    expect(response).toEqual({
      accessToken: "access-token",
      refreshToken: expect.any(String),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username
      }
    });
  });

  it("rejects email login when password is wrong", async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(user);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.loginWithEmail({
        email: user.email,
        password: "wrong-password"
      })
    ).rejects.toThrow("Invalid credentials");

    expect(repository.createLoginSession).not.toHaveBeenCalled();
  });

  it("creates a new email user when no account exists", async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(undefined);
    vi.mocked(repository.createEmailUser).mockResolvedValue({
      ...user,
      password_hash: "new-password-hash",
      username: "puneet1234"
    });

    await service.loginWithEmail({
      email: user.email,
      password: "password123"
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(repository.createEmailUser).toHaveBeenCalledWith({
      email: user.email,
      passwordHash: "new-password-hash",
      username: expect.stringMatching(/^puneet[a-f0-9]{4}$/)
    });
  });

  it("rejects Google login when email is not verified", async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: user.email,
        email_verified: false
      })
    });

    await expect(service.loginWithGoogle("google-id-token")).rejects.toThrow(
      "Google account email is not verified"
    );

    expect(repository.createGoogleUser).not.toHaveBeenCalled();
  });

  it("creates a Google user from a verified Google token", async () => {
    vi.mocked(repository.findUserByEmail).mockResolvedValue(undefined);
    vi.mocked(repository.createGoogleUser).mockResolvedValue({
      ...user,
      name: "Puneet",
      password_hash: null
    });
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: "  PUNEET@example.com ",
        email_verified: true,
        name: "Puneet"
      })
    });

    await service.loginWithGoogle("google-id-token");

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: "google-id-token",
      audience: "google-web-client-id"
    });
    expect(repository.createGoogleUser).toHaveBeenCalledWith({
      email: user.email,
      name: "Puneet",
      username: expect.stringMatching(/^puneet[a-f0-9]{4}$/)
    });
  });

  it("rotates refresh token for an active refresh session", async () => {
    vi.mocked(repository.findActiveSessionByRefreshTokenHash).mockResolvedValue(
      session
    );
    vi.mocked(repository.findUserById).mockResolvedValue(user);

    await service.refreshAuthTokens("refresh-token");

    expect(repository.findActiveSessionByRefreshTokenHash).toHaveBeenCalledWith(
      hashToken("refresh-token")
    );
    expect(repository.rotateRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionId: session.id
      })
    );
  });

  it("returns the authenticated user without password fields", async () => {
    vi.mocked(repository.findUserById).mockResolvedValue(user);

    await expect(
      service.getAuthenticatedUser({
        userId: user.id,
        sessionId: session.id,
        deviceId: session.device_id
      })
    ).resolves.toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username
    });
  });

  it("hashes refresh token before logout", async () => {
    await service.logoutWithRefreshToken("refresh-token");

    expect(repository.revokeSessionByRefreshTokenHash).toHaveBeenCalledWith(
      hashToken("refresh-token")
    );
  });
});
