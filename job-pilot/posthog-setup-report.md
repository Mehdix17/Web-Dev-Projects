# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the JobPilot Next.js 16 App Router application. The setup covers client-side initialization via `instrumentation-client.ts`, a reverse proxy through Next.js rewrites, a reusable server-side PostHog helper, and event tracking across the full OAuth authentication funnel. Users are identified both server-side (on successful OAuth callback) and client-side (on every dashboard load, covering returning sessions). Exception capture is enabled globally via `capture_exceptions: true` and is also called explicitly on unexpected auth failures.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `login_initiated` | User clicks the Google or GitHub OAuth login button on the login page. Includes `provider` property. | `app/(auth)/login/page.tsx` |
| `oauth_login_completed` | OAuth code exchange succeeds and the user is redirected to the dashboard. Identified server-side with user ID and providers. | `app/(auth)/callback/route.ts` |
| `oauth_login_failed` | OAuth authentication fails — either a provider error or a code-exchange error. Includes `error_message` and `stage` properties. | `app/(auth)/callback/route.ts` |
| `sign_out_completed` | User successfully signs out of the application. Captured server-side with the user's distinct ID before the session is cleared. | `actions/auth.ts` |

## Files created / modified

| File | Change |
|---|---|
| `instrumentation-client.ts` | Created — initializes `posthog-js` for client-side tracking with EU host and reverse proxy |
| `next.config.ts` | Updated — added `/ingest/*` rewrites to EU PostHog origin (reverse proxy) |
| `lib/posthog-server.ts` | Created — reusable server-side PostHog client factory (`flushAt: 1`, `flushInterval: 0`) |
| `components/PostHogIdentify.tsx` | Created — client component that calls `posthog.identify()` on mount, used in the dashboard |
| `app/(auth)/login/page.tsx` | Updated — captures `login_initiated` with provider, `captureException` on failure, removed `useEffect`→`setState` anti-pattern |
| `app/(auth)/callback/route.ts` | Updated — captures `oauth_login_failed` (both stages) and `oauth_login_completed`; identifies user server-side |
| `actions/auth.ts` | Updated — captures `sign_out_completed` server-side with the user's ID before session teardown |
| `app/dashboard/page.tsx` | Updated — renders `<PostHogIdentify>` to identify returning users client-side on every page load |
| `.env.local` | Updated — `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` added |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard:** [Analytics basics (wizard)](https://eu.posthog.com/project/228356/dashboard/834565)
- **Login funnel** — conversion from `login_initiated` → `oauth_login_completed`: [View insight](https://eu.posthog.com/project/228356/insights/DSG9pHka)
- **Login attempts by provider** — Google vs GitHub breakdown: [View insight](https://eu.posthog.com/project/228356/insights/6aoiC1F9)
- **Login failures** — `oauth_login_failed` trend over 30 days: [View insight](https://eu.posthog.com/project/228356/insights/HskUnpmd)
- **Sign outs over time** — `sign_out_completed` trend over 30 days: [View insight](https://eu.posthog.com/project/228356/insights/XoBKfJ2O)

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any CI/deployment environment configs so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or equivalent) into CI so production stack traces in PostHog Error Tracking de-minify correctly.
- [ ] Confirm the returning-visitor path also calls `identify` — the `<PostHogIdentify>` component handles this on every dashboard load, but verify that any future authenticated pages also render it (or a similar mechanism).

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
