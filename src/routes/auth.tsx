import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usernameToEmail, useSession } from "@/lib/portal";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Ramagya Vocational Education" },
      {
        name: "description",
        content: "Class IX students and teachers sign in to the Ramagya vocational project portal.",
      },
      { property: "og:title", content: "Sign in — Ramagya Vocational Education" },
      {
        property: "og:description",
        content: "Sign in with your school username to manage your vocational education projects.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, ready } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session) navigate({ to: "/dashboard", replace: true });
  }, [ready, session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Enter both your username and password.");
      return;
    }
    setBusy(true);
    const email = usernameToEmail(username);
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password: password.trim(),
    });
    if (error) {
      ({ error } = await supabase.auth.signInWithPassword({
        email,
        password: normalizePassword(password),
      }));
    }
    setBusy(false);
    if (error) {
      toast.error("Those details didn't match. Check your username and password.");
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-6xl px-5 py-5">
        <Brand />
      </div>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="surface w-full max-w-md p-8">
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with the username and password given by your school.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="firstname.lastname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your admission number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={80}
              />
            </div>
            <Button
              type="submit"
              disabled={busy}
              size="lg"
              className="gradient-sun w-full border-0 text-primary-foreground"
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Students: username is firstname.lastname and the password is your admission number.
            Forgot them? Ask your vocational education teacher.
          </p>
        </div>
      </main>
    </div>
  );
}
