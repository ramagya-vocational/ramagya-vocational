import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, LineChart, Link2, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/hero-lab.jpg";
import { Brand } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/portal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ramagya Vocational Education — Class IX Project Portal" },
      {
        name: "description",
        content:
          "Class IX students of Ramagya School share vocational education projects chapter by chapter and track progress in one place.",
      },
      { property: "og:title", content: "Ramagya Vocational Education — Class IX Project Portal" },
      {
        property: "og:description",
        content:
          "Chapter-wise vocational education projects, shared links and live progress for Class IX.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: BookOpen,
    title: "Class IX · Chapter · Project",
    body: "Every project sits under its chapter, so the whole year's vocational work stays organised.",
  },
  {
    icon: Link2,
    title: "Share your work by link",
    body: "Paste a Drive, Docs, Slides or YouTube link — your teacher opens it in one click.",
  },
  {
    icon: LineChart,
    title: "Progress you can see",
    body: "Set a stage, move the progress bar and post dated updates as the project grows.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Students see only their own work. The teacher sees every section at a glance.",
  },
];

function Landing() {
  const { session } = useSession();

  return (
    <div className="min-h-screen">
      <CinematicIntro />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Brand />
        <Button asChild size="lg" className="gradient-sun border-0 text-primary-foreground shadow-md">
          <Link to={session ? "/dashboard" : "/auth"}>
            {session ? "Open my dashboard" : "Student sign in"}
          </Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-8 pb-20 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Session 2026 · Class IX
          </span>
          <h1 className="mt-6 text-5xl leading-[1.05] font-semibold text-balance sm:text-6xl">
            Where Class IX <span className="text-gradient-sun">vocational projects</span> come to
            life.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A calm, organised workspace for the Vocational Education subject. Pick your chapter, add
            your project, share the link and keep your progress updated all term.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="gradient-sun border-0 px-7 text-primary-foreground shadow-lg"
            >
              <Link to={session ? "/dashboard" : "/auth"}>
                {session ? "Continue working" : "Sign in with your username"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Use the username and password shared by your school. 163 students across Achievers,
            Believers, Creators, Dreamers and Enactors.
          </p>
        </div>

        <div className="relative">
          <div className="gradient-sun absolute -inset-3 rounded-[2rem] opacity-25 blur-2xl" />
          <img
            src={heroImg}
            alt="Class IX students building a vocational education project together in the school lab"
            width={1600}
            height={1104}
            className="relative w-full rounded-[1.75rem] object-cover shadow-[var(--shadow-lift)]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article key={f.title} className="surface lift p-6">
              <span className="gradient-sun inline-flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <p className="text-center text-sm text-muted-foreground">
          Ramagya School · Vocational Education Department · Arise, Awake, Attain
        </p>
      </footer>
    </div>
  );
}
