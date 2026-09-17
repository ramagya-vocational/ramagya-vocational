import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-seed-token") !== "ramagya-seed-2026") {
          return new Response("no", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const email = "ramagya.admin@ramagya.local";
        const password = "1234@rmgy";
        const created = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        let id = created.data.user?.id;
        if (!id) {
          const list = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
          id = list.data.users.find((u) => u.email === email)?.id;
          if (id) await supabaseAdmin.auth.admin.updateUserById(id, { password });
        }
        if (!id) {
          return new Response(JSON.stringify({ error: created.error?.message }), { status: 500 });
        }
        await supabaseAdmin
          .from("profiles")
          .upsert({ id, username: "ramagya.admin", full_name: "Vocational Education Teacher", class_name: "IX" });
        await supabaseAdmin.from("user_roles").upsert({ user_id: id, role: "teacher" });
        return new Response(JSON.stringify({ ok: true, id }));
      },
    },
  },
});
