import express from "express";
import ENV_VARIABLES_CONFIG from "./config/environment.js";

const app = express();

app.listen(ENV_VARIABLES_CONFIG.PORT, () => {
  console.log(`Server is running on port ${ENV_VARIABLES_CONFIG.PORT}`);
});
