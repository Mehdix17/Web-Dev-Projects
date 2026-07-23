# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 3 — Find Jobs Page
**Last completed:** 10 Adzuna Job Discovery
**Next:** 11 Filter + Sort + Pagination

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- **2026-07-23 — Fix resume PDF access after generation**: The `/api/resume/generate` and `/api/resume/extract` routes were using `getPublicUrl()` and `createSignedUrl()` which are not part of the InsForge Storage SDK (`@insforge/sdk` v1.4.5). The correct API is to use `data.url` directly from the `upload()` response. This was causing the `resumeUrl` to be empty, so the "View Document" link never appeared after generation. Also improved the UX: after generation, a green success banner with a prominent "View Resume" button is shown instead of a brief "Generated!" flash that disappeared after 3 seconds.
- **2026-07-23 — Fix storage URL 401 and OpenRouter models**: The `data.url` from InsForge storage requires auth (bucket is auth-only), so `window.open(url)` returned 401. Created `/api/resume/download` proxy route that downloads the file using the authenticated server client and serves it as a PDF response. All view-resume buttons now point to this route instead of the raw storage URL. Also updated OpenRouter free model slugs in `lib/utils.ts` to working models (`meta-llama/llama-3.3-70b-instruct:free`, `google/gemma-4-31b-it:free`, `qwen/qwen3-coder:free`, `openrouter/free`).
- **2026-07-23 — Fix View Resume showing old uploaded file instead of generated one**: The generate route and download route both used the same hardcoded key `${userId}/resume.pdf`. The `@insforge/sdk` `upload()` method is idempotent for the same path; when a file already exists, it returns the existing file's metadata instead of uploading a new version. The generate route now uses a unique timestamped path (`${userId}/resume-{timestamp}.pdf`), returns the `key` from the upload response, and the download route accepts a `key` query parameter. The client stores the key and passes it when opening the generated resume.
- **2026-07-23 — Feature 10 Adzuna Job Discovery built**: Created `agent/adzuna.ts` (Adzuna API client with country detection, IT-jobs filter), `agent/matcher.ts` (OpenRouter job scoring via `getAiCompletion`), and `app/api/agent/find/route.ts` (POST handler). The agent tables (`agent_runs`, `jobs`, `agent_logs`) already existed in the DB. Updated `SearchControls` to call the real API instead of mock data. Updated `JobsTable` to accept a `jobs` prop instead of hardcoded `MOCK_JOBS`. Typecheck passes clean.

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
