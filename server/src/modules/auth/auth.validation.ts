import { z } from 'zod';

export const emailAuthSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(20)
});

export const googleAuthSchema = z.object({
  idToken: z.string().trim().min(1)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(32)
});
