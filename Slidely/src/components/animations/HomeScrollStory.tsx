"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

export function HomeScrollStory() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const heroTitle = document.querySelector("[data-hero-title]");
      const heroBody = document.querySelector("[data-hero-body]");
      const heroActions = document.querySelector("[data-hero-actions]");
      const featuredCards = gsap.utils.toArray<HTMLElement>(
        "[data-featured-card]",
      );

      const heroIntro = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (heroTitle && heroBody && heroActions) {
        heroIntro
          .fromTo(
            heroTitle,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8 },
          )
          .fromTo(
            heroBody,
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 },
            "-=0.45",
          )
          .fromTo(
            heroActions,
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            "-=0.4",
          );
      }

      const heroRoot = document.querySelector("[data-hero-root]");
      if (heroRoot) {
        const heroScroll = gsap.timeline({
          scrollTrigger: {
            trigger: heroRoot,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        heroScroll
          .to(heroTitle, { yPercent: -28, opacity: 0.35, ease: "none" }, 0)
          .to(heroBody, { yPercent: -18, opacity: 0.2, ease: "none" }, 0)
          .to(heroActions, { yPercent: -14, opacity: 0.06, ease: "none" }, 0);
      }

      if (featuredCards.length > 0) {
        gsap.fromTo(
          featuredCards,
          { y: 52, scale: 0.96, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: "[data-featured-grid]",
              start: "top 74%",
            },
          },
        );
      }

      ScrollTrigger.refresh();
    });

    return () => {
      context.revert();
    };
  }, []);

  return null;
}
