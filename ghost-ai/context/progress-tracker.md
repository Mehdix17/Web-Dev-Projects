# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Auth (03-auth)

## Current Goal

- Auth feature complete. Ready for the next feature unit.

## Completed

- **Design system (01-design-system)**: shadcn/ui installed and configured (Tailwind v4, CSS variables). Components added: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea. `lucide-react` installed. `lib/utils.ts` created with `cn()` helper. `globals.css` updated with dark-only design tokens from `ui-context.md` — all CSS custom properties defined, mapped to Tailwind via `@theme inline`. Root layout updated with `dark` class and correct app metadata.
- **Editor chrome (02-editor)**: `components/editor/editor-navbar.tsx` — fixed-height top navbar with sidebar toggle (`PanelLeftOpen`/`PanelLeftClose`), dark background, subtle bottom border. `components/editor/project-sidebar.tsx` — floating overlay sidebar (slides in from left, does not push content), Projects header with close button, My Projects / Shared tabs with empty placeholder states, full-width New Project button. Dialog pattern deferred to a future feature unit as specified.
- **Auth (03-auth)**: `ClerkProvider` wraps root layout with `dark` theme from `@clerk/ui/themes`, appearance variables mapped to CSS custom properties (no hardcoded colors). `app/page.tsx` redirects authenticated users to `/editor`, unauthenticated to `/sign-in`. Sign-in and sign-up pages use a 50/50 split layout matching the reference screenshot: left panel (differentiated with a background color using `--bg-surface` contrasting with pure black `--bg-base` on the right side) features a solid cyan logo, tagline, descriptive text, and a feature list with beautiful icon blocks (`History`, `Share2`, `FileText`); right panel hosts the centered Clerk form. `UserButton` added to editor navbar right section. `proxy.ts` exists at project root with route protection. `app/editor/page.tsx` wires navbar and sidebar shell. Applied `font-sans` to the HTML body to align with typography guidelines. Enabled GitHub OAuth provider on the development instance via Clerk CLI.

## In Progress

- None.

## Next Up

- Add the next planned feature unit here.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Dark-only theme enforced via `dark` class on `<html>` element. shadcn semantic tokens wired to the project's CSS variable palette. No light mode variant exists.
- Editor sidebar is a floating overlay (`position: fixed`) — it does not shift the canvas or any sibling content.
- Clerk appearance variables reference CSS custom properties (`var(--...)`) directly — no hardcoded hex values in layout.tsx.

## Session Notes

- shadcn v4.13.0 used. Tailwind v4 detected automatically. `components/ui/*` files left unmodified per spec.
- `proxy.ts` (not `middleware.ts`) handles Clerk route protection, as specified.
- `@clerk/ui` was already present in `package.json` at v1.25.1 — no install needed.
