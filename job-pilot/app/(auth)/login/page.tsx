"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithOAuthAction } from "@/actions/auth";
import { Loader2, AlertCircle } from "lucide-react";
import posthog from "posthog-js";

function LoginForm() {
  const searchParams = useSearchParams();
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "github" | null>(null);

  const paramsError = searchParams.get("error");
  const error = actionError ?? (paramsError ? decodeURIComponent(paramsError) : null);

  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      setActionError(null);
      setLoadingProvider(provider);

      posthog.capture("login_initiated", { provider });

      const response = await signInWithOAuthAction(provider);

      if (!response.success || !response.url) {
        setActionError(response.error || "Failed to initialize login flow");
        setLoadingProvider(null);
        posthog.captureException(new Error(response.error || "Failed to initialize login flow"));
        return;
      }

      window.location.href = response.url;
    } catch (err) {
      console.error(`[login] ${provider} login error:`, err);
      setActionError("An unexpected error occurred. Please try again.");
      setLoadingProvider(null);
      posthog.captureException(err);
    }
  };

  return (
    <div className="z-10 w-full max-w-md space-y-8">
      {/* Logo Section */}
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-accent-dark shadow-md shadow-accent/20 transition-transform duration-300 hover:scale-105">
          <span className="text-xl font-bold text-accent-foreground select-none">JP</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-text-primary">
          Welcome to JobPilot
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Your AI-powered job hunting assistant
        </p>
      </div>

      {/* Card Container */}
      <div className="bg-surface border border-border shadow-md rounded-2xl p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-text-primary">Sign In</h3>
          <p className="text-sm text-text-muted">Connect your account to get started.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg bg-error/10 border border-error/20 p-4 text-sm text-error">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Authentication Error</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Login Buttons */}
        <div className="space-y-3">
          {/* Google Button */}
          <button
            onClick={() => handleOAuthLogin("google")}
            disabled={loadingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-all duration-200 hover:bg-surface-secondary hover:border-border-muted focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* GitHub Button */}
          <button
            onClick={() => handleOAuthLogin("github")}
            disabled={loadingProvider !== null}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-all duration-200 hover:bg-surface-secondary hover:border-border-muted focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {loadingProvider === "github" ? (
              <Loader2 className="h-5 w-5 animate-spin text-text-secondary" />
            ) : (
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" width="24" height="24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>Continue with GitHub</span>
          </button>
        </div>
      </div>

      {/* Footer info / privacy */}
      <p className="text-center text-xs text-text-muted">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-accent-light opacity-30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-accent opacity-20 blur-[150px] pointer-events-none" />

      <Suspense fallback={
        <div className="z-10 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-accent" />
          <p className="text-sm text-text-secondary">Loading sign in...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
