import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  fetchMe,
  statusLabel,
  type Chapter,
  type Profile,
  type Project,
} from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher view — Ramagya Vocational Education" },
      {
        name: "description",
        content: "See every Class IX student's vocational education projects and progress.",
      },
      { property: "og:title", content: "Teacher view — Ramagya Vocational Education" },
      {
        property: "og:description",
        content: "Manage chapters and review student project progress.",
      },
    ],
  }),
  component: TeacherPage,
});

const SECTIONS = ["Achievers", "Believers", "Creators", "Dreamers", "Enactors"];

function TeacherPage() {
  const queryClient = useQueryClient();
  const [chapterForm, setChapterForm] = useState({ title: "", description: "" });
  const [section, setSection] = useState("all");

  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe });

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
    enabled: !!me.data?.isTeacher,
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
    enabled: !!me.data?.isTeacher,
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

  const byId = useMemo(() => {
    const m = new Map<string, Profile>();
    for (const s of students.data ?? []) m.set(s.id, s);
    return m;
  }, [students.data]);

  const visible = (projects.data ?? []).filter((p) => {
    if (section === "all") return true;
    return byId.get(p.student_id)?.section === section;
  });

  if (me.isSuccess && !me.data?.isTeacher) {
    return (
      <div className="min-h-screen">
        <AppHeader name={me.data?.profile?.full_name ?? "Student"} />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="text-2xl font-semibold">This page is for teachers</h1>
          <p className="mt-3 text-muted-foreground">
            Head back to <Link to="/dashboard" className="text-primary underline">your projects</Link>.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader name={me.data?.profile?.full_name ?? "Teacher"} meta="Vocational Education" teacher />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-4xl font-semibold">Class IX overview</h1>
        <p className="mt-2 text-muted-foreground">
          {students.data?.length ?? 0} accounts · {projects.data?.length ?? 0} projects submitted so
          far.
        </p>

        <Tabs defaultValue="projects" className="mt-8">
          <TabsList>
            <TabsTrigger value="projects">Student projects</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            <div className="flex flex-wrap gap-2">
              {["all", ...SECTIONS].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={section === s ? "default" : "outline"}
                  onClick={() => setSection(s)}
                  className={section === s ? "gradient-sun border-0 text-primary-foreground" : ""}
                >
                  {s === "all" ? "All sections" : s}
                </Button>
              ))}
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => {
                const student = byId.get(p.student_id);
                return (
                  <Link
                    key={p.id}
                    to="/projects/$projectId"
                    params={{ projectId: p.id }}
                    className="surface lift block p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg leading-snug font-semibold">{p.title}</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {student?.full_name ?? "Student"}
                          {student?.section ? ` · ${student.section}` : ""}
                        </p>
                      </div>
                      <Badge variant="secondary">{statusLabel(p.status)}</Badge>
                    </div>
                    <Progress value={p.progress} className="mt-5 h-2" />
                    <p className="mt-2 text-xs text-muted-foreground">{p.progress}% complete</p>
                  </Link>
                );
              })}
              {visible.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects here yet.</p>
              )}
            </div>
          </TabsContent>

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
