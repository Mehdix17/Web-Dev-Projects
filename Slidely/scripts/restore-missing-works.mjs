#!/usr/bin/env node

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import crypto from "crypto";

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

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://slidely.vercel.app"
    : "http://localhost:3000";
const ADMIN_USERNAME = envVars.ADMIN_USERNAME;
const ADMIN_PASSWORD_HASH = envVars.ADMIN_PASSWORD_HASH;
const ADMIN_PASSWORD_SALT = envVars.ADMIN_PASSWORD_SALT;

// For now, we need the actual password. This script would normally be run in environment where password is available
// Or we can use the login/session approach instead

// Prompt user for password if not available (development only)
const PASSWORD_TO_TRY = process.argv[2] || "admin"; // Pass password as argument for testing

console.log("🔐 Admin Authentication Required");
console.log(`📝 Username: ${ADMIN_USERNAME}`);
console.log(
  `🔑 Password: ${PASSWORD_TO_TRY === "admin" ? "(using default)" : "(provided)"}`,
);

// Work definitions recovered from blob storage
const triply = {
  slug: "triply",
  title: "TRIPLY - Travel Agency",
  category: "Pitch Deck",
  year: 2026,
  client: "Travel & Booking Platform",
  role: "Product & Brand Design",
  featured: false,
  thumbnail:
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/thumbnail-1775152754454-99b81b82-8482-45dc-8482-d5a9b0d440c4.png",
  pdfUrl: null, // No PDF found in traces
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

// Placeholder for second project - needs visual identification
const secondProject = {
  slug: "japan-country-guide",
  title: "Japan Country Guide",
  category: "Educational",
  year: 2026,
  client: "Travel Education",
  role: "Content Design",
  featured: false,
  thumbnail:
    "https://d4ezrm8jsvfsnnqa.public.blob.vercel-storage.com/uploads/works/thumbnail-1775094497028-29571e33-edfe-4768-a47b-87a495deb221.png",
  pdfUrl: null,
  summary:
    "Comprehensive guide to Japan covering geography, culture, attractions, and travel tips. Designed as an educational resource for travelers and culture enthusiasts.",
  slides: [
    // Note: Slides for 1775094* project would go here - not yet enumerated
  ],
};

async function restoreWorks() {
  console.log("🔄 Starting work restoration...\n");
  console.log(`🔒 Using API: ${API_BASE_URL}`);
  console.log(`👤 Admin user: ${ADMIN_USERNAME}\n`);

  const works = [triply]; // Start with TRIPLY for testing

  for (const work of works) {
    console.log(`📦 Restoring: ${work.title}`);

    try {
      // Create basic auth header
      const authHeader = Buffer.from(
        `${ADMIN_USERNAME}:${adminPassword}`,
      ).toString("base64");

      const response = await fetch(`${API_BASE_URL}/api/admin/works`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify(work),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(
          `   ❌ Failed (${response.status}): ${error.substring(0, 150)}`,
        );
        continue;
      }

      const restored = await response.json();
      console.log(`   ✅ Successfully restored`);
      console.log(`      - Slug: ${restored.slug}`);
      console.log(`      - Slides: ${restored.slides?.length || 0}`);
      console.log();
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log("✨ Restoration complete!\n");
  console.log("🧪 Testing gallery access...");

  try {
    const galleryResponse = await fetch(`${API_BASE_URL}/api/works`);
    if (galleryResponse.ok) {
      const allWorks = await galleryResponse.json();
      console.log(`   📊 Gallery now contains ${allWorks.length} works`);
      const triplyInGallery = allWorks.find((w) => w.slug === "triply");
      if (triplyInGallery) {
        console.log(`   ✅ TRIPLY successfully appears in gallery`);
      }
    }
  } catch (error) {
    console.error(`   ⚠️  Could not verify: ${error.message}`);
  }
}

// Run restoration
restoreWorks().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
