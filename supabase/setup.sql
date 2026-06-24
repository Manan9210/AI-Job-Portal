-- ============================================================
-- NexusJobs AI Job Portal — Safe Re-runnable Setup SQL
-- This version drops existing policies before recreating them
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Tables ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name           TEXT,
  email               TEXT,
  role                TEXT CHECK (role IN ('seeker', 'employer')) DEFAULT 'seeker',
  company_name        TEXT,
  company_description TEXT,
  company_website     TEXT,
  bio                 TEXT,
  skills              TEXT[] DEFAULT '{}',
  location            TEXT,
  phone               TEXT,
  linkedin_url        TEXT,
  github_url          TEXT,
  portfolio_url       TEXT,
  resume_url          TEXT,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  company              TEXT NOT NULL,
  description          TEXT NOT NULL,
  requirements         TEXT,
  responsibilities     TEXT,
  location             TEXT,
  job_type             TEXT CHECK (job_type IN ('full-time','part-time','contract','internship','remote')) DEFAULT 'full-time',
  category             TEXT,
  salary_min           INTEGER,
  salary_max           INTEGER,
  salary_currency      TEXT DEFAULT 'USD',
  experience_level     TEXT CHECK (experience_level IN ('entry','mid','senior','lead','executive')),
  skills_required      TEXT[] DEFAULT '{}',
  is_active            BOOLEAN DEFAULT TRUE,
  application_deadline DATE,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id         UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cover_letter   TEXT,
  resume_url     TEXT,
  status         TEXT CHECK (status IN ('pending','reviewing','shortlisted','rejected','hired')) DEFAULT 'pending',
  ai_match_score INTEGER,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

-- ── Enable RLS ─────────────────────────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- ── Drop ALL existing policies safely ─────────────────────
DROP POLICY IF EXISTS "Profiles are publicly viewable"           ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"       ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile"       ON public.profiles;

DROP POLICY IF EXISTS "Jobs are viewable by everyone"            ON public.jobs;
DROP POLICY IF EXISTS "Employers can insert jobs"                ON public.jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs"      ON public.jobs;
DROP POLICY IF EXISTS "Employers can delete their own jobs"      ON public.jobs;

DROP POLICY IF EXISTS "Seekers and employers can view applications" ON public.applications;
DROP POLICY IF EXISTS "Seekers can submit applications"             ON public.applications;
DROP POLICY IF EXISTS "Employers can update application status"     ON public.applications;

-- ── Recreate Policies ─────────────────────────────────────

-- Profiles
CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Jobs
CREATE POLICY "Jobs are viewable by everyone"
  ON public.jobs FOR SELECT USING (true);

CREATE POLICY "Employers can insert jobs"
  ON public.jobs FOR INSERT WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs"
  ON public.jobs FOR UPDATE USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own jobs"
  ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

-- Applications
CREATE POLICY "Seekers and employers can view applications"
  ON public.applications FOR SELECT
  USING (
    auth.uid() = applicant_id
    OR EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Seekers can submit applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Employers can update application status"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

-- ── Triggers ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at     ON public.profiles;
DROP TRIGGER IF EXISTS update_jobs_updated_at         ON public.jobs;
DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id  ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active    ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_category     ON public.jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type     ON public.jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_apps_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_apps_job_id       ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_apps_status       ON public.applications(status);

-- ============================================================
-- ✅ DONE — All tables, policies, triggers and indexes ready!
-- ============================================================
