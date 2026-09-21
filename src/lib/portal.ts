import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const EMAIL_DOMAIN = "@ramagya.local";

export type Profile = {
  id: string;
  username: string;
  full_name: string;
  admission_no: string | null;
  class_name: string;
  section: string | null;
};

export type Chapter = {
  id: string;
  title: string;
  description: string | null;
  class_name: string;
  order_index: number;
  unit_title?: string | null;
  source_page?: number | null;
  source_key?: string | null;
};

export type Project = {
  id: string;
  student_id: string;
  chapter_id: string | null;
  title: string;
  description: string | null;
  link_url: string | null;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  review_status: string;
  teacher_feedback: string | null;
  reviewed_at: string | null;
};

export type ProjectUpdate = {
  id: string;
  project_id: string;
  student_id: string;
  note: string;
  progress: number | null;
  created_at: string;
  review_status: string;
  teacher_note: string | null;
  reviewed_at: string | null;
};

export type ProjectAssessment = {
  id: string;
  project_id: string;
  assessor_id: string;
  planning: number;
  practical_execution: number;
  creativity: number;
  sustainability: number;
  documentation: number;
  presentation: number;
  total_score: number | null;
  created_at: string;
  updated_at: string;
};

export type RubricScores = Pick<
  ProjectAssessment,
  | "planning"
  | "practical_execution"
  | "creativity"
  | "sustainability"
  | "documentation"
  | "presentation"
>;

export const RUBRIC_CRITERIA: Array<{ key: keyof RubricScores; label: string }> = [
  { key: "planning", label: "Planning" },
  { key: "practical_execution", label: "Practical execution" },
  { key: "creativity", label: "Creativity" },
  { key: "sustainability", label: "Sustainability" },
  { key: "documentation", label: "Documentation" },
  { key: "presentation", label: "Presentation" },
];

export function rubricTotal(scores: Partial<RubricScores>) {
  return RUBRIC_CRITERIA.reduce((total, criterion) => total + (scores[criterion.key] ?? 0), 0);
}

export const REVIEW_LABELS: Record<string, string> = {
  draft: "Draft",
  pending: "Waiting for teacher",
  approved: "Approved",
  accepted: "Accepted",
  denied: "Needs changes",
};

export function reviewLabel(value: string | null | undefined) {
  return REVIEW_LABELS[value ?? "draft"] ?? "Draft";
}

/** Supabase requires at least 6 characters, so short school passwords get a suffix. */
export function normalizePassword(raw: string) {
  const p = raw.trim();
  return p.length < 6 ? `${p}@rmgy` : p;
}

export const STATUSES = [
  { value: "not_started", label: "Not started" },
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Ready for review" },
  { value: "submitted", label: "Submitted" },
] as const;

export function statusLabel(value: string) {
  return STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}${EMAIL_DOMAIN}`;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, ready };
}

export async function fetchMe() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", uid),
  ]);
  return {
    id: uid,
    profile: (profile as Profile | null) ?? null,
    isTeacher: (roles ?? []).some((r: { role: string }) => r.role === "teacher"),
  };
}
