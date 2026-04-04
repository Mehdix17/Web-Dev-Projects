import "server-only";

import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db/client";
import { works as worksTable, type WorkRow } from "@/lib/db/schema";
import type { ManagedWork, WorkCategory } from "@/lib/work-types";

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
    date: work.date,
    client: work.client,
    featured: Boolean(work.featured),
    featuredOrder: work.featured
      ? normalizeFeaturedOrder(work.featuredOrder)
      : null,
    orderedPosition: work.orderedPosition ?? null,
    thumbnail: work.thumbnail,
    pdfUrl: work.pdfUrl,
    summary: work.summary,
    slides:
      Array.isArray(work.slides) && work.slides.length
        ? work.slides
        : undefined,
  };
}

function normalizeFeaturedOrder(value: unknown): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return null;
  }

  return Math.floor(numeric);
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

  const fallbackDate = new Date().getFullYear().toString();

  return {
    slug: sanitizeSlug(baseSlug),
    title: (payload.title || "Untitled work").trim(),
    category,
    date: (payload.date || fallbackDate).trim(),
    client: (payload.client || "Confidential client").trim(),
    featured,
    featuredOrder,
    orderedPosition: payload.orderedPosition ?? null,
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

async function readWorksFromSource(): Promise<ManagedWork[]> {
  // Order by orderedPosition first (null values go last), then by id as fallback
  const works = await db
    .select()
    .from(worksTable)
    .orderBy((t) => [
      // SQL: COALESCE(ordered_position, 999999) to put nulls at end
      // But since Drizzle doesn't directly support COALESCE in orderBy, we use a workaround
    ]);

  // Sort in JavaScript with nulls at the end
  const sorted = works.sort((a, b) => {
    const aPos = a.orderedPosition ?? Number.MAX_SAFE_INTEGER;
    const bPos = b.orderedPosition ?? Number.MAX_SAFE_INTEGER;
    return aPos - bPos;
  });

  console.info(`Loaded ${sorted.length} works from Neon database`);
  return sorted.map(mapDbWorkToManagedWork);
}

const getCachedWorks = unstable_cache(readWorksFromSource, ["works-all"], {
  tags: ["works"],
  revalidate: 60,
});

export async function getWorks(options?: {
  noCache?: boolean;
}): Promise<ManagedWork[]> {
  if (options?.noCache) {
    return readWorksFromSource();
  }

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
  // Use upsert/on conflict strategy to prevent data loss
  for (const work of works) {
    const workData = {
      slug: work.slug,
      title: work.title,
      category: work.category,
      date: work.date,
      client: work.client,
      featured: Boolean(work.featured),
      featuredOrder: work.featured
        ? normalizeFeaturedOrder(work.featuredOrder)
        : null,
      orderedPosition: work.orderedPosition ?? null,
      thumbnail: work.thumbnail,
      pdfUrl: work.pdfUrl,
      summary: work.summary,
      slides: normalizeSlides(work.slides || []),
    };

    // Upsert: Insert or update existing record by slug
    await db
      .insert(worksTable)
      .values(workData)
      .onConflictDoUpdate({
        target: worksTable.slug,
        set: {
          title: workData.title,
          category: workData.category,
          date: workData.date,
          client: workData.client,
          featured: workData.featured,
          featuredOrder: workData.featuredOrder,
          orderedPosition: workData.orderedPosition,
          thumbnail: workData.thumbnail,
          pdfUrl: workData.pdfUrl,
          summary: workData.summary,
          slides: workData.slides,
          updatedAt: new Date(),
        },
      });
  }
  revalidateTag("works", "max");
}

export async function getWorkBySlug(slug: string) {
  const rows = await db
    .select()
    .from(worksTable)
    .where(eq(worksTable.slug, slug))
    .limit(1);
  const row = rows[0];
  return row ? mapDbWorkToManagedWork(row) : undefined;
}
