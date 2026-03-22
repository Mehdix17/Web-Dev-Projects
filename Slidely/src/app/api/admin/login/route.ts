import { NextResponse } from "next/server";
import { setAdminSessionCookie, verifyCredentials } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");

  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await setAdminSessionCookie(username);
  return NextResponse.json({ ok: true });
}
