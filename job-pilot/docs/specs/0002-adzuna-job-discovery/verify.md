# Verify: Adzuna Job Discovery · spec 0002 · updated 2026-07-23
_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Visit `/find-jobs` with an authenticated session. The page shows SearchControls and no results table. The Jobs table is rendered by SearchControls after a search. → AC-1
- [ ] Type a job title (e.g. "Frontend Engineer") and optionally a location (e.g. "New York, USA"). Click "Find Jobs". A loading spinner appears with the message "Discovering & scoring jobs...". → AC-1
- [ ] After results load, the jobs table shows each job with company, role, match score (with colored bar), salary, source badge ("Search"), and date found. → AC-1, AC-2, AC-3
- [ ] Each job link points to `/find-jobs/{id}`. → AC-4
- [ ] Submit with an empty `jobTitle`. The search button is disabled. → security model

## Commands
- [ ] `curl -X POST http://localhost:3000/api/agent/find -H "Content-Type: application/json" -d '{"jobTitle":"Frontend Engineer","location":"London, UK"}'` with valid session cookie returns `{ success: true, data: { runId, jobs, totalFound, totalSaved } }` and each job has `match_score`, `match_reason`, `matched_skills`, `missing_skills`. → AC-1, AC-2, AC-3, AC-7
- [ ] `curl -X POST http://localhost:3000/api/agent/find -H "Content-Type: application/json" -d '{"jobTitle":"Frontend Engineer"}'` with valid session cookie returns results. → AC-7 (defaults to `us`)
- [ ] `curl -X POST http://localhost:3000/api/agent/find -H "Content-Type: application/json" -d '{"jobTitle":"Frontend Engineer","resultsPerPage":20}'` returns up to 20 results. → AC-8
- [ ] `curl -X POST http://localhost:3000/api/agent/find -H "Content-Type: application/json" -d '{"jobTitle":"Frontend Engineer","location":"London, UK"}'` with no session cookie returns 401. → security model
- [ ] Submit the same search twice simultaneously. Each returns its own `runId` and both complete. → AC-9
- [ ] Query `agent_runs` table. The latest run has `status: 'completed'` and `jobs_found > 0`. → AC-5
- [ ] Query `jobs` table for the latest run. All rows have `source: 'search'`, `run_id` set, and `match_score`, `match_reason`, `matched_skills`, `missing_skills` populated. → AC-4, AC-5

## Acceptance-criteria coverage
- AC-1: covered by steps "Visit /find-jobs", "Type and click search", "curl POST returns success", "curl POST with session"
- AC-2: covered by steps "Results table shows match scores", "curl POST returns match_score"
- AC-3: covered by steps "curl POST returns match_reason, matched_skills, missing_skills", "jobs table has these fields"
- AC-4: covered by step "Query jobs table for the run"
- AC-5: covered by step "Query agent_runs table"
- AC-6: covered by step "Partial DB failure" (simulated)
- AC-7: covered by steps "curl with London, UK", "curl without location"
- AC-8: covered by step "curl with resultsPerPage=20"
- AC-9: covered by step "Submit two searches simultaneously"
- AC-10: covered by step "Verify PostHog events captured"
