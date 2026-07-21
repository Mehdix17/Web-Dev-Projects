# Verify: Feature 02 Auth · spec 02 · updated 2026-07-19
_Steps derived from spec 02 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [ ] Visit `/login` → expect login card with Google and GitHub login buttons → AC-1
- [ ] Click "Continue with Google" → expect redirect to Google OAuth login page (with correct redirect_uri back to `/callback`) → AC-2
- [ ] Click "Continue with GitHub" → expect redirect to GitHub OAuth login page (with correct redirect_uri back to `/callback`) → AC-2
- [ ] Login successfully with Google or GitHub → expect redirect to `/callback` and then auto-redirect to `/dashboard` with session cookies set → AC-3
- [ ] On `/dashboard` page → expect user's name, email, user ID, and active provider to be displayed correctly → AC-4
- [ ] Click "Sign Out" button on `/dashboard` → expect cookies to be cleared and redirect back to `/login` → AC-4
- [ ] Visit `/dashboard` while unauthenticated → expect proxy to block access and redirect to `/login?redirect=%2Fdashboard` → AC-5
- [ ] Visit `/profile` while unauthenticated → expect proxy to redirect to `/login?redirect=%2Fprofile` → AC-5
- [ ] Visit `/find-jobs` while unauthenticated → expect proxy to redirect to `/login?redirect=%2Ffind-jobs` → AC-5
- [ ] Visit `/login` while authenticated → expect proxy to detect active session and redirect to `/dashboard` → AC-5

## Commands
- [ ] `npm run build` → builds cleanly with no compilation or static prerender errors.

## Acceptance-criteria coverage
- AC-1 (Login UI): Google + GitHub button layout.
- AC-2 (OAuth init): Client-initiated OAuth flow via Server Actions.
- AC-3 (Callback handler): Server-side PKCE code exchange and cookie mapping.
- AC-4 (Session management): Protected dashboard details view and clean sign out.
- AC-5 (Proxy protection): Route-level security and redirects.
