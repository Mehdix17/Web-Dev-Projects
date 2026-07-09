import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

function readDatabaseUrlFromEnvFile() {
  try {
    const envText = readFileSync(".env.local", "utf8");
    for (const rawLine of envText.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIndex = line.indexOf("=");
      if (eqIndex <= 0) continue;
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim();
      if (key === "DATABASE_URL") return value;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  readDatabaseUrlFromEnvFile();

if (!databaseUrl) {
  console.error("No database URL found in env vars.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const rows = await sql`
  select slug, title, category, date, client, featured
  from works
  order by created_at desc
  limit 100
`;

console.log(JSON.stringify(rows, null, 2));
