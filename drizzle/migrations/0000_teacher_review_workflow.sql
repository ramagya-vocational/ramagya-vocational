ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS teacher_feedback text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_review_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_review_status_check
  CHECK (review_status IN ('draft','pending','approved','denied'));

ALTER TABLE public.project_updates
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS teacher_note text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.project_updates DROP CONSTRAINT IF EXISTS project_updates_review_status_check;
ALTER TABLE public.project_updates ADD CONSTRAINT project_updates_review_status_check
  CHECK (review_status IN ('pending','accepted','denied'));

DROP POLICY IF EXISTS "projects teacher update" ON public.projects;
CREATE POLICY "projects teacher update" ON public.projects
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher'));

DROP POLICY IF EXISTS "updates teacher update" ON public.project_updates;
CREATE POLICY "updates teacher update" ON public.project_updates
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher'));