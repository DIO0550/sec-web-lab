import { serve } from "@hono/node-server";
import app from "./app.js";
import { SERVER_PORT } from "./config.js";

serve(
  {
    fetch: app.fetch,
    port: SERVER_PORT,
  },
  (info) => {
    console.log(`Server listening on http://localhost:${info.port}`);
  }
);
