-- 0007: Add Client Portal Tables and Roles
-- Run after: 0006_add_pgvector_and_embeddings.sql

-- 1. Update Profiles with Role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'freelancer'::text CHECK (role IN ('freelancer', 'client'));

-- 2. Update Clients to link to Client Auth ID
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS client_auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Update Tasks to add Client Visibility
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_public_to_client boolean DEFAULT false;

-- 4. Create Project Revisions table
CREATE TABLE IF NOT EXISTS public.project_revisions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  requested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to set updated_at
CREATE TRIGGER set_project_revisions_updated_at
BEFORE UPDATE ON public.project_revisions
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- 5. Enable RLS
ALTER TABLE public.project_revisions ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS Policies for Client Access

-- PROFILES
-- Clients can read their own profile
CREATE POLICY "Clients can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- CLIENTS
-- Clients can read their own client record
CREATE POLICY "Clients can view own client record"
ON public.clients FOR SELECT
USING (client_auth_id = auth.uid());

-- PROJECTS
-- Clients can view projects where client_id matches their client record
CREATE POLICY "Clients can view own projects"
ON public.projects FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
  )
);

-- TASKS
-- Clients can view tasks linked to their projects IF is_public_to_client is true
CREATE POLICY "Clients can view public tasks of their projects"
ON public.tasks FOR SELECT
USING (
  is_public_to_client = true 
  AND project_id IN (
    SELECT id FROM public.projects WHERE client_id IN (
      SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
    )
  )
);

-- PROJECT PLANNING SECTIONS (Milestones, Roadmap, etc.)
-- Clients can view planning sections of their projects
CREATE POLICY "Clients can view planning sections of their projects"
ON public.project_planning_sections FOR SELECT
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE client_id IN (
      SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
    )
  )
);

-- PROJECT REVISIONS
-- Freelancers can manage all revisions for their projects
CREATE POLICY "Freelancers can manage revisions"
ON public.project_revisions FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Clients can insert revisions for their projects
CREATE POLICY "Clients can insert revisions"
ON public.project_revisions FOR INSERT
WITH CHECK (
  client_id IN (
    SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
  )
  AND requested_by = auth.uid()
);

-- Clients can view their own revisions
CREATE POLICY "Clients can view own revisions"
ON public.project_revisions FOR SELECT
USING (
  client_id IN (
    SELECT id FROM public.clients WHERE client_auth_id = auth.uid()
  )
);
