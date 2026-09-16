import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import logo from "@/assets/ramagya-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img
        src={logo.url}
        alt="Ramagya School crest"
        width={44}
        height={44}
        className="h-11 w-11 drop-shadow-sm"
      />
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold text-foreground">
          Ramagya Vocational Education
        </span>
        {!compact && (
          <span className="block text-xs tracking-[0.18em] text-muted-foreground uppercase">
            Arise · Awake · Attain
          </span>
        )}
      </span>
    </Link>
  );
}

export function AppHeader({
  name,
  meta,
  teacher,
}: {
  name: string;
  meta?: string;
  teacher?: boolean;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Brand compact />
        <div className="flex items-center gap-3">
          {teacher && (
            <Link
              to="/teacher"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:block"
            >
              Teacher view
            </Link>
          )}
          <Link
            to="/dashboard"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:block"
          >
            My work
          </Link>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground">{name}</p>
            {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-1.5 h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
