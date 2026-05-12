import type { z } from "zod";

import type {
  emailAuthSchema,
  googleAuthSchema,
  refreshTokenSchema
} from "./auth.validation.js";

export type EmailLoginRequestDto = z.infer<typeof emailAuthSchema>;

export type GoogleLoginRequestDto = z.infer<typeof googleAuthSchema>;

export type RefreshTokenRequestDto = z.infer<typeof refreshTokenSchema>;

export interface AuthUserDto {
  id: number;
  email: string;
  name: string | null;
  username: string;
}

export interface AuthContextDto {
  userId: number;
  sessionId: number;
  deviceId: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}
