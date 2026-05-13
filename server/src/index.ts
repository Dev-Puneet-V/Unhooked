import ENV_VARIABLES_CONFIG from "./config/environment.js";
import { createApp } from "./app.js";

const app = createApp();
// (async () => {
// await pool.query(`
// `);
// })()

app.listen(ENV_VARIABLES_CONFIG.PORT, () => {
  console.log(`Server is running on port ${ENV_VARIABLES_CONFIG.PORT}`);
});
