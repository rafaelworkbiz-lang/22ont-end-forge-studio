import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { intervalStatus, PAGE_SIZE, startOfTodaySP } from "./divulgacao-core";

export type Grupo = { id: string; rede: "whatsapp" | "facebook"; nome: string; link: string; nichos: string[]; membros: number | null; regras: string | null; freq: number; exigeFoto: boolean };
const COLS = "id,rede,nome,link,nichos,membros_aprox,regras,frequencia_min_horas,exige_foto";
type Row = { id: string; rede: string; nome: string; link: string; nichos: string[]; membros_aprox: number | null; regras: string | null; frequencia_min_horas: number; exige_foto: boolean };
const toGrupo = (r: Row): Grupo => ({ id: r.id, rede: r.rede as Grupo["rede"], nome: r.nome, link: r.link, nichos: r.nichos, membros: r.membros_aprox, regras: r.regras, freq: r.frequencia_min_horas, exigeFoto: r.exige_foto });
const uuid = z.string().uuid();
const canal = z.enum(["whatsapp", "facebook"]);

export const searchGroups = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ q: z.string().max(80).default(""), kw: z.string().max(40).nullable().default(null), nicho: z.string().max(40).nullable().default(null), rede: z.enum(["facebook", "whatsapp"]).nullable().default(null), page: z.number().int().min(1).max(500).default(1) }).parse(d ?? {}))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("grupos").select(COLS, { count: "exact" }).eq("ativo", true);
    const term = data.q.trim().replace(/[(),*%]/g, " ").trim();
    if (term) q = q.or(`busca.wfts(portuguese).${term},nome.ilike.*${term}*`);
    if (data.kw) q = q.contains("palavras_chave", [data.kw]);
    if (data.nicho) q = q.contains("nichos", [data.nicho]);
    if (data.rede) q = q.eq("rede", data.rede);
    const from = (data.page - 1) * PAGE_SIZE;
    const { data: rows, count, error } = await q.order("membros_aprox", { ascending: false, nullsFirst: false }).order("nome").range(from, from + PAGE_SIZE - 1);
    if (error) return { items: [] as Grupo[], total: 0, error: "Não foi possível buscar agora." };
    return { items: (rows ?? []).map(toGrupo), total: count ?? 0, error: null };
  });

export const groupNiches = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data } = await context.supabase.from("grupos").select("nichos").eq("ativo", true).limit(5000);
  return [...new Set((data ?? []).flatMap(r => r.nichos))].sort((a, b) => a.localeCompare(b, "pt-BR"));
});

/** Estado do usuário: salvos, última postagem por grupo e contador de hoje. */
export const myGroupState = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [saved, posts] = await Promise.all([
    context.supabase.from("grupos_salvos").select(`salvo_em, grupos(${COLS})`).eq("user_id", context.userId).order("salvo_em", { ascending: false }),
    context.supabase.from("divulgacoes").select("grupo_id, postado_em").eq("user_id", context.userId).gte("postado_em", since).order("postado_em", { ascending: false }).limit(5000),
  ]);
  const last: Record<string, string> = {};
  for (const p of posts.data ?? []) if (p.grupo_id && !last[p.grupo_id]) last[p.grupo_id] = p.postado_em;
  const today = startOfTodaySP();
  return {
    saved: (saved.data ?? []).filter(s => s.grupos).map(s => ({ ...toGrupo(s.grupos as Row), salvoEm: s.salvo_em })),
    last, today: (posts.data ?? []).filter(p => p.postado_em >= today).length,
  };
});

export const setSaved = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ grupoId: uuid, saved: z.boolean(), salvoEm: z.string().datetime({ offset: true }).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const r = data.saved
      ? await context.supabase.from("grupos_salvos").upsert({ user_id: context.userId, grupo_id: data.grupoId, ...(data.salvoEm ? { salvo_em: data.salvoEm } : {}) }, { onConflict: "user_id,grupo_id", ignoreDuplicates: true })
      : await context.supabase.from("grupos_salvos").delete().eq("user_id", context.userId).eq("grupo_id", data.grupoId);
    return { ok: !r.error };
  });

const alvo = { alvoTipo: z.enum(["loja", "categoria", "produto"]).default("loja"), alvoId: z.string().max(200).nullable().default(null) };

/** Marca postado num grupo; antes do intervalo do grupo devolve aviso, a menos que force=true. */
export const markPosted = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ grupoId: uuid, force: z.boolean().default(false), ...alvo }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: g } = await context.supabase.from("grupos").select("rede, frequencia_min_horas").eq("id", data.grupoId).maybeSingle();
    if (!g) return { ok: false as const, error: "Grupo indisponível." };
    const { data: last } = await context.supabase.from("divulgacoes").select("postado_em").eq("user_id", context.userId).eq("grupo_id", data.grupoId).order("postado_em", { ascending: false }).limit(1).maybeSingle();
    const st = intervalStatus(last?.postado_em ?? null, g.frequencia_min_horas);
    if (!st.canPost && !data.force) return { ok: false as const, warn: { hours: Math.max(0, Math.floor(st.hoursSince ?? 0)), freq: g.frequencia_min_horas } };
    const { error } = await context.supabase.from("divulgacoes").insert({ user_id: context.userId, grupo_id: data.grupoId, canal: g.rede, alvo_tipo: data.alvoTipo, alvo_id: data.alvoId });
    return error ? { ok: false as const, error: "Não foi possível salvar." } : { ok: true as const };
  });

/** Registra uma divulgação feita pelos botões de mensagem (com ou sem grupo). */
export const logShare = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ canal, grupoId: uuid.nullable().default(null), ...alvo }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("divulgacoes").insert({ user_id: context.userId, canal: data.canal, grupo_id: data.grupoId, alvo_tipo: data.alvoTipo, alvo_id: data.alvoId });
    return { ok: !error };
  });

export const reportGroup = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ grupoId: uuid, motivo: z.enum(["link_quebrado", "grupo_fechado", "spam"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("grupo_denuncias").insert({ grupo_id: data.grupoId, user_id: context.userId, motivo: data.motivo });
    return { ok: !error || error.code === "23505" };
  });

export const listTemplates = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data } = await context.supabase.from("modelos_mensagem").select("id,nome,texto").eq("ativo", true).order("ordem").order("nome");
  return data ?? [];
});

/** Grupos do nicho (workspace do produto); sem nenhum, usa Achadinhos/Promoções. */
export const groupsForNiche = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ nicho: z.string().max(40).nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const pick = (n: string[]) => context.supabase.from("grupos").select(COLS).eq("ativo", true).overlaps("nichos", n).order("membros_aprox", { ascending: false, nullsFirst: false }).limit(12);
    if (data.nicho) { const { data: r } = await pick([data.nicho]); if (r?.length) return { groups: r.map(toGrupo), general: false }; }
    const { data: r } = await pick(["Achadinhos", "Promoções e Cupons"]);
    return { groups: (r ?? []).map(toGrupo), general: true };
  });
