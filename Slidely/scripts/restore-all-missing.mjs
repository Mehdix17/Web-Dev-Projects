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

// TRIPLY - Travel Agency with all 10 slides
const triply = {
  slug: "triply",
  title: "TRIPLY - Travel Agency",
  category: "Pitch Deck",
  date: 2026,
  client: "Travel & Booking Platform",
  thumbnail:
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/thumbnail-1775152754454-99b81b82-8482-45dc-8482-d5a9b0d440c4.png",
  pdf_url: "",
  summary:
    "A modern travel agency platform offering flights, hotel stays, and complete travel management solutions. Features intuitive search, real-time booking, and comprehensive trip planning tools.",
  slides: [
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152830989-13c3903a-2d7c-4492-bd6c-323fec5d9b63.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152832357-9ca51414-5057-4907-a590-20e1a78ca463.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152833657-c202fdfd-bf69-42d0-8014-a4f745c21acc.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152834924-e7f8b95d-bdac-4b06-94a1-8022e2182ccf.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152836123-2ad4b94f-f1c6-4d4f-8894-e2fc2b1ed7c9.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152837628-de06c12e-85c1-4fe0-9897-cac6e9c77e71.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152838976-0a86dacb-f620-46e0-a8d2-4f3cefb444d9.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152840116-5d7ba96a-788a-4eb2-af80-2efac79bf1b9.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152841667-b1b2ab82-1428-415f-a0d6-72ea5b09a710.jpg",
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/slide-1775152843937-eee0d92a-1a79-42b2-bb61-9e36f12a1ea6.jpg",
  ],
};

// Japan - Country Guide
const japan = {
  slug: "japan",
  title: "Japan Country Guide",
  category: "Educational",
  date: 2026,
  client: "Travel & Education",
  thumbnail:
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/thumbnail-1775094497028-29571e33-edfe-4768-a47b-87a495deb221.png",
  pdf_url: "",
  summary:
    "Comprehensive guide to Japan covering geography, culture, attractions, and travel tips. Designed as an educational resource for travelers and culture enthusiasts interested in Japanese history and contemporary culture.",
  slides: [],
};

async function restoreWorks() {
  try {
    console.log("Restoring missing works to database...\n");

    const works = [triply, japan];

    for (const work of works) {
      // Check if already exists
      const existing = await sql`
        SELECT slug FROM works WHERE slug = ${work.slug}
      `;

      if (existing.length > 0) {
        console.log(`⚠️  ${work.title} already exists, skipping...`);
        continue;
      }

      console.log(`📦 Inserting: ${work.title}`);

      await sql`
        INSERT INTO works (
          slug, title, category, date, client, 
          thumbnail, pdf_url, summary, slides
        ) VALUES (
          ${work.slug},
          ${work.title},
          ${work.category},
          ${work.date},
          ${work.client},
          ${work.thumbnail},
          ${work.pdf_url},
          ${work.summary},
          ${work.slides}
        )
      `;

      console.log(`   ✅ Successfully inserted`);
      console.log(`      - Slug: ${work.slug}`);
      console.log(`      - Slides: ${work.slides.length}\n`);
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

    const triplyRestored = allWorks.find((w) => w.slug === "triply");
    const japanRestored = allWorks.find((w) => w.slug === "japan");

    if (triplyRestored && japanRestored) {
      console.log("\n✨ Both TRIPLY and Japan successfully restored!");
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
