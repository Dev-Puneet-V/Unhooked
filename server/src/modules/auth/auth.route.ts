import express from "express";
import {
  googleLoginController,
  logoutController,
  meController,
  refreshTokenController
} from "./auth.controller.js";
import { authenticateAccessToken } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.post("/google", googleLoginController);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);
router.get("/me", authenticateAccessToken, meController);

export default router;
