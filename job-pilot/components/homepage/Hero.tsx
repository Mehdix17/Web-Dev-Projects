"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function Hero() {
  const trackCta = (label: string) => {
    posthog.capture("homepage_cta_clicked", {
      cta_label: label,
      location: "hero",
    });
  };

  return (
    <section
      className="w-full flex flex-col items-center text-center px-6 pt-16 pb-0"
      style={{
        background:
          "linear-gradient(180deg, #EEF0FF 0%, #F8F5FF 40%, var(--color-background) 100%)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="font-bold text-text-primary leading-tight mb-4"
          style={{ fontSize: "48px" }}
        >
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>
        <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-md mx-auto">
          Stop applying blind. JobPilot finds the jobs, researches the
          companies, and gives you everything you need to stand out.
        </p>
        <div className="flex items-center justify-center gap-3 mb-12">
          <Link
            href="/login"
            onClick={() => trackCta("Get Started")}
            className="flex items-center gap-2 bg-text-primary text-accent-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Get Started
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/find-jobs"
            onClick={() => trackCta("Find Your First Match")}
            className="bg-surface border border-border text-text-primary text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-surface-secondary transition-colors"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
    </section>
  );
}
