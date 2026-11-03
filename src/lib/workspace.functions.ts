import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const itemId = z.string().regex(/^MLB\d{4,16}$/);

export const getProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date(Date.now() - 3 * 86400_000).toISOString();
    const [steps, posts] = await Promise.all([
      context.supabase.from("produto_progresso").select("item_id, etapa").eq("user_id", context.userId).limit(5000),
      context.supabase.from("divulgacoes").select("alvo_id, grupo_id, postado_em").eq("user_id", context.userId).eq("alvo_tipo", "produto").not("grupo_id", "is", null).gte("postado_em", since).limit(5000),
    ]);
    return {
      steps: (steps.data ?? []).map(s => ({ itemId: s.item_id, etapa: s.etapa })),
      posts: (posts.data ?? []).map(p => ({ itemId: p.alvo_id ?? "", grupoId: p.grupo_id ?? "", postadoEm: p.postado_em })),
    };
  });

export const markStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ itemId, etapa: z.enum(["link", "mensagem", "grupos", "perfil"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("produto_progresso")
      .upsert({ user_id: context.userId, item_id: data.itemId, etapa: data.etapa }, { onConflict: "user_id,item_id,etapa", ignoreDuplicates: true });
    return { ok: !error };
  });

export const toggleGroupPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ itemId, grupoId: z.string().uuid(), posted: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.posted) {
      const { data: g } = await context.supabase.from("grupos").select("rede").eq("id", data.grupoId).maybeSingle();
      if (!g) return { ok: false };
      const { error } = await context.supabase.from("divulgacoes").insert({ user_id: context.userId, alvo_tipo: "produto", alvo_id: data.itemId, grupo_id: data.grupoId, canal: g.rede });
      return { ok: !error };
    }
    const since = new Date(Date.now() - 3 * 86400_000).toISOString();
    const { error } = await context.supabase.from("divulgacoes").delete().eq("user_id", context.userId).eq("alvo_tipo", "produto").eq("alvo_id", data.itemId).eq("grupo_id", data.grupoId).gte("postado_em", since);
    return { ok: !error };
  });

export const unmarkPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ itemId }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("perfil_publicacoes").delete().eq("user_id", context.userId).eq("item_id", data.itemId);
    return { ok: !error };
  });
