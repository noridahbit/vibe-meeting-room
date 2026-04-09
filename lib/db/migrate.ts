import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db, resolveDatabasePath, sqlite } from "./index";

async function run() {
  const databasePath = resolveDatabasePath();

  migrate(db, {
    migrationsFolder: "drizzle",
  });

  console.log(`Database migrated: ${databasePath}`);
  sqlite.close();
}

run().catch((error) => {
  console.error("Database migration failed.");
  console.error(error);
  sqlite.close();
  process.exit(1);
});
