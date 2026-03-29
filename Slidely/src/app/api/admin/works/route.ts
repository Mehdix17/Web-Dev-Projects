import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import {
  getNextFeaturedOrder,
  getWorks,
  normalizeWorkPayload,
  saveWorks,
} from "@/lib/work-store";
import { workCategories } from "@/lib/work-types";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function validateCategory(category: string) {
  return workCategories.includes(category as (typeof workCategories)[number]);
}

export async function GET() {
  try {
    if (!(await getCurrentAdminUser())) return unauthorized();

    const works = await getWorks({ noCache: true });
    return NextResponse.json({ works });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load works at the moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentAdminUser())) return unauthorized();

    const payload = await request.json();
    if (!validateCategory(String(payload?.category || ""))) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const works = await getWorks();
    const normalized = normalizeWorkPayload(payload);
    if (normalized.featured && normalized.featuredOrder === null) {
      normalized.featuredOrder = getNextFeaturedOrder(works);
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

    if (works.some((work) => work.slug === normalized.slug)) {
      return NextResponse.json(
        { error: "Slug already exists. Use another slug or title." },
        { status: 409 },
      );
    }

    works.unshift(normalized);
    await saveWorks(works);

    return NextResponse.json({ work: normalized }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to save this work at the moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
