import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

/** Apaga opções temporárias da IA com mais de 24h (a escolhida já foi copiada para a pasta da loja). */
export const Route = createFileRoute("/api/public/jobs/cleanup-ia")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const limite = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const { data: rows } = await supabaseAdmin.from("ia_geracoes").select("id, opcoes").eq("status", "ok").eq("limpo", false).lt("criado_em", limite).limit(200);
        let apagados = 0;
        for (const r of rows ?? []) {
          const paths = ((r.opcoes ?? []) as string[]).filter(p => p.includes("/_ia/"));
          if (paths.length) { const { error } = await supabaseAdmin.storage.from("lojas").remove(paths); if (error) continue; apagados += paths.length; }
          await supabaseAdmin.from("ia_geracoes").update({ limpo: true }).eq("id", r.id);
        }
        return Response.json({ ok: true, geracoes: rows?.length ?? 0, apagados });
      },
    },
  },
});
