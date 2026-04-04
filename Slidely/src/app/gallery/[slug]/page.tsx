import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PresentationViewer } from "@/components/work/PresentationViewer";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { getWorks } from "@/lib/work-store";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

function parseInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(pattern)) {
    const token = match[0];
    const start = match.index ?? 0;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(<strong key={`bold-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodes.push(<em key={`italic-${key++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={`code-${key++}`}
          className="rounded bg-[#EAD2FF]/45 px-1 py-0.5 text-[0.92em] dark:bg-[#5A3D7A]/50"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const isExternal = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={`link-${key++}`}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="font-semibold text-[#7A21C8] underline underline-offset-2 transition-colors hover:text-foreground"
          >
            {label}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseSummaryMarkdown(input: string): MarkdownBlock[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      blocks.push({
        type: "heading",
        level,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        const listMatch = candidate.match(/^[-*]\s+(.+)$/);
        if (!listMatch) break;
        items.push(listMatch[1].trim());
        index += 1;
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const candidate = lines[index].trim();
        const listMatch = candidate.match(/^\d+\.\s+(.+)$/);
        if (!listMatch) break;
        items.push(listMatch[1].trim());
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const candidate = lines[index].trimEnd();
      const candidateTrimmed = candidate.trim();
      if (!candidateTrimmed) break;
      if (/^(#{1,3})\s+/.test(candidateTrimmed)) break;
      if (/^[-*]\s+/.test(candidateTrimmed)) break;
      if (/^\d+\.\s+/.test(candidateTrimmed)) break;
      paragraphLines.push(candidateTrimmed);
      index += 1;
    }
    blocks.push({ type: "paragraph", lines: paragraphLines });
  }

  return blocks;
}

function renderSummaryMarkdown(input: string): ReactNode {
  const blocks = parseSummaryMarkdown(input);

  return blocks.map((block, blockIndex) => {
    const key = `summary-${blockIndex}`;

    if (block.type === "heading") {
      if (block.level === 1) {
        return (
          <h3
            key={key}
            className="mt-4 text-xl font-black tracking-tight text-foreground first:mt-0"
          >
            {parseInlineMarkdown(block.text)}
          </h3>
        );
      }
      if (block.level === 2) {
        return (
          <h4
            key={key}
            className="mt-4 text-lg font-black tracking-tight text-foreground first:mt-0"
          >
            {parseInlineMarkdown(block.text)}
          </h4>
        );
      }
      return (
        <h5
          key={key}
          className="mt-3 text-base font-bold tracking-tight text-foreground first:mt-0"
        >
          {parseInlineMarkdown(block.text)}
        </h5>
      );
    }

    if (block.type === "unordered-list") {
      return (
        <ul
          key={key}
          className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-foreground/75 md:text-base"
        >
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-ul-${itemIndex}`}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    }

    if (block.type === "ordered-list") {
      return (
        <ol
          key={key}
          className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-foreground/75 md:text-base"
        >
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-ol-${itemIndex}`}>{parseInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
    }

    return (
      <p
        key={key}
        className="mt-3 text-sm leading-relaxed text-foreground/75 md:text-base"
      >
        {block.lines.map((line, lineIndex) => (
          <span key={`${key}-line-${lineIndex}`}>
            {lineIndex > 0 ? <br /> : null}
            {parseInlineMarkdown(line)}
          </span>
        ))}
      </p>
    );
  });
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
  const slideCount = viewerSlides.length;

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {project.category}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {project.title}
        </h1>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#EAD2FF] bg-background px-4 py-3 shadow-[0_14px_28px_-24px_rgba(42,6,89,0.85)] dark:border-[#5A3D7A] dark:bg-[#1B0C30]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Client
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {project.client}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-background px-4 py-3 shadow-[0_14px_28px_-24px_rgba(42,6,89,0.85)] dark:border-[#5A3D7A] dark:bg-[#1B0C30]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Slides
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {slideCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-background px-4 py-3 shadow-[0_14px_28px_-24px_rgba(42,6,89,0.85)] dark:border-[#5A3D7A] dark:bg-[#1B0C30]">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Date
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {project.date}
            </p>
          </div>
        </div>

        {adminUser ? (
          <div className="mt-5">
            <Link
              href={`/admin?edit=${encodeURIComponent(project.slug)}`}
              className="inline-flex items-center rounded-full border border-[#D9B1FF] bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[#B353FF] hover:bg-[#F8F1FF] dark:border-[#715095] dark:bg-[#1B0C30] dark:hover:bg-[#2B1545]"
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
          className="mt-10 rounded-3xl border border-[#EAD2FF] bg-[#FCF8FF] p-5 dark:border-[#5A3D7A] dark:bg-[#1D1031] sm:p-6"
          aria-labelledby="project-summary-heading"
        >
          <h2
            id="project-summary-heading"
            className="text-2xl font-black tracking-tight text-foreground"
          >
            Quick description
          </h2>
          <div className="text-sm leading-relaxed text-foreground/75 md:text-base">
            {renderSummaryMarkdown(project.summary)}
          </div>
        </section>
      </div>

      <section
        className="mt-12 md:mt-14"
        aria-labelledby="other-projects-heading"
      >
        <div className="flex items-end justify-between gap-4">
          <h2
            id="other-projects-heading"
            className="text-2xl font-black tracking-tight text-foreground md:text-3xl"
          >
            More Projects
          </h2>
          <Link
            href="/gallery"
            className="text-sm font-semibold text-[#7A21C8] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:text-[#CFA9FF]"
          >
            View all projects
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {otherProjects.map((item) => (
            <Link
              key={item.slug}
              href={`/gallery/${item.slug}`}
              className="group rounded-2xl border border-[#EAD2FF] bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#C88BFF] hover:shadow-[0_18px_36px_-26px_rgba(42,6,89,0.85)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-[#5A3D7A] dark:bg-[#1B0C30]"
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
              <h3 className="mt-1 text-lg font-bold text-foreground">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-foreground/70">
                {item.client} • {item.date}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
