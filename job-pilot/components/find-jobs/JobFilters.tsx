"use client";

import { Search, ChevronDown } from "lucide-react";
import { useState } from "react";

export function JobFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("match_score");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by company or role..."
          className="w-full bg-surface border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        />
      </div>

      <div className="relative">
        <select
          value={matchFilter}
          onChange={(e) => setMatchFilter(e.target.value)}
          className="bg-surface border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        >
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>

      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-surface border border-border rounded-lg pl-3 pr-8 py-2 text-sm text-text-primary appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
        >
          <option value="match_score">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      </div>
    </div>
  );
}
