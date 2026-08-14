// Minimal .env loader (no external dependency). Loads artifacts/api-server/.env
// into process.env without overriding values already set in the environment.
//
// IMPORTANT: this module must be the FIRST import in the entry file. ESM
// hoists imports, so the loader has to live in a module that evaluates before
// anything that reads process.env (e.g. the database client at module scope).
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
