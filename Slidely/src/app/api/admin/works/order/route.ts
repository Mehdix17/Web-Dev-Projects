import { NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getWorks, saveWorks } from "@/lib/work-store";

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
    const existingSlugSet = new Set(works.map((work) => work.slug));

    const requestedSlugs = payload.orderedSlugs
      .map((value) => String(value))
      .filter((slug, index, arr) => arr.indexOf(slug) === index)
      .filter((slug) => existingSlugSet.has(slug));

    const remainingSlugs = works
      .map((work) => work.slug)
      .filter((slug) => !requestedSlugs.includes(slug));

    const orderedSlugs = [...requestedSlugs, ...remainingSlugs];

    const slugToWork = new Map(works.map((work) => [work.slug, work]));
    const reordered = orderedSlugs
      .map((slug, index) => {
        const work = slugToWork.get(slug);
        if (work) {
          return { ...work, orderedPosition: index };
        }
        return undefined;
      })
      .filter(Boolean) as typeof works;

    await saveWorks(reordered);

    return NextResponse.json({ works: reordered });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update project order at the moment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
