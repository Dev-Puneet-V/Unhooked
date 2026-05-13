import express from "express";

import authRouter from "./modules/auth/auth.route.js";

const router = express.Router();

router.use("/auth", authRouter);

export default router;
