import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PresentationViewer } from "@/components/work/PresentationViewer";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getWorks } from "@/lib/work-store";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CaseStudyPage({ params }: PageProps) {
  const projects = await getWorks();
  const adminUser = await getCurrentAdminUser();
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const otherProjects = projects
    .filter((item) => item.slug !== project.slug)
    .slice(0, 3);
  const viewerSlides = (project.slides || []).map((src, index) => ({
    src,
    alt: `${project.title} slide ${index + 1}`,
  }));

  return (
    <article className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {project.category}
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#2A0659] md:text-5xl">
          {project.title}
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EAD2FF] bg-white px-4 py-3 shadow-[0_14px_28px_-24px_rgba(42,6,89,0.85)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#7A21C8]">
              Client
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2A0659]">
              {project.client}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-white px-4 py-3 shadow-[0_14px_28px_-24px_rgba(42,6,89,0.85)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#7A21C8]">
              Role
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2A0659]">
              {project.role}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-white px-4 py-3 shadow-[0_14px_28px_-24px_rgba(42,6,89,0.85)]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#7A21C8]">
              Year
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2A0659]">
              {project.year}
            </p>
          </div>
        </div>

        {adminUser ? (
          <div className="mt-5">
            <Link
              href={`/admin?edit=${encodeURIComponent(project.slug)}`}
              className="inline-flex items-center rounded-full border border-[#D9B1FF] bg-white px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:border-[#B353FF] hover:bg-[#F8F1FF]"
            >
              Edit this presentation
            </Link>
          </div>
        ) : null}

        <section className="mt-10" aria-label="Presentation preview">
          <PresentationViewer
            pdfUrl={project.pdfUrl}
            fallbackSlides={viewerSlides}
            title={project.title}
          />
        </section>

        <section
          className="mt-10 rounded-3xl border border-[#EAD2FF] bg-[#FCF8FF] p-6"
          aria-labelledby="project-summary-heading"
        >
          <h2
            id="project-summary-heading"
            className="text-2xl font-black tracking-tight text-[#2A0659]"
          >
            Quick description
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#2A0659]/75 md:text-base">
            {project.summary}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#2A0659]/75 md:text-base">
            This presentation was designed to balance narrative clarity, visual
            consistency, and practical slide usability for real client
            conversations.
          </p>
        </section>
      </div>

      <section className="mt-14" aria-labelledby="other-projects-heading">
        <div className="flex items-end justify-between gap-4">
          <h2
            id="other-projects-heading"
            className="text-2xl font-black tracking-tight text-[#2A0659] md:text-3xl"
          >
            More Projects
          </h2>
          <Link
            href="/gallery"
            className="text-sm font-semibold text-[#7A21C8] transition-colors hover:text-[#2A0659] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            View all projects
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {otherProjects.map((item) => (
            <Link
              key={item.slug}
              href={`/gallery/${item.slug}`}
              className="group rounded-2xl border border-[#EAD2FF] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#C88BFF] hover:shadow-[0_18px_36px_-26px_rgba(42,6,89,0.85)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Image
                src={item.thumbnail}
                alt={`${item.title} thumbnail`}
                loading="lazy"
                className="h-48 w-full rounded-xl object-cover"
                width={900}
                height={600}
              />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                {item.category}
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#2A0659]">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-[#2A0659]/70">
                {item.client} • {item.year}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
