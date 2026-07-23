"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { JobFilters } from "./JobFilters";
import { JobsPagination } from "./JobsPagination";
import type { Job } from "@/types/job";

function getScoreTextClass(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-text-muted";
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 60) return "bg-info";
  return "bg-warning";
}

function CompanyAvatar({ name }: { name: string }) {
  const [errored, setErrored] = useState(false);
  const domain = name.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
  const src = `https://logo.clearbit.com/${domain}`;

  if (errored) {
    return (
      <div className="h-7 w-7 rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
        <Building2 className="h-4 w-4 text-text-muted" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      className="h-7 w-7 rounded-full object-contain bg-white shrink-0"
      onError={() => setErrored(true)}
    />
  );
}

export function JobsTable({ jobs }: { jobs: Job[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  if (jobs.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <p className="text-sm text-text-muted text-center py-8">
          No jobs found. Try a different search.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4">
      <JobFilters />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Company
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Role
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Location
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Match Score
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Matched Skills
              </th>
              <th className="text-left pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Salary Est.
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-border hover:bg-surface-secondary transition-colors"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <CompanyAvatar name={job.company} />
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="text-sm font-medium text-text-primary hover:text-accent transition-colors"
                    >
                      {job.company}
                    </Link>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Link
                    href={`/find-jobs/${job.id}`}
                    className="text-sm text-text-primary hover:text-accent transition-colors"
                  >
                    {job.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-sm text-text-muted">
                  {job.location}
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-1 bg-border-light rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(job.match_score)}`}
                        style={{ width: `${job.match_score}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold ${getScoreTextClass(job.match_score)}`}
                    >
                      {job.match_score}%
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-wrap gap-1">
                    {job.matched_skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-accent-light text-accent whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.matched_skills.length > 3 && (
                      <span className="text-[11px] text-text-muted">
                        +{job.matched_skills.length - 3}
                      </span>
                    )}
                    {job.matched_skills.length === 0 && (
                      <span className="text-[11px] text-text-muted italic">—</span>
                    )}
                  </div>
                </td>
                <td className="py-3 text-sm text-text-primary">
                  {job.salary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <JobsPagination
        currentPage={currentPage}
        totalItems={jobs.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      <p className="text-xs text-text-muted text-center pt-2">
        Jobs by Adzuna
      </p>
    </div>
  );
}
