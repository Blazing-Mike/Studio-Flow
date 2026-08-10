// Minimal .env loader (no external dependency). Loads artifacts/api-server/.env
// into process.env without overriding values already set in the environment.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
try {
  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  }
} catch {
  /* ignore env loading errors */
}

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
