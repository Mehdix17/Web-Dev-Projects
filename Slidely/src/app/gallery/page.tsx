"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { type ManagedWork, type WorkCategory } from "@/lib/work-types";

const categories: ("All" | WorkCategory)[] = [
  "All",
  "Pitch Decks",
  "Keynote",
  "Sales",
  "Reports",
  "Course Materials",
];

const PAGE_SIZE = 6;

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | WorkCategory
  >("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [works, setWorks] = useState<ManagedWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadWorks = async () => {
      try {
        const response = await fetch("/api/works", { cache: "no-store" });
        if (!response.ok) return;

        const data = (await response.json()) as { works: ManagedWork[] };
        if (active) setWorks(data.works || []);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadWorks();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get(
      "category",
    ) as WorkCategory | null;
    const persisted = sessionStorage.getItem("slidely-category") as
      | WorkCategory
      | "All"
      | null;

    if (fromQuery && categories.includes(fromQuery)) {
      setSelectedCategory(fromQuery);
      return;
    }

    if (persisted && categories.includes(persisted)) {
      setSelectedCategory(persisted);
    }
  }, []);

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
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return works.filter((project) => {
      const categoryMatch =
        selectedCategory === "All" || project.category === selectedCategory;
      if (!categoryMatch) return false;

      if (!normalizedQuery) return true;

      const searchValue =
        `${project.title} ${project.client} ${project.category} ${project.year}`.toLowerCase();
      return searchValue.includes(normalizedQuery);
    });
  }, [selectedCategory, searchQuery, works]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

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
          onChange={(event) => setSearchQuery(event.target.value)}
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
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <p className="text-lg font-semibold text-[#2A0659]">
            Loading projects...
          </p>
        </div>
      ) : filtered.length === 0 ? (
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
              setSelectedCategory("All");
              setSearchQuery("");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((project) => (
              <Link
                key={project.slug}
                href={`/gallery/${project.slug}`}
                className="group rounded-2xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-950"
              >
                <Image
                  src={project.thumbnail}
                  alt={`${project.title} thumbnail`}
                  className="h-52 w-full rounded-xl object-cover"
                  loading="lazy"
                  width={900}
                  height={600}
                />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {project.category}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{project.title}</h2>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-700"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
