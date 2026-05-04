import {Pool} from "pg";
import ENV_VARIABLES_CONFIG from "./environment.js";

export const pool = new Pool({
    password: ENV_VARIABLES_CONFIG.POSTGRES_PASSWORD,
    port: ENV_VARIABLES_CONFIG.POSTGRES_PORT,
    database: ENV_VARIABLES_CONFIG.POSTGRES_DB,
    user: ENV_VARIABLES_CONFIG.POSTGRES_USER
});

pool.on('error', (err, _) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1);
});