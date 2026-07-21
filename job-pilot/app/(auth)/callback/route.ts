import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAuthActions } from "@insforge/sdk/ssr";
import { getPostHogClient } from "@/lib/posthog-server";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("insforge_code");
  const errorMsg = searchParams.get("error");

  const origin = request.nextUrl.origin;

  if (errorMsg) {
    console.error("[auth/callback] OAuth provider error:", errorMsg);
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: "anonymous",
      event: "oauth_login_failed",
      properties: { error_message: errorMsg, stage: "provider_error" },
    });
    await posthog.flush();
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, origin));
  }

  if (!code) {
    console.warn("[auth/callback] No code parameter found");
    return NextResponse.redirect(new URL("/login", origin));
  }

  const cookieStore = await cookies();
  const verifier = cookieStore.get("insforge_pkce_verifier")?.value;

  if (!verifier) {
    console.error("[auth/callback] PKCE verifier cookie not found");
    return NextResponse.redirect(new URL("/login?error=Session expired. Please try signing in again.", origin));
  }

  // Create authActions with writable cookie store
  const authActions = createAuthActions({
    cookies: cookieStore,
  });

  const { error } = await authActions.exchangeOAuthCode(code, verifier);

  // Clean up verifier cookie
  cookieStore.delete("insforge_pkce_verifier");

  if (error) {
    console.error("[auth/callback] OAuth code exchange error:", error);
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: "anonymous",
      event: "oauth_login_failed",
      properties: { error_message: error.message, stage: "code_exchange" },
    });
    await posthog.flush();
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin));
  }

  // Track successful login and identify user server-side
  try {
    const insforge = await createInsforgeServer();
    const { data: userData } = await insforge.auth.getCurrentUser();
    if (userData?.user) {
      const posthog = getPostHogClient();
      posthog.identify({
        distinctId: userData.user.id,
        properties: {
          name: userData.user.profile?.name,
          providers: userData.user.providers,
        },
      });
      posthog.capture({
        distinctId: userData.user.id,
        event: "oauth_login_completed",
        properties: { providers: userData.user.providers },
      });
      await posthog.flush();
    }
  } catch {
    // Non-critical: don't block the redirect if tracking fails
  }

  // Redirect to dashboard on success
  return NextResponse.redirect(new URL("/dashboard", origin));
}
