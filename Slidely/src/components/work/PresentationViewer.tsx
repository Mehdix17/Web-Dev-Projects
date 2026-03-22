"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import useEmblaCarousel from "embla-carousel-react";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "keepSnaps",
    dragFree: false,
  });
  const [thumbsRef, thumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: false,
  });
  const [numPages, setNumPages] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [pdfError, setPdfError] = useState("");

  const hasPdf = Boolean(pdfUrl);
  const slideCount = hasPdf ? numPages : fallbackSlides.length;
  const pageIndexes = useMemo(
    () => Array.from({ length: slideCount }, (_, index) => index),
    [slideCount],
  );

  useEffect(() => {
    let isActive = true;

    const loadPageCount = async () => {
      if (!hasPdf) {
        setNumPages(0);
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
        setNumPages(doc.getPageCount());
      } catch {
        if (!isActive) return;
        setNumPages(0);
        setPdfError(
          "Unable to load this PDF. Re-upload it from the dashboard.",
        );
      }
    };

    void loadPageCount();

    return () => {
      isActive = false;
    };
  }, [hasPdf, pdfUrl]);

  useEffect(() => {
    if (slideCount === 0) {
      setSelectedIndex(0);
      return;
    }
    setSelectedIndex((current) => Math.min(current, slideCount - 1));
  }, [slideCount]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const current = emblaApi.selectedScrollSnap();
    setSelectedIndex(current);
    if (thumbsApi) thumbsApi.scrollTo(current);
  }, [emblaApi, thumbsApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => {
    if (!emblaApi) return;
    emblaApi.scrollTo(index);
  };

  const goPrevious = () => {
    emblaApi?.scrollPrev();
  };

  const goNext = () => {
    emblaApi?.scrollNext();
  };

  const currentPage = selectedIndex + 1;

  return (
    <section aria-label={`${title} slides`} className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-3xl border border-[#EAD2FF] bg-white shadow-[0_20px_50px_-38px_rgba(42,6,89,0.9)]">
        <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-[#F8F1FF]">
          {hasPdf ? (
            pdfError ? (
              <p className="px-4 text-center text-sm font-semibold text-red-700">
                {pdfError}
              </p>
            ) : slideCount > 0 ? (
              <div className="h-full w-full overflow-hidden" ref={emblaRef}>
                <div className="flex h-full">
                  {pageIndexes.map((index) => {
                    const pageNumber = index + 1;
                    return (
                      <div
                        key={`pdf-page-${pageNumber}`}
                        className="h-full min-w-0 flex-[0_0_100%] p-3"
                      >
                        <div className="h-full overflow-hidden rounded-2xl border border-[#EAD2FF] bg-white">
                          <iframe
                            src={`${pdfUrl}#page=${pageNumber}&zoom=page-fit&view=FitH&pagemode=none&toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0`}
                            title={`${title} page ${pageNumber}`}
                            className="h-full w-full border-0"
                            loading="lazy"
                            scrolling="no"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="px-4 text-center text-sm font-semibold text-[#2A0659]/75">
                Loading presentation PDF...
              </p>
            )
          ) : slideCount > 0 ? (
            <div className="h-full w-full overflow-hidden" ref={emblaRef}>
              <div className="flex h-full">
                {fallbackSlides.map((slide) => (
                  <div
                    key={slide.src}
                    className="h-full min-w-0 flex-[0_0_100%] p-3"
                  >
                    <div className="h-full overflow-hidden rounded-2xl border border-[#EAD2FF] bg-white">
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        className="h-full w-full object-cover"
                        width={1400}
                        height={900}
                        priority
                      />
                    </div>
                  </div>
                ))}
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
          disabled={!emblaApi || slideCount <= 1}
        >
          Previous
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
          Slide {slideCount === 0 ? 0 : currentPage} of {slideCount}
        </p>

        <button
          type="button"
          onClick={goNext}
          className="inline-flex items-center rounded-full border border-[#D9B1FF] px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:border-[#B353FF] hover:bg-[#F8F1FF] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Next slide"
          disabled={!emblaApi || slideCount <= 1}
        >
          Next
        </button>
      </div>

      <div className="mt-4 overflow-hidden" ref={thumbsRef}>
        <div className="flex gap-3">
          {pageIndexes.map((index) => {
            const isActive = index === selectedIndex;
            const pageNumber = index + 1;

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
                  <div className="relative h-16 w-[110px] overflow-hidden bg-white">
                    <iframe
                      src={`${pdfUrl}#page=${pageNumber}&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
                      title={`${title} thumbnail ${pageNumber}`}
                      className="pointer-events-none h-full w-full border-0"
                      loading="lazy"
                    />
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
          })}
        </div>
      </div>
    </section>
  );
}
