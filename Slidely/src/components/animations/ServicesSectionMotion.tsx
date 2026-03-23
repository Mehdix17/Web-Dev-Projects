"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap/all";

export function ServicesSectionMotion() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const heading = document.querySelector("[data-services-heading]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-service-card]");
      const root = document.querySelector("[data-services-root]");

      if (!root) return;

      if (heading) gsap.set(heading, { opacity: 0, y: 30 });
      if (cards.length) gsap.set(cards, { opacity: 0, y: 42, x: 10 });

      let animated = false;
      const animateIn = () => {
        if (animated) return;
        animated = true;

        if (heading) {
          gsap.to(heading, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        }
        if (cards.length) {
          gsap.to(cards, {
            y: 0,
            x: 0,
            opacity: 1,
            duration: 0.62,
            stagger: 0.08,
            ease: "power2.out",
          });
        }
      };

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0] && entries[0].isIntersecting) {
            animateIn();
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
      );

      observer.observe(root);
      observerRef.current = observer;
    });

    return () => {
      observerRef.current?.disconnect();
      context.revert();
    };
  }, []);

  return null;
}
