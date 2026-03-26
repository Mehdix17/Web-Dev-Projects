import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { desc, eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db/client";
import { works as worksTable, type WorkRow } from "@/lib/db/schema";
import { projects } from "@/lib/site-data";
import type { ManagedWork, WorkCategory } from "@/lib/work-types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "works.json");
let hasLoggedDbFallback = false;

const seedWorks: ManagedWork[] = projects.map(toManagedWork);

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function reportDatabaseFallback(error: unknown) {
  if (hasLoggedDbFallback) {
    return;
  }

  hasLoggedDbFallback = true;
  console.warn(
    "Database unavailable. Falling back to local works data.",
    error,
  );
}

function sanitizeSlug(input: unknown): string {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlides(slides: unknown[]): string[] {
  if (!Array.isArray(slides)) return [];

  return [
    ...new Set(slides.map((value) => String(value).trim()).filter(Boolean)),
  ];
}

function mapDbWorkToManagedWork(work: WorkRow): ManagedWork {
  return {
    slug: work.slug,
    title: work.title,
    category: work.category as WorkCategory,
    year: work.year,
    client: work.client,
    role: work.role,
    featured: Boolean(work.featured),
    featuredOrder: work.featured
      ? normalizeFeaturedOrder(work.featuredOrder)
      : null,
    thumbnail: work.thumbnail,
    pdfUrl: work.pdfUrl,
    summary: work.summary,
    slides:
      Array.isArray(work.slides) && work.slides.length
        ? work.slides
        : undefined,
  };
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
    featuredOrder: null,
    thumbnail: project.thumbnail,
    pdfUrl: "",
    summary: project.challenge[0],
    slides: project.solutionImages.map((item) => item.src),
  };
}

function normalizeFeaturedOrder(value: unknown): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return Math.floor(numeric);
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
    role: raw.role ?? normalized.role,
    featuredOrder: Boolean(raw.featured)
      ? normalizeFeaturedOrder(raw.featuredOrder)
      : null,
    thumbnail: raw.thumbnail ?? normalized.thumbnail,
    pdfUrl: raw.pdfUrl ?? normalized.pdfUrl,
    summary: raw.summary ?? normalized.summary,
    slides:
      normalizedSlides && normalizedSlides.length
        ? normalizedSlides
        : undefined,
  };
}

export function normalizeWorkPayload(
  payload: Partial<ManagedWork>,
): ManagedWork {
  const category = payload.category as WorkCategory;
  const baseSlug = payload.slug || payload.title || "untitled-work";
  const featured = Boolean(payload.featured);
  const featuredOrder = featured
    ? normalizeFeaturedOrder(payload.featuredOrder)
    : null;

  return {
    slug: sanitizeSlug(baseSlug),
    title: (payload.title || "Untitled work").trim(),
    category,
    year: Number(payload.year) || new Date().getFullYear(),
    client: (payload.client || "Confidential client").trim(),
    role: (payload.role || "Presentation Designer").trim(),
    featured,
    featuredOrder,
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

async function readWorksFromFile() {
  await ensureSeedFile();
  const raw = await fs.readFile(dataFile, "utf-8");
  const parsed = JSON.parse(raw) as RawWork[];
  return parsed.map(normalizeStoredWork);
}

async function readWorksFromSource(): Promise<ManagedWork[]> {
  if (!hasDatabaseUrl()) {
    console.warn("DATABASE_URL not set; reading works from local JSON");
    return readWorksFromFile();
  }

  try {
    const works = await db
      .select()
      .from(worksTable)
      .orderBy(desc(worksTable.updatedAt), desc(worksTable.createdAt));

    if (!works || works.length === 0) {
      console.warn("Neon database returned no works rows; check Neon contents");
    } else {
      console.info(`Loaded ${works.length} works from Neon database`);
    }

    return works.map(mapDbWorkToManagedWork);
  } catch (error) {
    console.error(
      "Neon database query failed; check connectivity and schema",
      error,
    );
    reportDatabaseFallback(error);
    return readWorksFromFile();
  }
}

const getCachedWorks = unstable_cache(readWorksFromSource, ["works-all"], {
  tags: ["works"],
  revalidate: 60,
});

export async function getWorks(): Promise<ManagedWork[]> {
  return getCachedWorks();
}

export function getFeaturedWorksInOrder(works: ManagedWork[]): ManagedWork[] {
  return works
    .filter((work) => work.featured)
    .sort((a, b) => {
      const aOrder = normalizeFeaturedOrder(a.featuredOrder);
      const bOrder = normalizeFeaturedOrder(b.featuredOrder);

      if (aOrder === null && bOrder === null) {
        return a.title.localeCompare(b.title);
      }
      if (aOrder === null) {
        return 1;
      }
      if (bOrder === null) {
        return -1;
      }
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return a.title.localeCompare(b.title);
    });
}

export function getNextFeaturedOrder(works: ManagedWork[]): number {
  const maxOrder = works.reduce((max, work) => {
    if (!work.featured) {
      return max;
    }

    const order = normalizeFeaturedOrder(work.featuredOrder);
    if (order === null) {
      return max;
    }

    return Math.max(max, order);
  }, -1);

  return maxOrder + 1;
}

export async function saveWorks(works: ManagedWork[]) {
  if (hasDatabaseUrl()) {
    try {
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
            featuredOrder: work.featured
              ? normalizeFeaturedOrder(work.featuredOrder)
              : null,
            thumbnail: work.thumbnail,
            pdfUrl: work.pdfUrl,
            summary: work.summary,
            slides: normalizeSlides(work.slides || []),
          })),
        );
      }
      revalidateTag("works", "max");
      return;
    } catch (error) {
      reportDatabaseFallback(error);
    }
  }

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(works, null, 2), "utf-8");
  revalidateTag("works", "max");
}

export async function getWorkBySlug(slug: string) {
  if (hasDatabaseUrl()) {
    try {
      const rows = await db
        .select()
        .from(worksTable)
        .where(eq(worksTable.slug, slug))
        .limit(1);
      const row = rows[0];
      return row ? mapDbWorkToManagedWork(row) : undefined;
    } catch (error) {
      reportDatabaseFallback(error);
    }
  }

  const works = await getWorks();
  return works.find((work) => work.slug === slug);
}
