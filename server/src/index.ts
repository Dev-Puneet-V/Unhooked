import express from "express";
import ENV_VARIABLES_CONFIG from "./config/environment.js";
import { pool } from "./config/db.js";

const app = express();
// (async () => {
// await pool.query(`
    
// `);
// })()

app.listen(ENV_VARIABLES_CONFIG.PORT, () => {
  console.log(`Server is running on port ${ENV_VARIABLES_CONFIG.PORT}`);
});
