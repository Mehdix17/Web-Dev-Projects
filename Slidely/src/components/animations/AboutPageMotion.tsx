"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap/all";

export function AboutPageMotion() {
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const title = document.querySelector("[data-about-title]");
      const portrait = document.querySelector("[data-about-portrait]");
      const bioCopy = document.querySelector("[data-about-copy]");

      // Intro animation (no scroll observer needed)
      if (title) gsap.set(title, { y: 24, opacity: 0 });
      if (portrait) gsap.set(portrait, { x: -24, opacity: 0 });
      if (bioCopy) gsap.set(bioCopy, { x: 24, opacity: 0 });

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (title && portrait && bioCopy) {
        intro
          .to(title, { y: 0, opacity: 1, duration: 0.62 })
          .to(portrait, { x: 0, opacity: 1, duration: 0.62 }, "-=0.4")
          .to(bioCopy, { x: 0, opacity: 1, duration: 0.62 }, "-=0.52");
      }

      // Reusable observer function
      const observeOnce = (
        selector: string | HTMLElement | Element[],
        setupState: gsap.TweenVars,
        animateState: gsap.TweenVars,
        triggerSelector?: string,
      ) => {
        const targets = Array.isArray(selector)
          ? selector
          : typeof selector === "string"
            ? gsap.utils.toArray<HTMLElement>(selector)
            : [selector];

        if (targets.length === 0 || !targets[0]) return;

        // Hide immediately
        gsap.set(targets, setupState);

        const triggerElement = triggerSelector
          ? document.querySelector(triggerSelector)
          : targets[0];

        if (!triggerElement) return;

        let animated = false;
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0] && entries[0].isIntersecting) {
              if (!animated) {
                animated = true;
                gsap.to(targets, animateState);
              }
              observer.disconnect();
            }
          },
          { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
        );

        observer.observe(triggerElement);
        observersRef.current.push(observer);
      };

      const philosophy = document.querySelector<HTMLElement>(
        "[data-about-philosophy]",
      );
      if (philosophy) {
        observeOnce(
          philosophy,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.62, ease: "power2.out" },
        );
      }

      const aboutServiceCards = gsap.utils.toArray<HTMLElement>(
        "[data-about-service-card]",
      );
      if (aboutServiceCards.length > 0) {
        observeOnce(
          aboutServiceCards,
          { y: 34, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.58,
            stagger: 0.08,
            ease: "power2.out",
          },
          "[data-about-services]",
        );
      }

      const processSteps = gsap.utils.toArray<HTMLElement>("[data-about-step]");
      if (processSteps.length > 0) {
        observeOnce(
          processSteps,
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.52,
            stagger: 0.06,
            ease: "power2.out",
          },
          "[data-about-process]",
        );
      }

      const cta = document.querySelector<HTMLElement>("[data-about-cta]");
      if (cta) {
        observeOnce(
          cta,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        );
      }
    });

    return () => {
      observersRef.current.forEach((obs) => obs.disconnect());
      observersRef.current = [];
      context.revert();
    };
  }, []);

  return null;
}
