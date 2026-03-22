import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

function readDatabaseUrlFromEnvLocal() {
  const envLocalPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envLocalPath)) return "";

  const content = readFileSync(envLocalPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (!trimmed.startsWith("DATABASE_URL=")) continue;

    const rawValue = trimmed.slice("DATABASE_URL=".length).trim();
    if (!rawValue) return "";

    if (
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
    ) {
      return rawValue.slice(1, -1);
    }

    return rawValue;
  }

  return "";
}

const databaseUrl = process.env.DATABASE_URL || readDatabaseUrlFromEnvLocal();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
