import { readFile } from "node:fs/promises";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

function sanitizeSlug(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeSlides(slides) {
  if (!Array.isArray(slides)) return [];
  return [
    ...new Set(slides.map((value) => String(value).trim()).filter(Boolean)),
  ];
}

function normalizeRecord(record) {
  const baseSlug = record.slug || record.title || "untitled-work";

  return {
    slug: sanitizeSlug(baseSlug),
    title: String(record.title || "Untitled work").trim(),
    category: String(record.category || "Pitch Decks").trim(),
    date: String(record.date || record.year || new Date().getFullYear()).trim(),
    client: String(record.client || "Confidential client").trim(),
    thumbnail: String(record.thumbnail || "").trim(),
    pdfUrl: String(record.pdfUrl || "").trim(),
    summary: String(
      record.summary ||
        "Presentation crafted with strategic storytelling and visual clarity.",
    ).trim(),
    slides: normalizeSlides(record.slides),
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Aborting migration.");
  }

  const sql = neon(process.env.DATABASE_URL);

  const dataFile = path.join(process.cwd(), "data", "works.json");
  const raw = await readFile(dataFile, "utf-8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("data/works.json must contain an array of works.");
  }

  const works = parsed.map(normalizeRecord);

  await sql`DELETE FROM works`;

  for (const work of works) {
    await sql`
      INSERT INTO works (
        slug, title, category, date, client, thumbnail, pdf_url, summary, slides
      )
      VALUES (
        ${work.slug},
        ${work.title},
        ${work.category},
        ${work.date},
        ${work.client},
        ${work.thumbnail},
        ${work.pdfUrl},
        ${work.summary},
        ${work.slides}
      )
    `;
  }

  console.log(`Imported ${works.length} works into database.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
