import dotenv from "dotenv";

dotenv.config({
  path: new URL(`../shared/environment/.env.${process.env.NODE_ENV}`, import.meta.url)
});

interface EnvConfigType {
  PORT?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
  POSTGRES_PORT?: number;
}

const ENV_VARIABLES_CONFIG: EnvConfigType = {
  PORT: process.env.PORT,
  POSTGRES_PORT: Number(process.env.POSTGRES_PORT),
  POSTGRES_PASSWORD: String(process.env.POSTGRES_PASSWORD),
  POSTGRES_USER: String(process.env.POSTGRES_USER),
  POSTGRES_DB: String(process.env.POSTGRES_DB)
};

export default ENV_VARIABLES_CONFIG;

