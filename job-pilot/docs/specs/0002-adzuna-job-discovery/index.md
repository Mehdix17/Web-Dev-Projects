# 0002. Adzuna Job Discovery

**Date**: 2026-07-23
**Status**: Accepted

## Summary

This feature powers the Find Jobs page with real data. When a user searches by job title and location, the system calls the Adzuna API, scores each returned job against the user's profile using our OpenRouter API, and saves the scored jobs to the database. The existing Find Jobs UI (Feature 09) already shows the search form and the results table -- this spec defines the backend agent and the API route that feeds it real data. Users will see actual jobs with match scores, and the results will persist across sessions.

## Requirements

**User stories**:
- As a job seeker, I want to search for jobs by title and location so I can discover relevant openings.
- As a job seeker, I want each job scored against my profile so I know which ones fit my skills best.
- As a job seeker, I want the search results saved so I can review them later on the dashboard.

**Acceptance criteria** (the contract, each criterion is independently checkable):
- **AC-1**: A POST to `/api/agent/find` with `jobTitle` and optionally `location` calls the Adzuna API with the IT jobs category filter and returns matching jobs.
- **AC-2**: Each discovered job is scored 0 to 100 by OpenRouter API against the authenticated user's profile.
- **AC-3**: Each scored job record includes `match_score`, `match_reason`, `matched_skills` (array), and `missing_skills` (array) as returned by OpenRouter API.
- **AC-4**: All scored jobs are saved to the `jobs` table with `source='search'` and linked to a single `agent_runs` record.
- **AC-5**: An `agent_runs` record is created before discovery starts (status `running`) and updated with the total found count when done (status `completed`).
- **AC-6**: If some jobs fail to save (DB error), the successful ones are still persisted, the failure is logged to `agent_logs`, and the `agent_runs` record still completes with the partial count.
- **AC-7**: Country (for the Adzuna API endpoint) is detected from common patterns in the `location` string and defaults to `us` when detection fails.
- **AC-8**: Results per page is configurable via a `resultsPerPage` request field and defaults to 20.
- **AC-9**: Multiple concurrent searches by the same user each create their own `agent_runs` record and do not interfere with each other.
- **AC-10**: The PostHog event `job_search_started` fires when the search begins, and `job_found` fires for each scored job (including its match score).

## Decision

**Chosen option**: Option 1: Synchronous API route with Adzuna + OpenRouter API.

The API route at `POST /api/agent/find` handles the entire flow: it validates the request, looks up the user's profile, creates an `agent_runs` record, calls Adzuna, scores each job with OpenRouter API, saves results to the `jobs` table, and returns the summary. The client shows a loading state during the wait. No background queue, no polling, no edge function.

This is the right call because the volume is low (one user, on demand, a few searches per day) and the infrastructure cost of a background job or edge function far exceeds the benefit at this stage. If timeout becomes a real problem (e.g. many jobs or slow OpenRouter API), we can migrate to Option 2 later with a clear migration path.

**Implementation skills**: `insforge` (`insforge/app-integration`, `.claude/skills/insforge/`)

## Feature design

**Data model sketch**:

The data model is already defined in `docs/specs/0001-database-schema.md`. This feature uses three existing tables:

- `agent_runs`: tracks each discovery attempt. Created as `running` before Adzuna is called, updated to `completed` with the job count after all jobs are processed.
- `jobs`: stores each discovered and scored job. Every job links to its `agent_runs` record via `run_id`.
- `agent_logs`: log entries for each job processed. Used to record individual job failures without failing the whole run.

**State transitions**:

```
agent_runs: running (created) → completed (jobs saved, count set)
                                   → completed (partial, some jobs failed)
                                   → completed (no jobs found from Adzuna)
```

There is no failed state because the run completes even when jobs fail; errors are logged individually.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| /api/agent/find | POST | jobTitle: string (req) | success: boolean | bearer (cookie) | 401 unauthorized |
|   |   | location: string (opt) | runId: string |   | 422 bad input (missing jobTitle) |
|   |   | resultsPerPage: number (opt, default 10) | jobsFound: number |   | 500 internal (Adzuna or OpenRouter API failure) |
|   |   |   | message: string |   |   |

**Value sourcing** (every value the acceptance criteria need and where it comes from):

| Action | Value produced or displayed | Source |
|---|---|---|
| POST /api/agent/find | runId | `agent_runs.id` from DB insert |
|   | jobsFound | Count of jobs saved to DB |
|   | strongMatches | Count of saved jobs where `match_score >= MATCH_THRESHOLD` (from `lib/utils.ts`) |
|   | message | Derived string: "Found {jobsFound} jobs and saved {strongMatches} strong matches." |
|   | job_search_started event | PostHog capture in the route handler, uses request params |
|   | job_found event per job | PostHog capture per job, uses computed score |
| Each scored job | match_score, match_reason | OpenRouter API JSON response, parsed and validated |
|   | matched_skills, missing_skills | OpenRouter API JSON response, arrays of strings |
|   | source | Constant: `'search'` |
| Each job's structured fields | title, company, location, salary, job_type, about_role | Mapped from Adzuna API response |
|   | external_apply_url | `job.redirect_url` from Adzuna |
| Country for Adzuna API | country code | Detected from `location` string via pattern matching; fallback `'us'` |

