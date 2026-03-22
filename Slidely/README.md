# Slidely

Slidely is a presentation-design portfolio and client showcase built with Next.js App Router.

It includes:

- A public marketing site (`/`, `/gallery`, `/about`, `/contact`)
- Project detail presentation viewer pages (`/gallery/[slug]`)
- A protected admin area (`/admin`) for managing project content

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Neon Postgres + Drizzle ORM
- Custom interaction layer:
  - Kursor custom pointer
  - Lenis smooth scrolling
  - Embla carousel + PDF rendering for slide decks

## Design And UI Guardrails

Before implementing or editing any UI feature, read:

- `DESIGN.md`

This document defines:

- Color/typography system
- Spacing and component behavior
- Motion and cursor rules
- Section/page style conventions
- Do/Don't rules for agents and contributors

## Getting Started

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

If the local build cache gets weird, use:

```bash
npm run dev:reset
```

Open:

- `http://localhost:3000`

## Scripts

- `npm run dev` - start development server
- `npm run dev:reset` - clear `.next` and run dev server on port 3000
- `npm run lint` - run ESLint
- `npm run build` - production build
- `npm run start` - run production server
- `npm run admin:hash -- "your-password"` - generate admin password salt/hash
- `npm run db:generate` - generate Drizzle SQL migrations from schema
- `npm run db:push` - push Drizzle schema to the configured Postgres database
- `npm run db:migrate-data` - import existing `data/works.json` into the database

## Admin Setup

1. Create a local env file from `.env.example`.
2. Set `ADMIN_AUTH_SECRET` to a 32+ character random value.
3. Set `ADMIN_USERNAME`.
4. Generate secure password credentials:

```bash
npm run admin:hash -- "your-password"
```

5. Copy the generated values into:
   - `ADMIN_PASSWORD_SALT`
   - `ADMIN_PASSWORD_HASH`

Then open `/admin`, sign in, and manage work items (CRUD, thumbnail upload, PDF upload, search, pagination).

## Project Notes

- Route protection for admin APIs is handled in `src/proxy.ts`.
- Public project data is served by `src/app/api/works` endpoints.
- Gallery is the canonical public listing route (`/gallery`).
- Legacy `/work` routes are retained for compatibility.

## Deployment

Recommended:

- Vercel for fastest setup

Any Node-compatible platform works as long as environment variables are set correctly.

### Vercel Free Tier Production Setup

For reliable persistence on Vercel, this project uses:

- Neon Postgres for metadata (`DATABASE_URL`)
- Vercel Blob for uploaded thumbnails and PDFs (`BLOB_READ_WRITE_TOKEN`)
- Optional Blob access mode override (`BLOB_ACCESS=public|private`, default `public`)

Setup checklist:

1. Create a Neon Postgres database and set `DATABASE_URL`.
2. In Vercel Storage, create a Blob store and set `BLOB_READ_WRITE_TOKEN`.

- If your Blob store is configured as private, also set `BLOB_ACCESS=private`.

3. Set admin auth variables (`ADMIN_AUTH_SECRET`, `ADMIN_USERNAME`, and password hash/salt values).
4. Run:

```bash
npm run db:generate
npm run db:push
npm run db:migrate-data
```

5. Deploy to Vercel.

Note: When `BLOB_READ_WRITE_TOKEN` is missing (local dev), uploads fallback to local `public/uploads/works` storage.
