import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchMe,
  reviewLabel,
  statusLabel,
  type Chapter,
  type Profile,
  type Project,
  type ProjectAssessment,
  type ProjectUpdate,
  type RubricScores,
  RUBRIC_CRITERIA,
  rubricTotal,
} from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher view — Ramagya Vocational Education" },
      {
        name: "description",
        content: "Review Class IX project submissions, approve updates and assign chapters.",
      },
      { property: "og:title", content: "Teacher view — Ramagya Vocational Education" },
      {
        property: "og:description",
        content: "Approve or deny student updates, assign chapters and browse every section.",
      },
    ],
  }),
  component: TeacherPage,
});

const SECTIONS = ["Achievers", "Believers", "Creators", "Dreamers", "Enactors"];

function TeacherPage() {
  const queryClient = useQueryClient();
  const [chapterForm, setChapterForm] = useState({ title: "", description: "" });
  const [section, setSection] = useState(SECTIONS[0] as string);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [rubrics, setRubrics] = useState<Record<string, Partial<RubricScores>>>({});

  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe });
  const isTeacher = !!me.data?.isTeacher;

  const chapters = useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chapters").select("*").order("order_index");
      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
  });

  const students = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("full_name");
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
    enabled: isTeacher,
  });

  const projects = useQuery({
    queryKey: ["all-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
    enabled: isTeacher,
  });

  const updates = useQuery({
    queryKey: ["all-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_updates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as ProjectUpdate[];
    },
    enabled: isTeacher,
  });

  const assessments = useQuery({
    queryKey: ["all-assessments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("project_assessments").select("*");
      if (error) throw error;
      return (data ?? []) as ProjectAssessment[];
    },
    enabled: isTeacher,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["all-projects"] });
    queryClient.invalidateQueries({ queryKey: ["all-updates"] });
    queryClient.invalidateQueries({ queryKey: ["all-assessments"] });
  };

  const reviewProject = useMutation({
    mutationFn: async (v: { id: string; decision: "approved" | "denied" }) => {
      if (!me.data?.id) throw new Error("Your session has ended. Sign in again.");
      if (v.decision === "approved") {
        const existing = (assessments.data ?? []).find((assessment) => assessment.project_id === v.id);
        const scores = { ...existing, ...rubrics[v.id] };
        const complete = RUBRIC_CRITERIA.every(({ key }) => Number.isInteger(scores[key]));
        if (!complete) throw new Error("Score every rubric category before approving.");
        const assessment = Object.fromEntries(
          RUBRIC_CRITERIA.map(({ key }) => [key, Math.min(10, Math.max(0, scores[key] ?? 0))]),
        ) as RubricScores;
        const { error: assessmentError } = await supabase.from("project_assessments").upsert(
          { project_id: v.id, assessor_id: me.data.id, ...assessment },
          { onConflict: "project_id" },
        );
        if (assessmentError) throw assessmentError;
      }
      const { error } = await supabase
        .from("projects")
        .update({
          review_status: v.decision,
          teacher_feedback: (notes[v.id] ?? "").trim().slice(0, 1000) || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.decision === "approved" ? "Project approved." : "Sent back to the student.");
      invalidateAll();
    },
    onError: (error: Error) => toast.error(error.message || "Could not save that decision."),
  });

  const reviewUpdate = useMutation({
    mutationFn: async (v: { id: string; decision: "accepted" | "denied" }) => {
      const { error } = await supabase
        .from("project_updates")
        .update({
          review_status: v.decision,
          teacher_note: (notes[v.id] ?? "").trim().slice(0, 1000) || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.decision === "accepted" ? "Update accepted." : "Update denied.");
      invalidateAll();
    },
    onError: () => toast.error("Could not save that decision."),
  });

  const assignChapter = useMutation({
    mutationFn: async (v: { id: string; chapterId: string }) => {
      const { error } = await supabase
        .from("projects")
        .update({ chapter_id: v.chapterId })
        .eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Chapter assigned.");
      queryClient.invalidateQueries({ queryKey: ["all-projects"] });
    },
    onError: () => toast.error("Could not assign the chapter."),
  });

  const addChapter = useMutation({
    mutationFn: async () => {
      if (!chapterForm.title.trim()) throw new Error("Give the chapter a title.");
      const { error } = await supabase.from("chapters").insert({
        title: chapterForm.title.trim().slice(0, 140),
        description: chapterForm.description.trim().slice(0, 1000) || null,
        order_index: (chapters.data ?? []).length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setChapterForm({ title: "", description: "" });
      toast.success("Chapter added.");
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not add the chapter."),
  });

  const deleteChapter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Chapter removed.");
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
    onError: () => toast.error("Could not remove the chapter."),
  });

  const studentById = useMemo(() => {
    const m = new Map<string, Profile>();
    for (const s of students.data ?? []) m.set(s.id, s);
    return m;
  }, [students.data]);

  const projectById = useMemo(() => {
    const m = new Map<string, Project>();
    for (const p of projects.data ?? []) m.set(p.id, p);
    return m;
  }, [projects.data]);

  const chapterById = useMemo(() => {
    const m = new Map<string, Chapter>();
    for (const c of chapters.data ?? []) m.set(c.id, c);
    return m;
  }, [chapters.data]);

  const pendingProjects = (projects.data ?? []).filter((p) => p.review_status === "pending");
  const pendingUpdates = (updates.data ?? []).filter((u) => u.review_status === "pending");

  const sectionStudents = (students.data ?? []).filter(
    (s) => s.section === section && s.username !== "ramagya.admin",
  );

  if (me.isSuccess && !isTeacher) {
    return (
      <div className="min-h-screen">
        <AppHeader name={me.data?.profile?.full_name ?? "Student"} />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="text-2xl font-semibold">This page is for teachers</h1>
          <p className="mt-3 text-muted-foreground">
            Head back to{" "}
            <Link to="/dashboard" className="text-primary underline">
              your projects
            </Link>
            .
          </p>
        </main>
      </div>
    );
  }

  const noteBox = (id: string, placeholder: string) => (
    <Textarea
      rows={2}
      maxLength={1000}
      placeholder={placeholder}
      value={notes[id] ?? ""}
      onChange={(e) => setNotes({ ...notes, [id]: e.target.value })}
      className="mt-3"
    />
  );

  const rubricBox = (projectId: string) => {
    const saved = (assessments.data ?? []).find((assessment) => assessment.project_id === projectId);
    const current = { ...saved, ...rubrics[projectId] };
    return (
      <div className="assessment-rubric mt-5">
        <div className="assessment-heading">
          <div>
            <p className="tech-label">Rubric-based assessment</p>
            <h4>Project scorecard</h4>
          </div>
          <strong>{rubricTotal(current)}<span>/60</span></strong>
        </div>
        <div className="assessment-grid">
          {RUBRIC_CRITERIA.map(({ key, label }) => (
            <label key={key}>
              <span>{label}</span>
              <span className="assessment-input">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={10}
                  step={1}
                  aria-label={`${label} score out of 10`}
                  value={current[key] ?? ""}
                  onChange={(event) => {
                    const next = event.target.value === "" ? undefined : Math.min(10, Math.max(0, Number(event.target.value)));
                    setRubrics((previous) => ({
                      ...previous,
                      [projectId]: { ...previous[projectId], [key]: next },
                    }));
                  }}
                />
                <b>/10</b>
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <AppHeader
        name={me.data?.profile?.full_name ?? "Teacher"}
        meta="Vocational Education"
        teacher
      />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-4xl font-semibold">Class IX overview</h1>
        <p className="mt-2 text-muted-foreground">
          {(students.data ?? []).length} accounts · {(projects.data ?? []).length} projects ·{" "}
          {pendingProjects.length + pendingUpdates.length} waiting for you.
        </p>

        <Tabs defaultValue="inbox" className="mt-8">
          <TabsList>
            <TabsTrigger value="inbox">
              Inbox
              {pendingProjects.length + pendingUpdates.length > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">
                  {pendingProjects.length + pendingUpdates.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
          </TabsList>

          {/* ---------------- Inbox ---------------- */}
          <TabsContent value="inbox" className="mt-6 space-y-10">
            <section>
              <h2 className="text-2xl font-semibold">Projects sent for review</h2>
              <div className="mt-4 grid gap-5 lg:grid-cols-2">
                {pendingProjects.map((p) => {
                  const s = studentById.get(p.student_id);
                  return (
                    <div key={p.id} className="surface p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            to="/projects/$projectId"
                            params={{ projectId: p.id }}
                            className="text-lg font-semibold hover:text-primary"
                          >
                            {p.title}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {s?.full_name ?? "Student"}
                            {s?.section ? ` · ${s.section}` : ""} ·{" "}
                            {p.chapter_id ? chapterById.get(p.chapter_id)?.title : "No chapter"}
                          </p>
                        </div>
                        <Badge variant="secondary">{p.progress}%</Badge>
                      </div>
                      {p.description && (
                        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                          {p.description}
                        </p>
                      )}
                      {p.link_url && (
                        <a
                          href={p.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block text-sm text-primary hover:underline"
                        >
                          Open shared work
                        </a>
                      )}
                       {rubricBox(p.id)}
                      {noteBox(p.id, "Feedback for the student (optional)")}
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="gradient-sun border-0 text-primary-foreground"
                          onClick={() => reviewProject.mutate({ id: p.id, decision: "approved" })}
                        >
                          <Check className="mr-1.5 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewProject.mutate({ id: p.id, decision: "denied" })}
                        >
                          <X className="mr-1.5 h-4 w-4" /> Deny
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {pendingProjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">No projects waiting for review.</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold">Progress updates</h2>
              <div className="mt-4 space-y-4">
                {pendingUpdates.map((u) => {
                  const s = studentById.get(u.student_id);
                  const p = projectById.get(u.project_id);
                  return (
                    <div key={u.id} className="surface p-5">
                      <p className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleString()} · {s?.full_name ?? "Student"}
                        {s?.section ? ` · ${s.section}` : ""} · {p?.title ?? "Project"} ·{" "}
                        {u.progress ?? 0}%
                      </p>
                      <p className="mt-2 text-sm">{u.note}</p>
                      {noteBox(u.id, "Note back to the student (optional)")}
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="gradient-sun border-0 text-primary-foreground"
                          onClick={() => reviewUpdate.mutate({ id: u.id, decision: "accepted" })}
                        >
                          <Check className="mr-1.5 h-4 w-4" /> Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reviewUpdate.mutate({ id: u.id, decision: "denied" })}
                        >
                          <X className="mr-1.5 h-4 w-4" /> Deny
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {pendingUpdates.length === 0 && (
                  <p className="text-sm text-muted-foreground">No new updates right now.</p>
                )}
              </div>
            </section>
          </TabsContent>

          {/* ---------------- Sections ---------------- */}
          <TabsContent value="sections" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={section === s ? "default" : "outline"}
                  onClick={() => setSection(s)}
                  className={section === s ? "gradient-sun border-0 text-primary-foreground" : ""}
                >
                  {s}
                </Button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {sectionStudents.map((s) => {
                const mine = (projects.data ?? []).filter((p) => p.student_id === s.id);
                return (
                  <div key={s.id} className="surface p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-lg font-semibold">{s.full_name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {s.username} · Adm. {s.admission_no ?? "—"} · {mine.length} project
                        {mine.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    {mine.length === 0 && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Nothing uploaded yet.
                      </p>
                    )}

                    <div className="mt-4 space-y-4">
                      {mine.map((p) => (
                        <div key={p.id} className="rounded-xl border border-border p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <Link
                              to="/projects/$projectId"
                              params={{ projectId: p.id }}
                              className="font-medium hover:text-primary"
                            >
                              {p.title}
                            </Link>
                            <div className="flex gap-2">
                              <Badge variant="secondary">{statusLabel(p.status)}</Badge>
                              <Badge variant="outline">{reviewLabel(p.review_status)}</Badge>
                            </div>
                          </div>
                          <Progress value={p.progress} className="mt-3 h-2" />
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Label className="text-xs text-muted-foreground">Chapter</Label>
                            <Select
                              value={p.chapter_id ?? ""}
                              onValueChange={(v) =>
                                assignChapter.mutate({ id: p.id, chapterId: v })
                              }
                            >
                              <SelectTrigger className="h-9 w-64">
                                <SelectValue placeholder="Assign a chapter" />
                              </SelectTrigger>
                              <SelectContent>
                                {(chapters.data ?? []).map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {p.link_url && (
                              <a
                                href={p.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                Open work
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {sectionStudents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {students.isLoading ? "Loading students…" : "No students in this section."}
                </p>
              )}
            </div>
          </TabsContent>

          {/* ---------------- Chapters ---------------- */}
          <TabsContent value="chapters" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div className="surface p-6">
                <h2 className="text-xl font-semibold">Add a chapter</h2>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ct">Chapter title</Label>
                    <Input
                      id="ct"
                      maxLength={140}
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cd">Short description</Label>
                    <Textarea
                      id="cd"
                      rows={3}
                      maxLength={1000}
                      value={chapterForm.description}
                      onChange={(e) =>
                        setChapterForm({ ...chapterForm, description: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    onClick={() => addChapter.mutate()}
                    disabled={addChapter.isPending}
                    className="gradient-sun border-0 text-primary-foreground"
                  >
                    {addChapter.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add chapter
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {(chapters.data ?? []).map((c) => (
                  <div key={c.id} className="surface flex items-start justify-between gap-4 p-5">
                    <div>
                      <h3 className="font-semibold">{c.title}</h3>
                      {c.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteChapter.mutate(c.id)}
                      aria-label={`Remove ${c.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(chapters.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No chapters added yet.</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
