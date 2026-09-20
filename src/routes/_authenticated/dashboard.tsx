import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, FolderPlus, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { BookLibrary } from "@/components/BookLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchMe, statusLabel, type Chapter, type Project } from "@/lib/portal";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My projects — Ramagya Vocational Education" },
      {
        name: "description",
        content: "Your Class IX vocational education projects, chapter by chapter, with progress.",
      },
      { property: "og:title", content: "My projects — Ramagya Vocational Education" },
      {
        property: "og:description",
        content: "Track your vocational education projects and progress.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ chapter_id: "", title: "", description: "", link_url: "" });

  const me = useQuery({ queryKey: ["me"], queryFn: fetchMe });

  const chapters = useQuery({
    queryKey: ["chapters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .order("order_index")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
  });

  const projects = useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const createProject = useMutation({
    mutationFn: async () => {
      if (!me.data?.id) throw new Error("No session");
      if (!form.title.trim()) throw new Error("Give your project a title.");
      const { error } = await supabase.from("projects").insert({
        student_id: me.data.id,
        chapter_id: form.chapter_id || null,
        title: form.title.trim().slice(0, 140),
        description: form.description.trim().slice(0, 2000) || null,
        link_url: form.link_url.trim().slice(0, 500) || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Project added.");
      setOpen(false);
      setForm({ chapter_id: "", title: "", description: "", link_url: "" });
      queryClient.invalidateQueries({ queryKey: ["my-projects"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not add the project."),
  });

  const grouped = useMemo(() => {
    const list = projects.data ?? [];
    const byChapter = new Map<string, Project[]>();
    for (const p of list) {
      const key = p.chapter_id ?? "none";
      byChapter.set(key, [...(byChapter.get(key) ?? []), p]);
    }
    return byChapter;
  }, [projects.data]);

  const profile = me.data?.profile;
  const chapterList = chapters.data ?? [];
  const loose = grouped.get("none") ?? [];

  return (
    <div className="min-h-screen">
      <AppHeader
        name={profile?.full_name ?? "Student"}
        meta={profile ? `Class ${profile.class_name}${profile.section ? ` · ${profile.section}` : ""}` : undefined}
        teacher={me.data?.isTeacher}
      />

      <main className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Vocational Education · Class {profile?.class_name ?? "IX"}
            </p>
            <h1 className="mt-2 text-4xl font-semibold">
              Hello, {profile?.full_name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Add a project under its chapter, share the link and keep your progress updated.
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gradient-sun border-0 text-primary-foreground">
                <FolderPlus className="mr-2 h-4 w-4" /> New project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a project</DialogTitle>
                <DialogDescription>
                  Pick the chapter it belongs to and paste a link to your work.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chapter</Label>
                  <Select
                    value={form.chapter_id}
                    onValueChange={(v) => setForm({ ...form, chapter_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          chapterList.length ? "Choose a chapter" : "No chapters added yet"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {chapterList.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Project title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    maxLength={140}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">What is it about?</Label>
                  <Textarea
                    id="desc"
                    rows={3}
                    maxLength={2000}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link to your work</Label>
                  <Input
                    id="link"
                    placeholder="https://drive.google.com/..."
                    maxLength={500}
                    value={form.link_url}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => createProject.mutate()}
                  disabled={createProject.isPending}
                  className="gradient-sun border-0 text-primary-foreground"
                >
                  {createProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-10">
          <BookLibrary compact />
        </div>

        {chapterList.length === 0 && loose.length === 0 && (
          <div className="surface mt-10 flex flex-col items-center p-12 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Chapters are on their way</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Your teacher will add the chapters for this term. You can still start a project now —
              it will sit here until a chapter is chosen.
            </p>
          </div>
        )}

        <div className="mt-10 space-y-10">
          {chapterList.map((chapter) => (
            <section key={chapter.id}>
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-semibold">{chapter.title}</h2>
                <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Chapter
                </span>
              </div>
              {chapter.description && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {chapter.description}
                </p>
              )}
              <ProjectGrid projects={grouped.get(chapter.id) ?? []} />
            </section>
          ))}

          {loose.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold">Not yet in a chapter</h2>
              <ProjectGrid projects={loose} />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border px-5 py-6 text-sm text-muted-foreground">
        No project here yet.
      </p>
    );
  }
  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Link
          key={p.id}
          to="/projects/$projectId"
          params={{ projectId: p.id }}
          className="surface lift block p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg leading-snug font-semibold">{p.title}</h3>
            <Badge variant="secondary">{statusLabel(p.status)}</Badge>
          </div>
          {p.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
          )}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{p.progress}%</span>
            </div>
            <Progress value={p.progress} className="mt-2 h-2" />
          </div>
          {p.link_url && (
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <ExternalLink className="h-3.5 w-3.5" /> Shared link attached
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
