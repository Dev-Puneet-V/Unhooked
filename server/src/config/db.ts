import {Pool, type PoolConfig} from "pg";
import ENV_VARIABLES_CONFIG from "./environment.js";

const shouldUseSsl =
  ENV_VARIABLES_CONFIG.POSTGRES_SSL || ENV_VARIABLES_CONFIG.DATABASE_URL?.includes("sslmode=require");

const poolConfig: PoolConfig = ENV_VARIABLES_CONFIG.DATABASE_URL
  ? {
      connectionString: ENV_VARIABLES_CONFIG.DATABASE_URL
    }
  : {
      host: ENV_VARIABLES_CONFIG.POSTGRES_HOST,
      password: ENV_VARIABLES_CONFIG.POSTGRES_PASSWORD,
      port: ENV_VARIABLES_CONFIG.POSTGRES_PORT,
      database: ENV_VARIABLES_CONFIG.POSTGRES_DB,
      user: ENV_VARIABLES_CONFIG.POSTGRES_USER
    };

if (shouldUseSsl) {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

export const pool = new Pool(poolConfig);

pool.on('error', (err, _) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1);
});
