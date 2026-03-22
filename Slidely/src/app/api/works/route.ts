import { NextResponse } from "next/server";
import { getWorks } from "@/lib/work-store";
import { resolvePublicWorkAssets } from "@/lib/work-asset-urls";

export async function GET() {
  const works = await getWorks();
  return NextResponse.json({ works: works.map(resolvePublicWorkAssets) });
}
