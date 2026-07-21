"use server";

import { cookies } from "next/headers";
import { createInsforgeServer } from "@/lib/insforge-server";
import { getPostHogClient } from "@/lib/posthog-server";

type OAuthProvider = "google" | "github";

export async function signInWithOAuthAction(provider: OAuthProvider) {
  try {
    const insforge = await createInsforgeServer();
    
    // We get the origin on the server side or construct it.
    // In production, we'd use the actual domain. For development, default to localhost:3000.
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectTo = `${origin}/callback`;

    // signInWithOAuth generates OAuth URL and code verifier
    const { data, error } = await insforge.auth.signInWithOAuth(provider, {
      redirectTo,
      skipBrowserRedirect: true,
    });

    if (error || !data?.url) {
      console.error(`[actions/auth] ${provider} auth init error:`, error);
      return { success: false, error: error?.message || "Failed to initialize login" };
    }

    const cookieStore = await cookies();
    
    // Store verifier cookie for the callback route
    cookieStore.set("insforge_pkce_verifier", data.codeVerifier!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300, // 5 minutes
      path: "/",
      sameSite: "lax",
    });

    return { success: true, url: data.url };
  } catch (error) {
    console.error(`[actions/auth] ${provider} login exception:`, error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function signOutAction() {
  try {
    const insforge = await createInsforgeServer();

    // Get user before signing out so we can track with their distinct ID
    const { data: userData } = await insforge.auth.getCurrentUser();
    const userId = userData?.user?.id;

    const { error } = await insforge.auth.signOut();
    if (error) {
      console.error("[actions/auth] Sign out error:", error);
      return { success: false, error: error.message };
    }

    const cookieStore = await cookies();
    // Clear cookies
    cookieStore.delete("insforge_access_token");
    cookieStore.delete("insforge_refresh_token");

    if (userId) {
      const posthog = getPostHogClient();
      posthog.capture({
        distinctId: userId,
        event: "sign_out_completed",
      });
      await posthog.flush();
    }

    return { success: true };
  } catch (error) {
    console.error("[actions/auth] Sign out exception:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