**Key invariants**:
- Every `jobs` row has `user_id` set to the authenticated user's ID. No unowned jobs.
- `source` is always `'search'` for Adzuna discovered jobs. Never any other value.
- Adzuna API always called with `category=it-jobs`. Never without this filter.
- Every OpenRouter API call uses `response_format: { type: 'json_object' }` and `temperature: 0.3`.
- The match threshold (for "strong match" count) is `MATCH_THRESHOLD` from `lib/utils.ts`. Never hardcoded.
- Every job record includes the full structured fields from the architecture schema. No partial records.

**Security model**:
- The endpoint is protected by the existing session cookie. The route handler calls `createInsforgeServer()` and gets the current user via `insforge.auth.getUser()`. No session, no access.
- All jobs are scoped to `user_id`. Every query filters by `user_id`. No user can see another user's jobs.
- No user input reaches OpenRouter API or Adzuna without being passed as a plain string parameter. No injection risk (both are API calls with string parameters, not SQL).
- No secrets are exposed. The OpenRouter API key and Adzuna credentials are server-side environment variables only.

**Configuration required**:
- `ADZUNA_APP_ID`: Adzuna API application ID (already exists)
- `ADZUNA_APP_KEY`: Adzuna API application key (already exists)
- `OPENROUTER_API_KEY`: OpenRouter API key for scoring (already exists in `.env.local`)

Zero new environment variables are needed for this feature.

**Critical test scenarios** (each maps to an acceptance criterion):
- Happy path: Submit a search for "Frontend Engineer" with location "New York, USA". System returns 10 jobs scored and saved. Verifies **AC-1**, **AC-2**, **AC-4**, **AC-7**.
- Partial DB failure: After scoring, one of 10 jobs fails to insert (simulated DB error). The other 9 are saved, the error is logged, and the run completes with `jobsFound=9`. Verifies **AC-6**.
- Country detection: Submit with location "London, UK". Country resolves to `gb`. Verifies **AC-7**.
- No location: Submit with empty location. Country defaults to `us`. Verifies **AC-7**.
- Configurable results: Submit with `resultsPerPage=20`. Adzuna returns up to 20 results. Verifies **AC-8**.
- No session: Submit without a valid session cookie. Returns 401. Verifies security model.
- PostHog events: After a successful search, verify `job_search_started` and `job_found` events were captured with correct properties. Verifies **AC-10**.

## Build plan

The build plan follows the project's default build approach (Facade with mock data first, then wire backend). Feature 09 already built the UI shell. This feature adds the real backend logic.

1. **Create the agent route handler** (`app/api/agent/find/route.ts`). Implement the POST handler: validate inputs, get the authenticated user, create the `agent_runs` record, call the discovery agent, save results, fire PostHog events, return the summary response. Wrap the entire flow in a try/catch with error logging. Satisfies **AC-1**, **AC-5**, **AC-6**, **AC-9**, **AC-10**.

2. **Build the Adzuna job discovery function** (`agent/adzuna.ts`). Implement the function that calls the Adzuna API with the job title, location, and country. Parse the response and map each raw result to a `RawJob` type. Detect country from the location string using a simple pattern match. Satisfies **AC-1**, **AC-7**, **AC-8**.

3. **Build the OpenRouter API matching function** (`agent/matcher.ts`). Implement the function that takes a single raw job and the user's profile, calls the OpenRouter API with `response_format: { type: 'json_object' }` and `temperature: 0.3`, and returns the scored result (match_score, match_reason, matched_skills, missing_skills). Wrap each call in a try/catch; if OpenRouter API fails for one job, log the error and skip that job rather than failing the entire run. Satisfies **AC-2**, **AC-3**, **AC-6**.

4. **Wire the discovery and scoring together in the route handler**. The route handler calls discovery, then iterates over each raw job calling the matcher, saves each scored job to the `jobs` table via InsForge, and logs progress and errors to `agent_logs`. Updates the `agent_runs` record with the final count. Satisfies **AC-4**, **AC-5**, **AC-6**.

5. **Add PostHog event capture**. Fire `job_search_started` when the search begins (after validation, before Adzuna call). Fire `job_found` for each scored job with userId, source, and matchScore. Use the server-side PostHog client from `lib/posthog-server.ts`. Call `await posthog.shutdown()` at the end of the handler to flush events. Satisfies **AC-10**.

## Consequences

**Positive**:
- The Find Jobs page transitions from mock data to real, persisted results.
- The same agent logic forms the foundation for future job sources (URL import, other APIs).
- All data is in the database, enabling dashboard stats, activity feed, and job details pages.

**Negative / tradeoffs**:
- The response time depends on Adzuna and OpenRouter API latency. A search with 10 jobs takes approximately 8 to 12 seconds. The user sees a loading state but cannot navigate away without losing progress.
- OpenRouter API costs scale with the number of jobs per search. Each scored job costs one API call (roughly 300 tokens). At 10 jobs per search, this is a few cents per search.
- There is no retry logic for transient OpenRouter API or Adzuna failures; a job that fails scoring is skipped, not retried.

**Neutral**:
- The `agent_runs` table tracks all searches. Old records accumulate over time; no cleanup strategy is defined yet.
- The synchronous model means Vercel function timeout applies (10s on Hobby, 60s on Pro, 300s on Enterprise). At the current default of 10 jobs, this is well within limits.
