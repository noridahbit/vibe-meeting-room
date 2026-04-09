import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "node:path";
import { mkdirSync } from "node:fs";
import * as schema from "./schema";

const DEFAULT_DATABASE_URL = "./data/mrbs.db";
const VERCEL_TMP_DIR = "/tmp";
const createDb = (client: Database.Database) =>
  drizzle(client, {
    schema,
  });

declare global {
  var __mrbsSqlite__: Database.Database | undefined;
  var __mrbsDb__: ReturnType<typeof createDb> | undefined;
}

function resolveDatabasePath(databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL) {
  if (databaseUrl.startsWith("file:")) {
    return new URL(databaseUrl).pathname;
  }

  if (path.isAbsolute(databaseUrl)) {
    return databaseUrl;
  }

  if (process.env.VERCEL === "1") {
    const relativePath = databaseUrl.replace(/^[./]+/, "");
    return path.join(VERCEL_TMP_DIR, relativePath);
  }

  return path.isAbsolute(databaseUrl)
    ? databaseUrl
    : path.join(/* turbopackIgnore: true */ process.cwd(), databaseUrl);
}

function createSqliteClient() {
  const databasePath = resolveDatabasePath();
  mkdirSync(path.dirname(databasePath), { recursive: true });

  const client = new Database(databasePath);
  client.pragma("journal_mode = WAL");
  client.pragma("foreign_keys = ON");

  return client;
}

export const sqlite = globalThis.__mrbsSqlite__ ?? createSqliteClient();

export const db = globalThis.__mrbsDb__ ?? createDb(sqlite);

if (process.env.NODE_ENV !== "production") {
  globalThis.__mrbsSqlite__ = sqlite;
  globalThis.__mrbsDb__ = db;
}

export { resolveDatabasePath };
