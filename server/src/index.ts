import express from "express";
import ENV_VARIABLES_CONFIG from "./config/environment.js";
import { pool } from "./config/db.js";
import authRouter from "./modules/auth/auth.route.js";

const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRouter);
// (async () => {
// await pool.query(`
    
// `);
// })()

app.listen(ENV_VARIABLES_CONFIG.PORT, () => {
  console.log(`Server is running on port ${ENV_VARIABLES_CONFIG.PORT}`);
});
