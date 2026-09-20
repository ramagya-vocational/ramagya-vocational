import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, Loader2, Save, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  STATUSES,
  type Chapter,
  type Project,
  type ProjectUpdate,
} from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — Ramagya Vocational Education" },
      {
        name: "description",
        content: "Project details, shared link and progress updates for vocational education.",
      },
      { property: "og:title", content: "Project — Ramagya Vocational Education" },
      {
        property: "og:description",
        content: "Update your project stage, progress and notes.",
      },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<Partial<Project>>({});

  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const project = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw error;
      return (data as Project | null) ?? null;
    },
  });

  const chapters = useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const { data, error } = await supabase.from("chapters").select("*").order("order_index");
      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
  });

  const updates = useQuery({
    queryKey: ["updates", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectUpdate[];
    },
  });

  useEffect(() => {
    if (project.data) setDraft(project.data);
  }, [project.data]);

  const owner = !!me.data && me.data.id === project.data?.student_id;

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({
          title: (draft.title ?? "").trim().slice(0, 140) || "Untitled project",
          description: (draft.description ?? "").trim().slice(0, 2000) || null,
          link_url: (draft.link_url ?? "").trim().slice(0, 500) || null,
          chapter_id: draft.chapter_id ?? null,
          status: draft.status ?? "not_started",
          progress: Math.min(100, Math.max(0, draft.progress ?? 0)),
        })
        .eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved.");
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    },
    onError: () => toast.error("Could not save your changes."),
  });

  const addUpdate = useMutation({
    mutationFn: async () => {
      if (!note.trim()) throw new Error("Write a short update first.");
      if (!me.data?.id) throw new Error("Your session has ended. Sign in again.");
      const { error } = await supabase.from("project_updates").insert({
        project_id: projectId,
        student_id: me.data.id,
        note: note.trim().slice(0, 1000),
        progress: draft.progress ?? project.data?.progress ?? 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      toast.success("Update posted.");
      queryClient.invalidateQueries({ queryKey: ["updates", projectId] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not post the update."),
  });

  const sendForReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({ review_status: "pending", teacher_feedback: null, reviewed_at: null })
        .eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sent to your teacher for review.");
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    },
    onError: () => toast.error("Could not send this project for review."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project deleted.");
      navigate({ to: "/dashboard" });
    },
    onError: () => toast.error("Could not delete the project."),
  });

  const profile = me.data?.profile;

  return (
    <div className="min-h-screen">
      <AppHeader
        name={profile?.full_name ?? "Student"}
        meta={profile?.section ?? undefined}
        teacher={me.data?.isTeacher}
      />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to my projects
        </Link>

        {project.isLoading && <p className="mt-10 text-muted-foreground">Loading…</p>}
        {!project.isLoading && !project.data && (
          <p className="mt-10 text-muted-foreground">This project is not available.</p>
        )}

        {project.data && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="surface p-7">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-3xl font-semibold">{project.data.title}</h1>
                <div className="flex flex-wrap justify-end gap-2">
                  <Badge variant="secondary">{statusLabel(project.data.status)}</Badge>
                  <Badge variant="outline">{reviewLabel(project.data.review_status)}</Badge>
                </div>
              </div>
              <Progress value={project.data.progress} className="mt-5 h-2.5" />
              <p className="mt-2 text-sm text-muted-foreground">
                {project.data.progress}% complete
              </p>

              {owner ? (
                <div className="mt-7 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="t">Title</Label>
                    <Input
                      id="t"
                      maxLength={140}
                      value={draft.title ?? ""}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="d">Description</Label>
                    <Textarea
                      id="d"
                      rows={4}
                      maxLength={2000}
                      value={draft.description ?? ""}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="l">Link to your work</Label>
                    <Input
                      id="l"
                      maxLength={500}
                      placeholder="https://"
                      value={draft.link_url ?? ""}
                      onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Chapter</Label>
                      <Select
                        value={draft.chapter_id ?? ""}
                        onValueChange={(v) => setDraft({ ...draft, chapter_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a chapter" />
                        </SelectTrigger>
                        <SelectContent>
                          {(chapters.data ?? []).map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Stage</Label>
                      <Select
                        value={draft.status ?? "not_started"}
                        onValueChange={(v) => setDraft({ ...draft, status: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label>Progress · {draft.progress ?? 0}%</Label>
                    <Slider
                      value={[draft.progress ?? 0]}
                      max={100}
                      step={5}
                      onValueChange={([v]) => setDraft({ ...draft, progress: v ?? 0 })}
                    />
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      onClick={() => save.mutate()}
                      disabled={save.isPending}
                      className="gradient-sun border-0 text-primary-foreground"
                    >
                      {save.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save changes
                    </Button>
                    <Button
                      onClick={() => sendForReview.mutate()}
                      disabled={sendForReview.isPending || project.data.review_status === "pending"}
                      variant="outline"
                    >
                      {sendForReview.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      {project.data.review_status === "pending" ? "Waiting for teacher" : "Send for review"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm("Delete this project and all its updates?")) remove.mutate();
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {project.data.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {project.data.description}
                    </p>
                  )}
                </div>
              )}

              {project.data.teacher_feedback && (
                <div className="mt-6 border-l-4 border-primary bg-secondary p-4">
                  <p className="tech-label">Teacher feedback</p>
                  <p className="mt-2 text-sm leading-relaxed">{project.data.teacher_feedback}</p>
                </div>
              )}

              {project.data.link_url && (
                <a
                  href={project.data.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" /> Open shared work
                </a>
              )}
            </section>

            <section className="surface p-7">
              <h2 className="text-xl font-semibold">Progress log</h2>
              {owner && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    rows={3}
                    maxLength={1000}
                    placeholder="What did you finish today?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button
                    onClick={() => addUpdate.mutate()}
                    disabled={addUpdate.isPending}
                    className="w-full gradient-sun border-0 text-primary-foreground"
                  >
                    {addUpdate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post update
                  </Button>
                </div>
              )}

              <ol className="mt-6 space-y-4">
                {(updates.data ?? []).map((u) => (
                  <li key={u.id} className="border-l-2 border-primary/40 pl-4">
                    <p className="text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleString()} · {u.progress ?? 0}% · {reviewLabel(u.review_status)}
                    </p>
                    <p className="mt-1 text-sm">{u.note}</p>
                    {u.teacher_note && <p className="mt-2 text-xs font-medium text-primary">Teacher: {u.teacher_note}</p>}
                  </li>
                ))}
                {(updates.data ?? []).length === 0 && (
                  <li className="text-sm text-muted-foreground">No updates yet.</li>
                )}
              </ol>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
