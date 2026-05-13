import { describe, expect, it } from "vitest";

import {
  emailAuthSchema,
  googleAuthSchema,
  refreshTokenSchema
} from "../../auth.validation.js";

describe("auth validation", () => {
  it("normalizes valid email login input", () => {
    const result = emailAuthSchema.parse({
      email: "  PUNEET@Example.COM  ",
      password: "password123"
    });

    expect(result).toEqual({
      email: "puneet@example.com",
      password: "password123"
    });
  });

  it("rejects weak email login input", () => {
    expect(() =>
      emailAuthSchema.parse({
        email: "not-an-email",
        password: "short"
      })
    ).toThrow();
  });

  it("rejects email login input that is too long", () => {
    expect(() =>
      emailAuthSchema.parse({
        email: `${"a".repeat(245)}@example.com`,
        password: "password123"
      })
    ).toThrow();

    expect(() =>
      emailAuthSchema.parse({
        email: "puneet@example.com",
        password: "x".repeat(129)
      })
    ).toThrow();
  });

  it("requires a non-empty Google id token", () => {
    expect(() => googleAuthSchema.parse({ idToken: "   " })).toThrow();
    expect(googleAuthSchema.parse({ idToken: " token " })).toEqual({
      idToken: "token"
    });
  });

  it("requires refresh tokens to be long enough", () => {
    expect(() => refreshTokenSchema.parse({ refreshToken: "too-short" })).toThrow();
    expect(
      refreshTokenSchema.parse({
        refreshToken: "x".repeat(32)
      })
    ).toEqual({
      refreshToken: "x".repeat(32)
    });
  });
});
