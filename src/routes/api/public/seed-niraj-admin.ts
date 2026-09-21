import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-niraj-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-seed-token") !== "ramagya-seed-2026") {
          return new Response("Unauthorized", { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "niraj.shah@ramagya.local";
        const password = "12345@rmgy";
        const listed = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (listed.error) return Response.json({ error: listed.error.message }, { status: 500 });
        let user = listed.data.users.find((candidate) => candidate.email === email);

        if (!user) {
          const created = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });
          if (created.error || !created.data.user) {
            return Response.json({ error: created.error?.message ?? "Could not create account" }, { status: 500 });
          }
          user = created.data.user;
        } else {
          const updated = await supabaseAdmin.auth.admin.updateUserById(user.id, { password });
          if (updated.error) return Response.json({ error: updated.error.message }, { status: 500 });
        }

        const profile = await supabaseAdmin.from("profiles").upsert({
          id: user.id,
          username: "niraj.shah",
          full_name: "Niraj Shah",
          class_name: "IX",
          section: null,
          admission_no: null,
        });
        if (profile.error) return Response.json({ error: profile.error.message }, { status: 500 });

        const role = await supabaseAdmin.from("user_roles").upsert(
          { user_id: user.id, role: "teacher" },
          { onConflict: "user_id,role" },
        );
        if (role.error) return Response.json({ error: role.error.message }, { status: 500 });

        return Response.json({ ok: true });
      },
    },
  },
});
