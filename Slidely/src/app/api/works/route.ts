import { NextResponse } from "next/server";
import { getWorks } from "@/lib/work-store";

export async function GET() {
  const works = await getWorks();
  return NextResponse.json({ works });
}
