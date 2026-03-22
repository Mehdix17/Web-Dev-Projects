export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

export const SESSION_COOKIE = "slidely_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export function getAuthSecret() {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV !== "production") {
    return "dev-only-secret-change-me-please-123456";
  }

  throw new Error(
    "ADMIN_AUTH_SECRET must be set to a 32+ character value in production",
  );
}
