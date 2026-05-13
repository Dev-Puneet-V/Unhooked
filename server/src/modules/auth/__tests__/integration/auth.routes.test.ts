import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../auth.service.js", () => ({
  getAuthenticatedUser: vi.fn(),
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logoutWithRefreshToken: vi.fn(),
  refreshAuthTokens: vi.fn(),
  verifyAccessToken: vi.fn()
}));

const authService = await import("../../auth.service.js");
const { createApp } = await import("../../../../app.js");

const app = createApp();

const authResponse = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: {
    id: 1,
    email: "puneet@example.com",
    name: null,
    username: "puneet"
  }
};

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logs in with email and validates request input", async () => {
    vi.mocked(authService.loginWithEmail).mockResolvedValue(authResponse);

    const response = await request(app)
      .post("/api/v1/auth/email")
      .send({
        email: "  PUNEET@Example.COM ",
        password: "password123"
      })
      .expect(200);

    expect(authService.loginWithEmail).toHaveBeenCalledWith({
      email: "puneet@example.com",
      password: "password123"
    });
    expect(response.body).toEqual(authResponse);
  });

  it("returns 401 when email login validation fails", async () => {
    const response = await request(app)
      .post("/api/v1/auth/email")
      .send({
        email: "invalid",
        password: "short"
      })
      .expect(401);

    expect(authService.loginWithEmail).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "Email sign-in failed"
    });
  });

  it("refreshes tokens with a valid refresh token", async () => {
    vi.mocked(authService.refreshAuthTokens).mockResolvedValue(authResponse);

    const refreshToken = "x".repeat(32);
    const response = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(200);

    expect(authService.refreshAuthTokens).toHaveBeenCalledWith(refreshToken);
    expect(response.body).toEqual(authResponse);
  });

  it("logs out with a valid refresh token", async () => {
    vi.mocked(authService.logoutWithRefreshToken).mockResolvedValue(undefined);

    const refreshToken = "x".repeat(32);
    await request(app)
      .post("/api/v1/auth/logout")
      .send({ refreshToken })
      .expect(204);

    expect(authService.logoutWithRefreshToken).toHaveBeenCalledWith(refreshToken);
  });

  it("returns the authenticated user for a valid bearer token", async () => {
    vi.mocked(authService.verifyAccessToken).mockReturnValue({
      userId: 1,
      sessionId: 2,
      deviceId: "device-id"
    });
    vi.mocked(authService.getAuthenticatedUser).mockResolvedValue(authResponse.user);

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer access-token")
      .expect(200);

    expect(authService.verifyAccessToken).toHaveBeenCalledWith("access-token");
    expect(authService.getAuthenticatedUser).toHaveBeenCalledWith({
      userId: 1,
      sessionId: 2,
      deviceId: "device-id"
    });
    expect(response.body).toEqual({
      user: authResponse.user
    });
  });

  it("requires a bearer token for the current user route", async () => {
    const response = await request(app).get("/api/v1/auth/me").expect(401);

    expect(authService.verifyAccessToken).not.toHaveBeenCalled();
    expect(response.body).toEqual({
      message: "Access token is required"
    });
  });
});
