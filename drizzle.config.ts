import { defineConfig } from "drizzle-kit";
import path from "node:path";

const DEFAULT_DATABASE_URL = "./data/mrbs.db";

function resolveDatabasePath(databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL) {
  if (databaseUrl.startsWith("file:")) {
    return new URL(databaseUrl).pathname;
  }

  return path.isAbsolute(databaseUrl)
    ? databaseUrl
    : path.join(/* turbopackIgnore: true */ process.cwd(), databaseUrl);
}

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveDatabasePath(),
  },
});
