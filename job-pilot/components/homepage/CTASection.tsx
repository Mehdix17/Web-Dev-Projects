"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function CTASection() {
  const trackCta = (label: string) => {
    posthog.capture("homepage_cta_clicked", {
      cta_label: label,
      location: "cta_section",
    });
  };

  return (
    <section
      className="w-full py-20 px-6"
      style={{
        background:
          "linear-gradient(180deg, #EEF0FF 0%, #F0EAFF 50%, #EEF0FF 100%)",
      }}
    >
      <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
        <h2
          className="font-bold text-text-primary max-w-xl mb-4"
          style={{ fontSize: "36px", lineHeight: "46px" }}
        >
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          Set up your profile, upload your resume, and start finding matches in
          minutes.
        </p>
        <div className="flex items-center justify-center gap-3">
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
