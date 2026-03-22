import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  getAuthSecret,
  type SessionPayload,
} from "@/lib/admin-auth-shared";

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf-8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf-8");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(username: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS,
  };
  const payloadRaw = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadRaw);
  return `${payloadRaw}.${signature}`;
}

export function verifySessionToken(
  token?: string | null,
): SessionPayload | null {
  if (!token) return null;
  const [payloadRaw, signature] = token.split(".");
  if (!payloadRaw || !signature) return null;

  const expected = sign(payloadRaw);
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadRaw)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

function getStoredPasswordHash() {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const salt = process.env.ADMIN_PASSWORD_SALT;
  if (!hash || !salt) return null;
  return { hash, salt };
}

function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  if (username !== expectedUser) return false;

  const hashed = getStoredPasswordHash();
  if (hashed) {
    const actualHash = hashPassword(password, hashed.salt);
    const actual = Buffer.from(actualHash, "hex");
    const expected = Buffer.from(hashed.hash, "hex");
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  }

  const fallbackPassword = process.env.ADMIN_PASSWORD;
  if (!fallbackPassword) return false;
  const actual = Buffer.from(password, "utf-8");
  const expected = Buffer.from(fallbackPassword, "utf-8");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

export async function setAdminSessionCookie(username: string) {
  const token = createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = verifySessionToken(token);
  return payload?.sub || null;
}

export { SESSION_COOKIE };
