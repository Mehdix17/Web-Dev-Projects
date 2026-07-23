# Review, feature-10-adzuna-job-discovery, 2026-07-23

**Reviewed by**: deepseek (author on deepseek -- degraded review, same model, shares blind spots)
**Scope**: 6 source files (agent/*.ts, app/api/agent/find/route.ts, components/find-jobs/*.tsx, lib/utils.ts), uncommitted
**Verdict**: Approve with nits

## Summary

This change wires the Find Jobs page to real data: Adzuna API discovery, OpenRouter scoring, database persistence, and a polished results table with company logos, match scores, location, and matched skills. The architecture is clean: agent modules separate from the route handler, components are focused, error handling covers partial failures. The main concerns are minor: heuristic company logo resolution will frequently fall back, and internal error details could leak in unhandled exceptions.

## Minor

### PostHog capture before shutdown race, `app/api/agent/find/route.ts:58`
**Problem**: `posthog.capture()` calls (lines 58, 75, 170) are fire and forget. `posthog.shutdown()` on line 192 is awaited but it only flushes what's already queued. If the captures haven't been processed by the SDK's internal queue before shutdown is called, events could be silently dropped.
**Why it matters**: The spec requires `job_search_started` and `job_found` events. Under load or on a slow network, events may not arrive at PostHog.
**Suggested fix**: Return the promise from each `posthog.capture()` and `await` it alongside the other operations, or move `shutdown()` before the response and ensure captures are awaited.

### Error message leaks internal details, `app/api/agent/find/route.ts:204`
**Problem**: The catch block returns `error.message` to the client in the 500 response. While OpenAI redacts API keys from its errors, database errors from InsForge could include table/schema details not meant for end users.
**Why it matters**: Internal schema details in error responses are an information disclosure pattern.
**Suggested fix**: Return a generic message like "Internal server error" and log the full error server-side.

## Nits

### Duplicate Job type, `components/find-jobs/SearchControls.tsx:7` and `JobsTable.tsx:9`
`JobResult` and `Job` are identical types defined in two files. If the API response shape changes, they can drift. Extract to a shared type file (e.g. `types/job.ts`).

### Spec deviation: resultsPerPage defaults to 20 not 10
Spec AC-8 says default 10, code uses 20. The user requested this change. The spec should be updated to reflect the new default.

## Strengths

- Resilient error handling: batch DB insert with individual fallback, failures logged to `agent_logs`, run still completes.
- Clean separation: agent modules (`adzuna.ts`, `matcher.ts`) are independently testable and the route handler is a thin orchestrator.
- Null safe: the `completion?.choices?.[0]?.message?.content` chain in matcher.ts prevents the crash that was seen earlier.

## Test coverage

No test runner is configured (`test-preferences.json` not found). This is a genuine gap, noted once. The build compiles and the app boots; verification relies on `/check verify`.
