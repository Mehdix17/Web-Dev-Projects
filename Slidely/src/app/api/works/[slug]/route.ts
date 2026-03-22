import { NextResponse } from "next/server";
import { getWorkBySlug } from "@/lib/work-store";
import { resolvePublicWorkAssets } from "@/lib/work-asset-urls";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) {
    return NextResponse.json({ error: "Work not found" }, { status: 404 });
  }

  return NextResponse.json({ work: resolvePublicWorkAssets(work) });
}
