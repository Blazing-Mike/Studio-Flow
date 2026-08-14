// MUST be the first import: loads .env before any other module (e.g. the DB
// client) reads process.env at module scope.
import "./env";

import app from "./app";
import { logger } from "./lib/logger";
import { initializeStudioflowDatabase } from "./lib/studioflow-repository";

const rawPort = process.env["PORT"] ?? "5000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

initializeStudioflowDatabase()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Unable to initialize StudioFlow database");
    process.exit(1);
  });
