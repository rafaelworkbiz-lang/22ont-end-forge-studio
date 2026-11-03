import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/refresh-library")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        try {
          const { refreshNextCategory } = await import("@/lib/library-refresh.server");
          const r = await refreshNextCategory("agendada");
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          await supabaseAdmin.rpc("sincronizar_lojas_assinatura").then(() => null, () => null);
          return Response.json({ success: true, done: r.done, remaining: r.remaining });
        } catch (e) {
          console.error("[library] refresh failed", e instanceof Error ? e.message : e);
          return Response.json({ success: false }, { status: 500 });
        }
      },
    },
  },
});
