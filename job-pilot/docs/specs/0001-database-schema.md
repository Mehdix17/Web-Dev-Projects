# 0001. Database Schema for JobPilot

**Date**: 2026-07-21
**Status**: Accepted

## Summary

This decision defines the database tables and storage configuration on the InsForge platform. We will create four tables to store candidate profiles, agent runs, job matches, and logs. We will also set up a private storage bucket for resume files, enable security policies, and create automatic triggers.

## Context

JobPilot requires a database to store user profile data, job search results, agent run histories, and system logs. This database must enforce security and data separation so users can access only their own records. We need to create these schemas before building application features because all subsequent modules depend on this data layer.

Without a defined schema, we would lack consistency in data structures, which could lead to mismatches between the server and database. We also need to configure the InsForge storage bucket to store resume documents securely.

## Requirements

**User stories**:
* As an authenticated user, I want my profile and job data stored securely so that I can access them later.
* As an authenticated user, I want my uploaded resume stored privately so that unauthorized users cannot access it.

**Acceptance criteria**:
* **AC-1**: Database tables `profiles`, `agent_runs`, `jobs`, and `agent_logs` must be created in InsForge with the exact columns and types defined in the data model.
* **AC-2**: Foreign key constraints with ON DELETE CASCADE must be configured from `agent_runs`, `jobs`, and `agent_logs` to their parent tables.
* **AC-3**: Row Level Security (RLS) policies must be enabled on all four tables to restrict access so authenticated users can only read and write their own records.
* **AC-4**: A database trigger must be created to automatically update the `updated_at` column in the `profiles` table when a profile is updated.
* **AC-5**: The `resumes` storage bucket must be created on InsForge with security policies allowing authenticated users to read and write files in their own folder `resumes/{auth.uid()}/*` only.

## Options considered

### Option 1: Execute SQL scripts on InsForge

We write a complete SQL script containing the table structures, constraints, RLS policies, trigger function, and trigger definition. We run this script on the InsForge dashboard database editor or via CLI tools.

**Pros**:
* Fast setup in development
* Keeps the schema configuration central and readable in one place
* Allows direct deployment using CLI or MCP tools

**Cons**:
* Requires manual execution if we do not automate the scripts

### Option 2: Maintain local migration files

We organize local SQL files in a database folder to track schema changes incrementally over time.

**Pros**:
* Better version tracking for production deployments
* Clear history of database modifications

**Cons**:
* Unnecessary complexity for the initial phase of the application

## Decision

**Chosen option**: Option 1: Execute SQL scripts on InsForge

We will execute raw SQL scripts directly on the InsForge database editor to initialize the tables, foreign keys, triggers, and security policies.

**Implementation skills**: `insforge` (insforge/sdk, .agents/skills/insforge/)

## Rationale

This choice allows rapid setup and validation of the database schema in our development environment. Since the project is in its early stages, we want to establish the tables and buckets quickly to unblock feature development. Using SQL scripts is simple and direct. It matches the project stack conventions by leveraging InsForge native capabilities.

## Feature design

**Data model sketch**:

Table: `profiles`
* `id` (uuid, primary key, references `auth.users(id)`)
* `full_name` (text, nullable)
* `email` (text, required)
* `phone` (text, nullable)
* `location` (text, nullable)
* `current_title` (text, nullable)
* `experience_level` (text, nullable)
* `years_experience` (integer, nullable)
* `skills` (text[], default `'{}'`)
* `industries` (text[], default `'{}'`)
* `work_experience` (jsonb, default `'[]'`)
* `education` (jsonb, default `'[]'`)
* `job_titles_seeking` (text[], default `'{}'`)
* `remote_preference` (text, nullable)
* `preferred_locations` (text[], default `'{}'`)
* `salary_expectation` (text, nullable)
* `cover_letter_tone` (text, nullable)
* `linkedin_url` (text, nullable)
* `portfolio_url` (text, nullable)
* `work_authorization` (text, nullable)
* `resume_pdf_url` (text, nullable)
* `is_complete` (boolean, default `false`)
* `created_at` (timestamptz, default `now()`)
* `updated_at` (timestamptz, default `now()`)

