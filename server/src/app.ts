import express from "express";

import apiRouter from "./routes.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use("/api/v1", apiRouter);

  return app;
};
