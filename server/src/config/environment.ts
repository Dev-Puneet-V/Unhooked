import dotenv from "dotenv";

dotenv.config({
  path: new URL(`../shared/environment/.env.${process.env.NODE_ENV}`, import.meta.url)
});

interface EnvConfigType {
  PORT?: String;
  DATABASE_URL?: String;
}

const ENV_VARIABLES_CONFIG: EnvConfigType = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL
};

export default ENV_VARIABLES_CONFIG;

