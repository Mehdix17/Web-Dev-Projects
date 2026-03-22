import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { works as worksTable, type WorkRow } from "@/lib/db/schema";
import { projects } from "@/lib/site-data";
import type { ManagedWork, WorkCategory } from "@/lib/work-types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "works.json");

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function toManagedWork(project: (typeof projects)[number]): ManagedWork {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    year: project.year,
    client: project.client,
    role: project.role,
    featured: false,
    thumbnail: project.thumbnail,
    pdfUrl: "",
    summary: project.challenge[0],
    slides: project.solutionImages.map((item) => item.src),
  };
}

const seedWorks: ManagedWork[] = projects.map(toManagedWork);

function sanitizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeSlides(slides: string[]) {
  const unique = Array.from(
    new Set(slides.map((value) => value.trim()).filter(Boolean)),
  );
  return unique;
}

type RawWork = Partial<ManagedWork> & {
  heroImage?: string;
  slides?: string[];
};

function normalizeStoredWork(raw: RawWork): ManagedWork {
  const normalized = normalizeWorkPayload(raw);
  const normalizedSlides = Array.isArray(raw.slides)
    ? normalizeSlides(raw.slides)
    : undefined;

  return {
    ...normalized,
    slides: normalizedSlides,
  };
}

function mapDbWorkToManagedWork(work: WorkRow): ManagedWork {
  const normalizedSlides = normalizeSlides(work.slides || []);

  return {
    slug: work.slug,
    title: work.title,
    category: work.category as WorkCategory,
    year: work.year,
    client: work.client,
    role: work.role,
    featured: Boolean(work.featured),
    thumbnail: work.thumbnail,
    pdfUrl: work.pdfUrl,
    summary: work.summary,
    slides: normalizedSlides.length ? normalizedSlides : undefined,
  };
}

export function normalizeWorkPayload(
  payload: Partial<ManagedWork>,
): ManagedWork {
  const category = payload.category as WorkCategory;
  const baseSlug = payload.slug || payload.title || "untitled-work";

  return {
    slug: sanitizeSlug(baseSlug),
    title: (payload.title || "Untitled work").trim(),
    category,
    year: Number(payload.year) || new Date().getFullYear(),
    client: (payload.client || "Confidential client").trim(),
    role: (payload.role || "Presentation Designer").trim(),
    featured: Boolean(payload.featured),
    thumbnail: (payload.thumbnail || "").trim(),
    pdfUrl: (payload.pdfUrl || "").trim(),
    summary: (
      payload.summary ||
      "Presentation crafted with strategic storytelling and visual clarity."
    ).trim(),
    slides: Array.isArray(payload.slides)
      ? normalizeSlides(payload.slides)
      : undefined,
  };
}

async function ensureSeedFile() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(seedWorks, null, 2), "utf-8");
  }
}

export async function getWorks(): Promise<ManagedWork[]> {
  if (hasDatabaseUrl()) {
    const works = await db
      .select()
      .from(worksTable)
      .orderBy(desc(worksTable.updatedAt), desc(worksTable.createdAt));
    return works.map(mapDbWorkToManagedWork);
  }

  await ensureSeedFile();
  const raw = await fs.readFile(dataFile, "utf-8");
  const parsed = JSON.parse(raw) as RawWork[];
  return parsed.map(normalizeStoredWork);
}

export async function saveWorks(works: ManagedWork[]) {
  if (hasDatabaseUrl()) {
    await db.delete(worksTable);

    if (works.length > 0) {
      await db.insert(worksTable).values(
        works.map((work) => ({
          slug: work.slug,
          title: work.title,
          category: work.category,
          year: work.year,
          client: work.client,
          role: work.role,
          featured: Boolean(work.featured),
          thumbnail: work.thumbnail,
          pdfUrl: work.pdfUrl,
          summary: work.summary,
          slides: normalizeSlides(work.slides || []),
        })),
      );
    }
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(works, null, 2), "utf-8");
}

export async function getWorkBySlug(slug: string) {
  if (hasDatabaseUrl()) {
    const rows = await db
      .select()
      .from(worksTable)
      .where(eq(worksTable.slug, slug))
      .limit(1);
    const row = rows[0];
    return row ? mapDbWorkToManagedWork(row) : undefined;
  }

  const works = await getWorks();
  return works.find((work) => work.slug === slug);
}
