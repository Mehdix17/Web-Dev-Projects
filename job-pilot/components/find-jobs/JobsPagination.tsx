"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export function JobsPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: Props) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        end = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 1) {
        start = Math.max(totalPages - 3, 2);
      }

      for (let i = start; i <= end; i++) pages.push(i);
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-text-muted">
        Showing {startItem} to {endItem} of {totalItems} results
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed transition-colors rounded-md hover:bg-surface-secondary"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {pages.map((page, idx) => (
          <span key={page} className="flex items-center">
            {idx > 0 && pages[idx - 1] !== page - 1 && (
              <span className="px-1 text-text-muted text-sm">...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 text-sm font-medium rounded-md transition-colors ${
                page === currentPage
                  ? "bg-accent text-accent-foreground"
                  : "text-text-secondary hover:bg-surface-secondary"
              }`}
            >
              {page}
            </button>
          </span>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary disabled:text-text-muted disabled:cursor-not-allowed transition-colors rounded-md hover:bg-surface-secondary"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
