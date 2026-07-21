# db/AGENTS.md

This folder contains the database schema and storage policies for JobPilot.

## Files

- `db/schema.sql`: Contains table definitions, constraints, triggers, and row level security policies.
- `db/storage_policies.sql`: Contains policies for the storage.objects table.

## Commands

- Run `npx @insforge/cli db import db/schema.sql` to import the tables and public policies.
- Run `npx @insforge/cli db import db/storage_policies.sql` to import the storage policies.

## Conventions

- All public tables must enable row level security.
- Every table row must map to a user id via a foreign key constraint.
- All foreign keys must use ON DELETE CASCADE or ON DELETE SET NULL.
- The resumes storage bucket must be private. Policies must restrict access to resumes/{auth.uid()}/* only.

_Drafted by /sync from the introducing change, worth a quick human pass._
