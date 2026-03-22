"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";

type Slide = {
  src: string;
  alt: string;
};

type Props = {
  pdfUrl: string;
  title: string;
  fallbackSlides?: Slide[];
};

export function PresentationViewer({
  pdfUrl,
  title,
  fallbackSlides = [],
}: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pdfError, setPdfError] = useState("");

  const hasPdf = Boolean(pdfUrl);
  const slideCount = hasPdf ? (numPages ?? 0) : fallbackSlides.length;
  const pageIndexes = useMemo(
    () => Array.from({ length: slideCount }, (_, index) => index),
    [slideCount],
  );

  const currentPage = selectedIndex + 1;

  useEffect(() => {
    let isActive = true;

    const loadPageCount = async () => {
      if (!hasPdf) {
        setNumPages(null);
        setPdfError("");
        return;
      }

      try {
        setPdfError("");
        const response = await fetch(pdfUrl, { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to fetch PDF file");

        const bytes = await response.arrayBuffer();
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        if (!isActive) return;
        const count = doc.getPageCount();
        setNumPages(count);
        setSelectedIndex((index) => Math.min(index, Math.max(0, count - 1)));
      } catch {
        if (!isActive) return;
        setNumPages(null);
        setPdfError(
          "Page count unavailable. You can still browse the PDF below.",
        );
      }
    };

    void loadPageCount();

    return () => {
      isActive = false;
    };
  }, [hasPdf, pdfUrl]);

  useEffect(() => {
    if (!hasPdf && slideCount === 0) {
      setSelectedIndex(0);
      return;
    }
    if (!hasPdf) {
      setSelectedIndex((current) => Math.min(current, slideCount - 1));
    }
  }, [hasPdf, slideCount]);

  const scrollTo = (index: number) => {
    setSelectedIndex(index);
  };

  const goPrevious = () => {
    setSelectedIndex((index) => Math.max(0, index - 1));
  };

  const goNext = () => {
    if (hasPdf && numPages !== null) {
      setSelectedIndex((index) => Math.min(numPages - 1, index + 1));
      return;
    }

    if (hasPdf && numPages === null) {
      setSelectedIndex((index) => index + 1);
      return;
    }

    setSelectedIndex((index) => Math.min(fallbackSlides.length - 1, index + 1));
  };

  const canGoPrevious = selectedIndex > 0;
  const canGoNext = hasPdf
    ? numPages === null || currentPage < numPages
    : selectedIndex < fallbackSlides.length - 1;

  const pdfPageButtons = useMemo(() => {
    if (numPages === null || numPages <= 0) return [] as number[];
    if (numPages <= 16) {
      return Array.from({ length: numPages }, (_, index) => index + 1);
    }

    const start = Math.max(1, currentPage - 5);
    const end = Math.min(numPages, currentPage + 5);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [numPages, currentPage]);

  return (
    <section aria-label={`${title} slides`} className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-3xl border border-[#EAD2FF] bg-white shadow-[0_20px_50px_-38px_rgba(42,6,89,0.9)]">
        <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-[#F8F1FF]">
          {hasPdf ? (
            <div className="h-full w-full p-3">
              <div className="h-full overflow-hidden rounded-2xl border border-[#EAD2FF] bg-white">
                <iframe
                  src={`${pdfUrl}#page=${currentPage}&zoom=page-fit&view=FitH&pagemode=none&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0`}
                  title={`${title} page ${currentPage}`}
                  className="h-full w-full border-0"
                  loading="lazy"
                  scrolling="no"
                />
              </div>
            </div>
          ) : slideCount > 0 ? (
            <div className="h-full w-full p-3">
              <div className="h-full overflow-hidden rounded-2xl border border-[#EAD2FF] bg-white">
                <Image
                  src={fallbackSlides[selectedIndex].src}
                  alt={fallbackSlides[selectedIndex].alt}
                  className="h-full w-full object-cover"
                  width={1400}
                  height={900}
                  priority
                />
              </div>
            </div>
          ) : (
            <p className="px-4 text-center text-sm font-semibold text-[#2A0659]/75">
              No PDF uploaded for this presentation yet.
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevious}
          className="inline-flex items-center rounded-full border border-[#D9B1FF] px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:border-[#B353FF] hover:bg-[#F8F1FF] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Previous slide"
          disabled={!canGoPrevious}
        >
          Previous
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
          Slide {currentPage} of {hasPdf ? (numPages ?? "?") : slideCount}
        </p>

        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center rounded-full border border-[#D9B1FF] px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:border-[#B353FF] hover:bg-[#F8F1FF] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Next slide"
          disabled={!canGoNext}
        >
          Next
        </button>
      </div>

      {pdfError ? (
        <p className="mt-2 text-center text-xs font-semibold text-[#7A21C8]">
          {pdfError}
        </p>
      ) : null}

      <div className="mt-4 overflow-hidden">
        <div className="flex gap-3">
          {(hasPdf ? pdfPageButtons : pageIndexes.map((index) => index + 1)).map(
            (pageNumber) => {
              const index = pageNumber - 1;
              const isActive = index === selectedIndex;

              return (
                <button
                  key={`thumb-${pageNumber}`}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={`min-w-[110px] flex-[0_0_auto] overflow-hidden rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? "border-[#B353FF] ring-2 ring-[#EAD2FF]"
                      : "border-transparent hover:border-[#D9B1FF]"
                  }`}
                  aria-label={`Open slide ${pageNumber}`}
                  aria-current={isActive}
                >
                  {hasPdf ? (
                    <div className="flex h-16 w-[110px] items-center justify-center bg-white text-sm font-semibold text-[#2A0659]">
                      Page {pageNumber}
                    </div>
                  ) : (
                    <Image
                      src={fallbackSlides[index].src}
                      alt={fallbackSlides[index].alt}
                      className="h-16 w-[110px] object-cover"
                      loading="lazy"
                      width={220}
                      height={128}
                    />
                  )}
                </button>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
