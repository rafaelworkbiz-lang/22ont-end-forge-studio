import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { reminderSlot } from "@/lib/subscription-rules";

/** Rotina diária 06:00 BRT: vencimentos, recuperação, avisos por e-mail. */
export const Route = createFileRoute("/api/public/jobs/subscriptions-daily")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const db = supabaseAdmin as any;
        // Avisos antes da rotina marcar como vencido (d-3 e d0 ainda ativos; d+1 já vencido).
        const now = Date.now();
        const { data: mensais } = await db.from("members").select("id,name,email,expires_at,status").eq("plan", "monthly").eq("is_test", false).in("status", ["active", "expired"]).not("expires_at", "is", null)
          .gte("expires_at", new Date(now - 2 * 86400000).toISOString()).lte("expires_at", new Date(now + 4 * 86400000).toISOString());
        const { data: cfg } = await db.from("config_admin").select("link_padrao_mensal").maybeSingle();
        let emails = 0;
        for (const m of mensais ?? []) {
          const tipo = reminderSlot(m.expires_at, now);
          if (!tipo) continue;
          const venc = String(m.expires_at).slice(0, 10);
          const ins = await db.from("avisos_vencimento").insert({ member_id: m.id, tipo, vencimento: venc });
          if (ins.error) continue; // já registrado
          try {
            const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
            await sendTemplateEmail("subscription-reminder", m.email, { templateData: { nome: String(m.name ?? "").split(" ")[0], tipo, link: cfg?.link_padrao_mensal ?? "https://afiliaplace.site" }, idempotencyKey: `sub-reminder-${m.id}-${tipo}-${venc}` });
            await db.from("avisos_vencimento").update({ enviado: true }).match({ member_id: m.id, tipo, vencimento: venc });
            emails++;
          } catch { console.error("subscription reminder email failed"); }
        }
        const rotina = await db.rpc("rotina_vencimentos");
        // Cadastros de influenciador parados há 48h.
        const { data: parados } = await db.from("influenciadores").select("member_id,status_cadastro,members(name,email,whatsapp)").not("status_cadastro", "in", "(ativo,recusado)").lt("criado_em", new Date(now - 48 * 3600000).toISOString()).limit(200);
        for (const p of parados ?? []) {
          const m = p.members; if (!m) continue;
          const { data: aberto } = await db.from("recuperacao").select("id").eq("member_id", p.member_id).eq("origem", "cadastro").limit(1);
          if (aberto?.length) continue;
          await db.rpc("registrar_recuperacao", { p_origem: "cadastro", p_motivo: `cadastro parado (${String(p.status_cadastro).replace(/_/g, " ")})`, p_nome: m.name, p_email: m.email, p_telefone: /^0+$/.test(m.whatsapp ?? "") ? "" : m.whatsapp, p_plano: null, p_valor: null, p_forma: null, p_member: p.member_id });
        }
        return Response.json({ ok: !rotina.error, emails, rotina: rotina.data ?? null });
      },
    },
  },
});
