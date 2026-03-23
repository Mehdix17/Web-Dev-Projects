import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { getWorks } from "@/lib/work-store";

export async function FeaturedProjectsSection() {
  const works = await getWorks();
  const featured = works.filter((work) => work.featured).slice(0, 5);

  return (
    <section
      data-featured-root
      className="mx-auto max-w-6xl px-4 py-10 md:py-12"
      aria-labelledby="featured-projects"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2
          id="featured-projects"
          className="text-3xl font-bold tracking-tight"
        >
          Featured Projects
        </h2>
        <Link
          href="/gallery"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          Explore all projects
        </Link>
      </div>

      {featured.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9B1FF] bg-background px-6 py-10 text-center text-sm font-semibold text-[#2A0659]/70">
          No featured projects yet. Mark projects as featured in the dashboard.
        </div>
      ) : (
        <div
          data-featured-grid
          className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[260px_220px_220px]"
        >
          {featured.map((project, index) => (
            <Link
              data-featured-card
              key={project.slug}
              href={`/gallery/${project.slug}`}
              className={`group focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl ${
                index === 0
                  ? "md:col-span-4 md:row-span-2"
                  : index === 1
                    ? "md:col-span-2 md:row-span-1"
                    : index === 2
                      ? "md:col-span-2 md:row-span-2"
                      : index === 3
                        ? "md:col-span-2 md:row-span-1"
                        : "md:col-span-2 md:row-span-1"
              }`}
            >
              <Card className="h-full overflow-hidden pb-4 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-primary">
                <Image
                  src={project.thumbnail}
                  alt={`${project.title} thumbnail`}
                  className={`mb-4 w-full rounded-xl object-cover ${
                    index === 0 ? "h-[72%] md:h-[78%]" : "h-44 md:h-[68%]"
                  }`}
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes={
                    index === 0
                      ? "(min-width: 768px) 66vw, 100vw"
                      : "(min-width: 768px) 33vw, 100vw"
                  }
                  width={900}
                  height={600}
                />
                <p className="mt-auto text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {project.category}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{project.title}</h3>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
