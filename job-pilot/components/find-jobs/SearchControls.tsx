"use client";

import { Search, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { JobsTable } from "./JobsTable";
import type { Job } from "@/types/job";

type SearchResponse = {
  success: boolean;
  data?: {
    runId: string;
    jobs: Job[];
    totalFound: number;
    totalSaved: number;
  };
  error?: string;
};

function LoadingSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3 px-1">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        <span className="text-sm text-text-secondary">Searching for jobs...</span>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <div className="h-8 w-8 rounded-full bg-border-light" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-border-light rounded w-1/3" />
            <div className="h-3 bg-border-light rounded w-1/2" />
          </div>
          <div className="h-3 bg-border-light rounded w-16" />
          <div className="h-3 bg-border-light rounded w-20" />
        </div>
      ))}
    </div>
  );
}

export function SearchControls() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Job[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isSearching) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isSearching]);

  const progressText =
    elapsed < 3
      ? "Discovering jobs..."
      : elapsed < 8
        ? "Scoring jobs against your profile..."
        : "Still scoring... good matches take time";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || isSearching) return;

    setIsSearching(true);
    setResults(null);
    setError(null);

    try {
      const res = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: jobTitle.trim(), location: location.trim() || undefined }),
      });

      const data: SearchResponse = await res.json();

      if (!data.success || !data.data) {
        setError(data.error || "Search failed");
        return;
      }

      setResults(data.data.jobs);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Job Title
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Frontend Engineer"
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote, New York..."
                className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!jobTitle.trim() || isSearching}
            className="bg-accent text-accent-foreground text-sm font-medium px-5 py-2 rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Find Jobs
              </>
            )}
          </button>

          {isSearching && (
            <span className="text-xs text-text-muted">{progressText}</span>
          )}
        </div>

        {error && (
          <div className="bg-error-lightest border border-error/20 text-error-foreground rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-error shrink-0" />
            {error}
          </div>
        )}
      </form>

      {isSearching && <LoadingSkeleton />}
      {results && <JobsTable jobs={results} />}
    </div>
  );
}
