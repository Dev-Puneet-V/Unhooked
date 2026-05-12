import type { Request, Response } from "express";

import type {
  GoogleLoginRequestDto,
  RefreshTokenRequestDto
} from "./auth.dto.js";
import { googleAuthSchema, refreshTokenSchema } from "./auth.validation.js";
import {
  getAuthenticatedUser,
  loginWithGoogle,
  logoutWithRefreshToken,
  refreshAuthTokens
} from "./auth.service.js";
import type { AuthenticatedRequest } from "../../shared/middleware/auth.middleware.js";

export const googleLoginController = async (req: Request, res: Response) => {
  try {
    const body: GoogleLoginRequestDto = googleAuthSchema.parse(req.body);
    const response = await loginWithGoogle(body.idToken);

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({
      message: "Google sign-in failed"
    });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const body: RefreshTokenRequestDto = refreshTokenSchema.parse(req.body);
    const response = await refreshAuthTokens(body.refreshToken);

    res.status(200).json(response);
  } catch (error) {
    res.status(401).json({
      message: "Refresh token is invalid"
    });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    const body: RefreshTokenRequestDto = refreshTokenSchema.parse(req.body);

    await logoutWithRefreshToken(body.refreshToken);

    res.status(204).send();
  } catch {
    res.status(400).json({
      message: "Logout failed"
    });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUser((req as AuthenticatedRequest).auth);

    res.status(200).json({
      user
    });
  } catch {
    res.status(401).json({
      message: "Access token is invalid"
    });
  }
};
