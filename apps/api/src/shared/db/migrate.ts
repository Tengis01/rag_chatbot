import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "./db.js";

/**
 * Minimal SQL migration runner, executed at API startup (before listen).
 *
 * - `infra/postgres/init/` is the fresh-volume bootstrap ONLY (runs once via
 *   the postgres docker-entrypoint). It is frozen — do not edit it for
 *   schema changes anymore.
 * - All incremental schema changes live in `infra/postgres/migrations/` as
 *   ordered `NNN_name.sql` files (numbering continues after init: 003+).
 *   They are applied here exactly once, tracked in `schema_migrations`,
 *   each inside its own transaction.
 *
 * This is what makes production schema changes possible WITHOUT
 * `docker compose down -v` (which destroys all data).
 */

// apps/api/src/shared/db/ → repo root is five levels up.
// Holds for local dev (repo checkout) and containers (bind mount / COPY at /app).
const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../infra/postgres/migrations"
);

export async function runMigrations(): Promise<void> {
  let files: string[];
  try {
    files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  } catch (err) {
    if (process.env.NODE_ENV === "production" || (err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    console.warn(`[migrate] migrations dir not found (${MIGRATIONS_DIR}) — skipping`);
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await db.query<{ name: string }>("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`[migrate] applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`[migrate] ${file} failed: ${(err as Error).message}`);
    } finally {
      client.release();
    }
  }
}
