import express from "express";

import {
  createQuizController,
  deleteQuizController,
  getQuizByIdController
} from "./quiz.controller.js";
import {
  authenticateAccessToken,
  authorizeRole
} from "../../shared/middleware/auth.middleware.js";
import { AUTH_ROLES } from "../auth/auth.constants.js";

const router = express.Router();

router.post(
  "/",
  authenticateAccessToken,
  authorizeRole(AUTH_ROLES.admin),
  createQuizController
);
router.get(
  "/:id",
  authenticateAccessToken,
  getQuizByIdController
)
router.delete(
  "/:id",
  authenticateAccessToken,
  authorizeRole(AUTH_ROLES.admin),
  deleteQuizController
);

export default router;
