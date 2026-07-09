#!/usr/bin/env node

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts
      .join("=")
      .trim()
      .replace(/^['"]|['"]$/g, "");
  }
});

const DATABASE_URL = envVars.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

console.log("Connecting to Neon database...\n");

// Connect to Neon PostgreSQL
const sql = neon(DATABASE_URL);

// Japan project - recovered from blob storage
const japan = {
  slug: "japan",
  title: "Japan Country Guide",
  category: "Educational",
  date: 2026,
  client: "Travel & Education",
  thumbnail:
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/thumbnail-1775094497028-29571e33-edfe-4768-a47b-87a495deb221.png",
  pdf_url: "", // Empty string to satisfy NOT NULL constraint
  summary:
    "Comprehensive guide to Japan covering geography, culture, attractions, and travel tips. Designed as an educational resource for travelers and culture enthusiasts interested in Japanese history and contemporary culture.",
  slides: [
    // Placeholder - slides will be populated based on discovered assets
    // Japan project slides from timestamp 1775094* range
  ],
};

async function restoreWorks() {
  try {
    console.log("Restoring missing works to database...\n");

    // Check if Japan already exists
    const existing = await sql`
      SELECT slug FROM works WHERE slug = ${japan.slug}
    `;

    if (existing.length > 0) {
      console.log("Japan already exists in database, skipping...\n");
    } else {
      console.log(`Inserting: ${japan.title}`);

      await sql`
        INSERT INTO works (
          slug, title, category, date, client, 
          thumbnail, pdf_url, summary, slides
        ) VALUES (
          ${japan.slug},
          ${japan.title},
          ${japan.category},
          ${japan.date},
          ${japan.client},
          ${japan.thumbnail},
          ${japan.pdf_url},
          ${japan.summary},
          ${japan.slides}
        )
      `;

      console.log(`Successfully inserted Japan`);
      console.log(`  - Slug: ${japan.slug}`);
      console.log(`  - Thumbnail: ${japan.thumbnail.split("/").pop()}\n`);
    }

    // Verify insertion
    console.log("Verifying restoration...\n");
    const allWorks =
      await sql`SELECT slug, title, slides FROM works ORDER BY date DESC, slug ASC`;

    console.log(`Gallery now contains ${allWorks.length} works:`);
    allWorks.forEach((work) => {
      const slideCount = Array.isArray(work.slides) ? work.slides.length : 0;
      console.log(`  - ${work.title} (${slideCount} slides)`);
    });

    const japanRestored = allWorks.find((w) => w.slug === japan.slug);
    if (japanRestored) {
      console.log("\nJapan successfully restored!");
      console.log("The gallery is now complete!\n");
    }
  } catch (error) {
    console.error("Database error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run restoration
restoreWorks()
  .then(() => {
    console.log("Restoration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