Table: `agent_runs`
* `id` (uuid, primary key, default `gen_random_uuid()`)
* `user_id` (uuid, references `profiles(id)` ON DELETE CASCADE, required)
* `status` (text, default `'running'`)
* `job_title_searched` (text, nullable)
* `location_searched` (text, nullable)
* `jobs_found` (integer, default `0`)
* `started_at` (timestamptz, default `now()`)
* `completed_at` (timestamptz, nullable)

Table: `jobs`
* `id` (uuid, primary key, default `gen_random_uuid()`)
* `run_id` (uuid, references `agent_runs(id)` ON DELETE SET NULL, nullable)
* `user_id` (uuid, references `profiles(id)` ON DELETE CASCADE, required)
* `source` (text, required, check constraint `'search'` or `'url'`)
* `source_url` (text, required)
* `external_apply_url` (text, required)
* `title` (text, required)
* `company` (text, required)
* `location` (text, required)
* `salary` (text, nullable)
* `job_type` (text, nullable)
* `about_role` (text, required)
* `responsibilities` (text[], default `'{}'`)
* `requirements` (text[], default `'{}'`)
* `nice_to_have` (text[], default `'{}'`)
* `benefits` (text[], default `'{}'`)
* `about_company` (text, nullable)
* `match_score` (integer, required)
* `match_reason` (text, required)
* `matched_skills` (text[], default `'{}'`)
* `missing_skills` (text[], default `'{}'`)
* `company_research` (jsonb, nullable)
* `found_at` (timestamptz, default `now()`)

Table: `agent_logs`
* `id` (uuid, primary key, default `gen_random_uuid()`)
* `run_id` (uuid, references `agent_runs(id)` ON DELETE CASCADE, required)
* `user_id` (uuid, references `profiles(id)` ON DELETE CASCADE, required)
* `message` (text, required)
* `level` (text, default `'info'`)
* `job_id` (uuid, references `jobs(id)` ON DELETE SET NULL, nullable)
* `created_at` (timestamptz, default `now()`)

**State transitions**:
No state transitions apply to database schema definition.

**API surface**:
No API endpoints apply to this database schema.

**Value sourcing**:
| Action | Value produced / displayed | Source |
|---|---|---|
| Initialize profiles table | profiles data fields | InsForge profiles table |
| Initialize agent_runs table | agent_runs records | InsForge agent_runs table |
| Initialize jobs table | jobs matching details | InsForge jobs table |
| Initialize agent_logs table | agent run messages | InsForge agent_logs table |

**Key invariants**:
* The `source` column in the `jobs` table must only contain the values `'search'` or `'url'`.
* The `user_id` column in all tables must refer to a valid profile.
* The `is_complete` status in the `profiles` table is true only when required fields (name, email, current title) are populated.

**Security model**:
* RLS policies will be enabled on `profiles`, `agent_runs`, `jobs`, and `agent_logs`.
* Every row level check ensures users can only select, insert, update, or delete rows where the `user_id` matches their own InsForge user identifier `auth.uid()`.
* Access is restricted to authenticated users.

**Configuration required**:
No new environment variables are required. We will use the existing InsForge credentials.

**Critical test scenarios**:
* Happy path: Create all tables, add a new profile, verify triggers and timestamps (verifies **AC-1**, **AC-4**).
* Failure case: Insert a job record with an invalid source type, verify constraint check failure (verifies **AC-1**).
* Auth/permission: Read tables as a different authenticated user, verify query returns empty results (verifies **AC-3**).

## Build plan

1. Write the SQL script to create tables `profiles`, `agent_runs`, `jobs`, and `agent_logs` with all keys and constraints (satisfies **AC-1**, **AC-2**).
2. Write the SQL script to enable Row Level Security and configure user isolation policies (satisfies **AC-3**).
3. Write the trigger function and bind it to the `profiles` table to manage `updated_at` (satisfies **AC-4**).
4. Create the resumes storage bucket on the InsForge dashboard and write the storage policies (satisfies **AC-5**).

## Consequences

**Positive**:
* Quick availability of the data layer for development
* Security and data isolation enforced at the database level from day one
* Automated timestamp management via triggers

**Negative / tradeoffs**:
* Manual migrations are required to update schemas as features evolve

## Follow-up

* [ ] Execute the finalized SQL schema on the InsForge Postgres editor.
* [ ] Verify that RLS policies prevent users from accessing other users data.
* [ ] Ensure the storage bucket resumes is created with private access.
