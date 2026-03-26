"use client";

import { Button } from "@/components/ui/Button";

const stars = Array.from({ length: 62 }, (_, index) => ({
  id: index,
  left: `${(index * 7) % 100}%`,
  delay: `${(index % 14) * 0.24}s`,
  duration: `${5 + (index % 6)}s`,
}));

export function HeroSection() {
  const orbs = [
    "left-[4%] top-16 h-36 w-36",
    "left-[26%] top-8 h-20 w-20",
    "right-[8%] top-20 h-44 w-44",
    "right-[24%] top-40 h-24 w-24",
  ];

  return (
    <section
      data-hero-root
      className="relative overflow-hidden bg-background px-4 pt-20 pb-6 md:pt-24 md:pb-8"
    >
      <div className="pointer-events-none absolute inset-0">
        {orbs.map((orb, index) => (
          <span
            key={orb}
            className={`aurora-shift absolute rounded-full bg-[#B353FF]/14 blur-2xl ${orb} ${
              index % 2 === 0 ? "" : "[animation-delay:1.3s]"
            }`}
          />
        ))}
        {stars.map((star) => (
          <span
            key={star.id}
            className={`absolute top-[-12%] block ${star.id % 5 === 0 ? "starfall-streak" : "starfall-dot"}`}
            style={{
              left: star.left,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        <h1
          data-hero-title
          className="text-[2.35rem] font-black leading-[1.04] tracking-tight text-foreground sm:text-5xl md:text-7xl"
        >
          Slidely
          <br />
          Build Your Story
        </h1>
        <p
          data-hero-body
          className="mx-auto mt-6 max-w-3xl text-sm text-foreground/85 md:text-base"
        >
          Professional presentation design for everyone : custom storytelling,
          clear structure, and visuals built to win trust across pitch decks,
          educational presentations, executive summaries, and full deck
          redesigns.
        </p>

        <div
          data-hero-actions
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-3"
        >
          <Button
            href="/gallery"
            className="bg-[#2A0659] text-white hover:bg-[#B353FF] hover:text-[#2A0659]"
          >
            Get Started
          </Button>

          <div className="flex -space-x-2" aria-hidden="true">
            {["#E0B4FF", "#BD6BFF", "#B353FF", "#2A0659"].map((tone) => (
              <span
                key={tone}
                className="h-8 w-8 rounded-full border-2 border-white"
                style={{ backgroundColor: tone }}
              />
            ))}
          </div>

          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-foreground">★★★★★</p>
            <p className="text-xs text-foreground/80">
              Trusted by growing teams and founders
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
