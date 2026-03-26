import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getFeaturedWorksInOrder, getWorks, saveWorks } from "@/lib/work-store";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(request: Request) {
  try {
    if (!(await getCurrentAdminUser())) return unauthorized();

    const payload = (await request.json()) as { orderedSlugs?: unknown };
    if (!Array.isArray(payload?.orderedSlugs)) {
      return NextResponse.json(
        { error: "orderedSlugs must be an array." },
        { status: 400 },
      );
    }

    const works = await getWorks();
    const featured = getFeaturedWorksInOrder(works);
    const featuredSlugSet = new Set(featured.map((work) => work.slug));

    const requested = payload.orderedSlugs
      .map((value) => String(value))
      .filter((slug, index, list) => list.indexOf(slug) === index)
      .filter((slug) => featuredSlugSet.has(slug));

    const remaining = featured
      .map((work) => work.slug)
      .filter((slug) => !requested.includes(slug));

    const orderedSlugs = [...requested, ...remaining];

    const orderLookup = new Map(
      orderedSlugs.map((slug, index) => [slug, index] as const),
    );

    const updated = works.map((work) => {
      if (!work.featured) {
        return { ...work, featuredOrder: null };
      }

      const featuredOrder = orderLookup.get(work.slug);
      return {
        ...work,
        featuredOrder: typeof featuredOrder === "number" ? featuredOrder : null,
      };
    });

    await saveWorks(updated);
    return NextResponse.json({ works: updated });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update featured order at the moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
