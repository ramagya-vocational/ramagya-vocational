import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CirclePlay, LineChart, Link2, ShieldCheck } from "lucide-react";
import heroImg from "@/assets/workshop-lab.jpg";
import { Brand } from "@/components/AppHeader";
import { BookLibrary } from "@/components/BookLibrary";
import { CinematicIntro } from "@/components/CinematicIntro";
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
    <div className="landing-shell min-h-screen">
      <CinematicIntro />
      <header className="landing-nav mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Brand />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Replay cinematic introduction"
            title="Replay introduction"
            onClick={() => window.dispatchEvent(new Event("rv-replay-intro"))}
          >
            <CirclePlay className="h-5 w-5" />
          </Button>
          <Button asChild size="lg" className="button-amber">
            <Link to={session ? "/dashboard" : "/auth"}>
            {session ? "Open my dashboard" : "Student sign in"}
            </Link>
          </Button>
        </div>
      </header>

      <section className="landing-hero">
        <img src={heroImg} alt="Ramagya students building a robotics and sustainable farming project" />
        <div className="landing-hero-shade" />
        <div className="landing-hero-grid" />
        <div className="landing-hero-content">
          <p className="tech-label light">RVE SKILL OS · SESSION 2026 · CLASS IX</p>
          <h1>
            BUILD WHAT<br /><span>THE FUTURE NEEDS.</span>
          </h1>
          <p>
            One intelligent workspace for practical learning, real projects, progress and teacher review.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="button-amber px-7">
              <Link to={session ? "/dashboard" : "/auth"}>
                {session ? "Enter workspace" : "Enter the skill lab"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="hero-replay"
              onClick={() => window.dispatchEvent(new Event("rv-replay-intro"))}
            >
              <CirclePlay className="mr-2 h-4 w-4" /> Replay film
            </Button>
          </div>
        </div>
        <div className="landing-metrics">
          <span><b>163</b> Learners</span><span><b>05</b> Sections</span><span><b>12</b> Chapters</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <BookLibrary />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article key={f.title} className="feature-panel lift p-6">
              <span className="feature-icon">
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
