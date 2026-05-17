import dotenv from "dotenv";

dotenv.config({
  path: new URL(`../shared/environment/.env.${process.env.NODE_ENV}`, import.meta.url)
});

interface EnvConfigType {
  PORT?: string;
  DATABASE_URL?: string;
  POSTGRES_HOST?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
  POSTGRES_PORT?: number;
  POSTGRES_SSL?: boolean;
  GOOGLE_WEB_CLIENT_ID?: string;
  JWT_ACCESS_SECRET?: string;
}

const optionalNumber = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  return Number(value);
};

const optionalBoolean = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  return value.toLowerCase() === "true";
};

const ENV_VARIABLES_CONFIG: EnvConfigType = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: optionalNumber(process.env.POSTGRES_PORT),
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_DB: process.env.POSTGRES_DB,
  POSTGRES_SSL: optionalBoolean(process.env.POSTGRES_SSL),
  GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET
};

export default ENV_VARIABLES_CONFIG;

