import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-once")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (request.headers.get("x-seed-token") !== "ramagya-seed-2026") {
          return new Response("Unauthorized", { status: 401 });
        }
        const { runSeed } = await import("@/lib/seed.server");
        const result = await runSeed();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
