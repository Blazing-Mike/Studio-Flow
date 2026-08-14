import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Serverless Postgres (e.g. Neon) terminates idle connections; without a
// handler that becomes an unhandled 'error' event that crashes the process.
pool.on("error", (err) => {
  console.error(`[db] pool error: ${err.message}`);
});
export const db = drizzle(pool, { schema });

export * from "./schema";
