"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap, Flip } from "gsap/all";
import { type ManagedWork, type WorkCategory } from "@/lib/work-types";

gsap.registerPlugin(Flip);

const categories: ("All" | WorkCategory)[] = [
  "All",
  "Pitch Deck",
  "Keynote",
  "Sales",
  "Reports",
  "Course Materials",
  "Educational",
];

const PAGE_SIZE = 6;

interface GalleryClientProps {
  initialWorks: ManagedWork[];
}

const getInitialCategory = (): "All" | WorkCategory => {
  if (typeof window === "undefined") return "All";

  const fromQuery = new URLSearchParams(window.location.search).get(
    "category",
  ) as WorkCategory | null;
  if (fromQuery && categories.includes(fromQuery)) {
    return fromQuery;
  }

  const persisted = sessionStorage.getItem("slidely-category") as
    | WorkCategory
    | "All"
    | null;
  if (persisted && categories.includes(persisted)) {
    return persisted;
  }

  return "All";
};

export function GalleryClient({ initialWorks }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | WorkCategory
  >(getInitialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const resultsRegionRef = useRef<HTMLDivElement | null>(null);
  const pendingFlipState = useRef<Flip.FlipState | null>(null);
  const pendingRegionHeight = useRef<number | null>(null);

  const captureFlipState = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pendingFlipState.current = null;
      return;
    }
    if (!gridRef.current || !resultsRegionRef.current) {
      pendingFlipState.current = null;
      pendingRegionHeight.current = null;
      return;
    }

    const cards = gridRef.current.querySelectorAll<HTMLElement>(
      "[data-gallery-card]",
    );
    if (cards.length === 0) {
      pendingFlipState.current = null;
      pendingRegionHeight.current = null;
      return;
    }

    pendingRegionHeight.current = resultsRegionRef.current.offsetHeight;
    pendingFlipState.current = Flip.getState(cards);
  };

  useEffect(() => {
    sessionStorage.setItem("slidely-category", selectedCategory);
    const params = new URLSearchParams(window.location.search);
    if (selectedCategory === "All") {
      params.delete("category");
    } else {
      params.set("category", selectedCategory);
    }

    const nextUrl = params.size
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return initialWorks.filter((project) => {
      const categoryMatch =
        selectedCategory === "All" || project.category === selectedCategory;
      if (!categoryMatch) return false;

      if (!normalizedQuery) return true;

      const searchValue =
        `${project.title} ${project.client} ${project.category} ${project.year}`.toLowerCase();
      return searchValue.includes(normalizedQuery);
    });
  }, [initialWorks, selectedCategory, searchQuery]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useLayoutEffect(() => {
    if (
      !gridRef.current ||
      !resultsRegionRef.current ||
      !pendingFlipState.current
    )
      return;

    const previousHeight = pendingRegionHeight.current;
    const region = resultsRegionRef.current;

    if (previousHeight && previousHeight > 0) {
      gsap.set(region, { minHeight: previousHeight });
    }

    const nextCards = gridRef.current.querySelectorAll<HTMLElement>(
      "[data-gallery-card]",
    );
    const nextHeight = region.offsetHeight;

    if (previousHeight && previousHeight > 0) {
      gsap.to(region, {
        minHeight: nextHeight,
        duration: 0.34,
        ease: "power2.out",
      });
    }

    Flip.from(pendingFlipState.current, {
      duration: 0.56,
      ease: "power2.out",
      scale: true,
      absolute: true,
      targets: nextCards,
      stagger: 0.03,
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.4 }
        ),
      onLeave: (elements) =>
        gsap.to(elements, { opacity: 0, scale: 0.9, duration: 0.3 }),
      onComplete: () => {
        pendingFlipState.current = null;
        pendingRegionHeight.current = null;
        gsap.set(region, { clearProps: "minHeight" });
      },
    });
  }, [selectedCategory, searchQuery, visibleCount]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">Gallery</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Explore presentation projects by category or keyword.
        </p>
      </header>

      <div className="mb-5">
        <label htmlFor="gallery-search" className="sr-only">
          Search gallery
        </label>
        <input
          id="gallery-search"
          type="search"
          value={searchQuery}
          onChange={(event) => {
            captureFlipState();
            flushSync(() => {
              setSearchQuery(event.target.value);
            });
          }}
          placeholder="Search by title, client, category, year"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-[#2A0659] outline-none transition-colors focus:border-primary dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        />
      </div>

      <div
        className="mb-8 flex flex-wrap gap-2"
        role="tablist"
        aria-label="Project category filters"
      >
        {categories.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={active}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200"
              }`}
              onClick={() => {
                captureFlipState();
                flushSync(() => {
                  setSelectedCategory(category);
                  setVisibleCount(PAGE_SIZE);
                });
              }}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div ref={resultsRegionRef}>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <p className="text-lg font-semibold">
              No projects match this filter.
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Try another category, keyword, or clear the filters.
            </p>
            <button
              type="button"
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => {
                captureFlipState();
                flushSync(() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                  setVisibleCount(PAGE_SIZE);
                });
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div
              ref={gridRef}
              className="relative grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {visible.map((project) => (
                <div data-gallery-card key={project.slug} className="block">
                  <Link
                    href={`/gallery/${project.slug}`}
                    className="group block h-full rounded-2xl border border-gray-200 bg-white p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <Image
                      src={project.thumbnail}
                      alt={`${project.title} thumbnail`}
                      className="h-52 w-full rounded-xl object-cover"
                      loading="lazy"
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      width={900}
                      height={600}
                    />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      {project.category}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">
                      {project.title}
                    </h2>
                  </Link>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    captureFlipState();
                    flushSync(() => {
                      setVisibleCount((count) => count + PAGE_SIZE);
                    });
                  }}
                  className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-700"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
