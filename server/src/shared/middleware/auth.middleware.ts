import type { NextFunction, Request, Response } from "express";

import type { AuthContextDto } from "../../modules/auth/auth.dto.js";
import { verifyAccessToken } from "../../modules/auth/auth.service.js";

export interface AuthenticatedRequest extends Request {
  auth: AuthContextDto;
}

const bearerPrefix = "Bearer ";

export const authenticateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorizationHeader = req.header("authorization");

    if (!authorizationHeader?.startsWith(bearerPrefix)) {
      res.status(401).json({
        message: "Access token is required"
      });
      return;
    }

    const accessToken = authorizationHeader.slice(bearerPrefix.length).trim();
    const auth = verifyAccessToken(accessToken);

    (req as AuthenticatedRequest).auth = auth;
    next();
  } catch {
    res.status(401).json({
      message: "Access token is invalid"
    });
  }
};
