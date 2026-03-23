"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import logo from "@/app/logo.png";

export function SplashLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we've already shown the loader in this session
    const hasLoaded = sessionStorage.getItem("slidely_initial_loaded");

    if (hasLoaded) {
      setIsLoading(false);
      return;
    }

    // Block scrolling while loader is active
    document.body.style.overflow = "hidden";

    // Setup GSAP Animation
    const tl = gsap.timeline({
      onComplete: () => {
        setIsLoading(false);
        sessionStorage.setItem("slidely_initial_loaded", "true");
        document.body.style.overflow = ""; // reset
      },
    });

    // 1. Initial State from GSAP (in addition to the CSS opacity: 0 to prevent flash)
    gsap.set(logoRef.current, { y: 20, scale: 0.95 });
    gsap.set(progressRef.current, {
      scaleX: 0,
      transformOrigin: "left center",
    });

    // 2. Play Animation
    tl.to(logoRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.1, // Brief delay after mounting
    })
      .to(
        progressRef.current,
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power2.inOut", // Fake loading bar simulating fast -> slow -> complete
        },
        "-=0.4",
      )
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        delay: 0.2, // A tiny pause at 100% just for feel
      });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background text-foreground`}
    >
      <div className="relative flex flex-col items-center">
        {/* Animated container for Logo (starts invisible using CSS opacity-0 to prevent flash) */}
        <div ref={logoRef} className="will-change-transform opacity-0">
          <Image
            src={logo}
            alt="Slidely"
            className="h-16 md:h-24 w-auto object-contain"
            priority
          />
        </div>

        {/* Progress indicator line beneath */}
        <div className="mt-10 h-[3px] w-40 overflow-hidden rounded-full bg-primary/20">
          <div
            ref={progressRef}
            className="h-full w-full bg-primary will-change-transform origin-left scale-x-0"
          />
        </div>
      </div>
    </div>
  );
}
