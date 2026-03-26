import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import {
  getNextFeaturedOrder,
  getWorks,
  normalizeWorkPayload,
  saveWorks,
} from "@/lib/work-store";
import { workCategories } from "@/lib/work-types";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function validateCategory(category: string) {
  return workCategories.includes(category as (typeof workCategories)[number]);
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    if (!(await getCurrentAdminUser())) return unauthorized();
    const { slug } = await params;

    const payload = await request.json();
    if (!validateCategory(String(payload?.category || ""))) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const works = await getWorks();
    const currentIndex = works.findIndex((work) => work.slug === slug);

    if (currentIndex < 0) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    const normalized = normalizeWorkPayload(payload);
    const previous = works[currentIndex];

    if (normalized.featured) {
      const hasProvidedOrder = Number.isFinite(Number(payload?.featuredOrder));
      if (!hasProvidedOrder) {
        normalized.featuredOrder = previous.featured
          ? previous.featuredOrder
          : getNextFeaturedOrder(works);
      }
      if (normalized.featuredOrder === null) {
        normalized.featuredOrder = getNextFeaturedOrder(works);
      }
    }
    if (!normalized.thumbnail) {
      return NextResponse.json(
        { error: "Thumbnail image upload is required" },
        { status: 400 },
      );
    }

    if (!normalized.pdfUrl) {
      return NextResponse.json(
        { error: "Presentation PDF upload is required" },
        { status: 400 },
      );
    }

    if (!normalized.slides || normalized.slides.length === 0) {
      return NextResponse.json(
        {
          error: "Slide images are required. Upload a PDF to generate slides.",
        },
        { status: 400 },
      );
    }

    const duplicate = works.find(
      (work, index) => work.slug === normalized.slug && index !== currentIndex,
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "Slug already exists. Use another slug or title." },
        { status: 409 },
      );
    }

    works[currentIndex] = normalized;
    await saveWorks(works);

    return NextResponse.json({ work: normalized });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update this work at the moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    if (!(await getCurrentAdminUser())) return unauthorized();
    const { slug } = await params;

    const works = await getWorks();
    const filtered = works.filter((work) => work.slug !== slug);

    if (filtered.length === works.length) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    await saveWorks(filtered);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete this work at the moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
