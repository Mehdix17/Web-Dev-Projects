-- Database schema initialization for JobPilot

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    current_title TEXT,
    experience_level TEXT,
    years_experience NUMERIC,
    skills TEXT[] DEFAULT '{}',
    industries TEXT[] DEFAULT '{}',
    work_experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    job_titles_seeking TEXT[] DEFAULT '{}',
    remote_preference TEXT,
    preferred_locations TEXT[] DEFAULT '{}',
    salary_expectation TEXT,
    cover_letter_tone TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    work_authorization TEXT,
    resume_pdf_url TEXT,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agent runs table
CREATE TABLE public.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'running',
    job_title_searched TEXT,
    location_searched TEXT,
    jobs_found INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 3. Jobs table
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    source TEXT NOT NULL CONSTRAINT chk_source CHECK (source IN ('search', 'url')),
    source_url TEXT NOT NULL,
    external_apply_url TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    salary TEXT,
    job_type TEXT,
    about_role TEXT NOT NULL,
    responsibilities TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    nice_to_have TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    about_company TEXT,
    match_score INTEGER NOT NULL,
    match_reason TEXT NOT NULL,
    matched_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    company_research JSONB,
    found_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Agent logs table
CREATE TABLE public.agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    level TEXT DEFAULT 'info',
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can manage their own profile"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Agent Runs Policies
CREATE POLICY "Users can manage their own agent runs"
    ON public.agent_runs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Jobs Policies
CREATE POLICY "Users can manage their own jobs"
    ON public.jobs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Agent Logs Policies
CREATE POLICY "Users can manage their own agent logs"
    ON public.agent_logs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Trigger for profile updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
