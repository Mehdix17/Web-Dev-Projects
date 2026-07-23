# Rationale: 0002. Adzuna Job Discovery

## Context

The Find Jobs page currently renders with static mock data. Users can type a job title and location, click Find Jobs, and see a loading state, but no real API is called and no data is persisted. For the product to deliver value, the search must hit the Adzuna job search API (filtered to IT jobs), score each result intelligently against the user's saved profile using our OpenRouter API, and store everything in the database so the job list persists, details are accessible, and dashboard stats can be computed.

The agent discovery flow sits between the browser UI and the database. It is a synchronous server-side operation triggered by a POST request from the client. The user waits for results; no background queue or job system is needed at this stage.

The main forces at play are: third party API reliability (Adzuna may be slow or return errors), OpenRouter API token costs per job scored, the need to scope all data to the authenticated user, and the requirement that partial failures never leave the user with no results at all.

## Options considered

### Option 1: Synchronous API route with Adzuna + OpenRouter API

The server receives the request, calls Adzuna, calls OpenRouter API for each job sequentially, saves everything, and returns the full result to the client in one response. The client shows a loading spinner during the wait.

**Pros**:
- Simplest architecture. No queue, no background job infrastructure, no polling.
- The user gets the complete result in one round trip.
- Easy to debug and log.

**Cons**:
- Response time depends on the number of jobs (up to ~15 seconds for 10 jobs scored via OpenRouter).
- The Next.js route handler must not exceed the platform's timeout (Vercel Hobby is 10s, Pro is 60s).

### Option 2: Asynchronous background job with polling

The API route returns immediately with a `runId`. A background job (via a queue or a separate async function) processes the Adzuna call and scoring. The client polls a status endpoint until the run completes.

**Pros**:
- No timeout pressure. The job can run as long as needed.
- User can navigate away and come back to see results.

**Cons**:
- Requires a background job infrastructure (Vercel background functions, a queue, or a separate worker).
- Client needs polling logic and loading states across navigations.
- Significantly more operational complexity for no demonstrated need.

### Option 3: Edge function (InsForge Functions) for the job discovery

Move the Adzuna + OpenRouter API processing to an InsForge serverless function, called from the API route.

**Pros**:
- Offloads processing from the Next.js server.
- Long running function (InsForge functions have higher timeouts).

**Cons**:
- Adds a network hop and new deployment surface.
- The function would need access to InsForge DB directly, duplicating data access patterns.
- More complex to debug and develop locally.

### Option 4: Client-side scoring (score in the browser)

The API route calls Adzuna and returns raw jobs. The scoring runs client-side via a call to OpenRouter API from the browser.

**Pros**:
- Offloads scoring from the server entirely.
- Server response is instant.

**Cons**:
- Exposes the API key to the client, which is a security risk.
- Client devices may have inconsistent or slow OpenRouter API access.
- The user must keep the page open for scoring to complete.
- Scored results would be lost on page refresh unless saved server-side anyway.

## Rationale

The synchronous approach wins on simplicity and operational cost. At the current scale (single user, manually triggered searches), adding a queue or edge function introduces infrastructure that must be built, deployed, and maintained without solving any real problem. The timeout risk on Vercel Hobby (10s) is real but manageable: with 10 jobs, each OpenRouter API call taking about 1 to 2 seconds, plus the Adzuna call, the total should stay under 8s. If it becomes a bottleneck, the per job scoring can be parallelized (Promise.allSettled for OpenRouter API calls) before reaching for a queue.

Option 2 (async) was the most credible alternative. It is the right pattern when response times exceed timeout limits or when the user should not wait. Neither condition holds today. Option 3 (InsForge Functions) adds a new deployment target and credential surface for no benefit. Option 4 (client-side scoring) would expose the API key -- that alone rules it out on security grounds.

The concurrent search decision (multiple runs allowed) follows naturally from the synchronous model: each request creates its own `agent_runs` record and writes its own set of jobs. There is no shared state to corrupt, and the user benefits from being able to search in parallel.

Country detection from the location string is intentionally a best-effort heuristic. The location field is free text, so exact parsing is unreliable; a simple pattern match on known country names and codes covers most cases and falls back to `us` cleanly.

## References

**Project sources** (verifiable, in this repo):
- `context/library-docs.md` -- Adzuna API patterns, InsForge client usage, OpenRouter API scoring patterns
- `docs/specs/0001-database-schema.md` -- the data model this feature writes to
- `context/architecture.md` -- system boundaries, data flow, existing table definitions

**Practices & standards**:
- Idempotency is not required here because each user action creates a new agent_runs record and there is no money or external side effect from duplicate calls. The Adzuna API is read-only with no write side effect.
- All errors are logged to the database (agent_logs) rather than thrown. This matches the project invariant that agent failures never crash the run.
