import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, getAuthSecret } from "@/lib/admin-auth-shared";

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const base64 = normalized + padding;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function signHmacSha256(value: string, secret: string) {
  const keyData = new TextEncoder().encode(secret);
  const data = new TextEncoder().encode(value);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);
  return new Uint8Array(signature);
}

async function verifyAdminSession(token?: string) {
  if (!token) return false;

  const [payloadRaw, signatureRaw] = token.split(".");
  if (!payloadRaw || !signatureRaw) return false;

  let payload: { exp?: number };
  try {
    const payloadText = new TextDecoder().decode(base64UrlToBytes(payloadRaw));
    payload = JSON.parse(payloadText) as { exp?: number };
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) return false;

  const expected = await signHmacSha256(payloadRaw, getAuthSecret());
  const actual = base64UrlToBytes(signatureRaw);

  if (expected.length !== actual.length) return false;

  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected[index] ^ actual[index];
  }

  return mismatch === 0;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifyAdminSession(token);

  if (valid) return NextResponse.next();

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
