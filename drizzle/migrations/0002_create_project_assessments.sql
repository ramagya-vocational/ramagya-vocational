CREATE TABLE public.project_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  assessor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  planning smallint NOT NULL CHECK (planning BETWEEN 0 AND 10),
  practical_execution smallint NOT NULL CHECK (practical_execution BETWEEN 0 AND 10),
  creativity smallint NOT NULL CHECK (creativity BETWEEN 0 AND 10),
  sustainability smallint NOT NULL CHECK (sustainability BETWEEN 0 AND 10),
  documentation smallint NOT NULL CHECK (documentation BETWEEN 0 AND 10),
  presentation smallint NOT NULL CHECK (presentation BETWEEN 0 AND 10),
  total_score smallint GENERATED ALWAYS AS (planning + practical_execution + creativity + sustainability + documentation + presentation) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_assessments TO authenticated;
GRANT ALL ON public.project_assessments TO service_role;

ALTER TABLE public.project_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessments owner or teacher read"
ON public.project_assessments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'teacher'::public.app_role)
  OR EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_assessments.project_id
      AND projects.student_id = auth.uid()
  )
);

CREATE POLICY "assessments teacher insert"
ON public.project_assessments
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'teacher'::public.app_role)
  AND assessor_id = auth.uid()
);

CREATE POLICY "assessments teacher update"
ON public.project_assessments
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'::public.app_role))
WITH CHECK (
  public.has_role(auth.uid(), 'teacher'::public.app_role)
  AND assessor_id = auth.uid()
);

CREATE POLICY "assessments teacher delete"
ON public.project_assessments
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'::public.app_role));

CREATE TRIGGER project_assessments_touch
BEFORE UPDATE ON public.project_assessments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();