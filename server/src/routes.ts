import express from "express";

import authRouter from "./modules/auth/auth.route.js";
import quizRouter from "./modules/quiz/quiz.route.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/quizzes", quizRouter);

export default router;
