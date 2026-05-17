import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../config/db.js";

const MIGRATIONS_DIR = path.join(process.cwd(), "db_table_change");

const getMigrationSortValue = (fileName: string) => {
  const match = fileName.match(/^(\d{1,2})-(\d{1,2})-(\d{2})/);

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [, day, month, year] = match;
  return Number(`20${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`);
};

const listMigrationFiles = async () => {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => {
      const dateDiff = getMigrationSortValue(left) - getMigrationSortValue(right);

      if (dateDiff !== 0) {
        return dateDiff;
      }

      return left.localeCompare(right);
    });
};

const ensureMigrationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const getAppliedMigrations = async () => {
  const result = await pool.query<{ name: string }>("SELECT name FROM schema_migrations");
  return new Set(result.rows.map((row) => row.name));
};

const baselineMigrations = async (migrationFiles: string[]) => {
  if (process.argv[2] !== "--baseline") {
    return false;
  }

  for (const fileName of migrationFiles) {
    await pool.query(
      "INSERT INTO schema_migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      [fileName]
    );
  }

  console.log(`Baselined ${migrationFiles.length} migrations.`);
  return true;
};

const applyMigration = async (fileName: string) => {
  const client = await pool.connect();
  const migrationSql = await readFile(path.join(MIGRATIONS_DIR, fileName), "utf8");

  try {
    await client.query("BEGIN");
    await client.query(migrationSql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [fileName]);
    await client.query("COMMIT");
    console.log(`Applied migration: ${fileName}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const run = async () => {
  await ensureMigrationsTable();

  const migrationFiles = await listMigrationFiles();

  if (await baselineMigrations(migrationFiles)) {
    return;
  }

  const appliedMigrations = await getAppliedMigrations();
  const pendingMigrations = migrationFiles.filter((fileName) => !appliedMigrations.has(fileName));

  if (pendingMigrations.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  for (const fileName of pendingMigrations) {
    await applyMigration(fileName);
  }
};

run()
  .catch((error: unknown) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
