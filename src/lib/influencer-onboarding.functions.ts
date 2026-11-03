import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validarCodigo, validarLinks } from "@/lib/influencer-rules";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

/** Linha de influenciador do usuário logado (pelo e-mail confirmado da sessão). */
export async function meuInfluenciador(db: any, claims: any) {
  const email = String(claims?.email ?? "").toLowerCase();
  if (!email) return null;
  const { data: m } = await db.from("members").select("id, name").ilike("email", email).maybeSingle();
  if (!m) return null;
  const { data: i } = await db.from("influenciadores").select("*").eq("member_id", m.id).maybeSingle();
  return i ? { ...i, nome: m.name as string } : null;
}

export type MyOnboarding =
  | { isInfluencer: false }
  | { isInfluencer: true; id: string; status: string; codigo: string | null; link_mensal: string | null; link_vitalicio: string | null; motivo_recusa: string | null;
      is_gerente: boolean; passos: Record<string, string>; pedido_troca_links: { mensal: string; vitalicio: string } | null;
      gerente: { nome: string; mensal: string | null; vitalicio: string | null } | null; links: { cadastro: string; afiliacao_mensal: string; afiliacao_vitalicio: string } };

export const getMyOnboarding = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<MyOnboarding> => {
  const db = await admin();
  const i = await meuInfluenciador(db, context.claims);
  if (!i) return { isInfluencer: false };
  const { data: cfg } = await db.from("config_admin").select("link_cadastro_applyfy, link_afiliacao_mensal, link_afiliacao_vitalicio").single();
  let gerente: { nome: string; mensal: string | null; vitalicio: string | null } | null = null;
  if (i.gerente_id) {
    const { data: g } = await db.from("influenciadores").select("members(name), times(link_afiliacao_mensal, link_afiliacao_vitalicio)").eq("id", i.gerente_id).maybeSingle();
    if (g) gerente = { nome: String((g as any).members?.name ?? "").split(" ")[0] ?? "", mensal: (g as any).times?.link_afiliacao_mensal ?? null, vitalicio: (g as any).times?.link_afiliacao_vitalicio ?? null };
  }
  return {
    isInfluencer: true, id: i.id, status: i.status_cadastro, codigo: i.codigo, link_mensal: i.link_mensal, link_vitalicio: i.link_vitalicio,
    motivo_recusa: i.motivo_recusa, is_gerente: i.is_gerente, passos: (i.passos ?? {}) as Record<string, string>,
    pedido_troca_links: (i.pedido_troca_links ?? null) as any, gerente,
    links: { cadastro: cfg?.link_cadastro_applyfy ?? "", afiliacao_mensal: cfg?.link_afiliacao_mensal ?? "", afiliacao_vitalicio: cfg?.link_afiliacao_vitalicio ?? "" },
  };
});

const ORDEM = ["convidado", "conta_applyfy", "afiliacao_pedida", "afiliacao_aprovada", "links_enviados", "ativo"];

export const advanceStep = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ passo: z.enum(["conta", "afiliacao"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const i = await meuInfluenciador(db, context.claims);
    if (!i) throw new Error("Conta de influenciador não encontrada.");
    const alvo = data.passo === "conta" ? "conta_applyfy" : "afiliacao_pedida";
    const atual = i.status_cadastro === "recusado" ? 0 : ORDEM.indexOf(i.status_cadastro);
    const passos = { ...(i.passos ?? {}), [data.passo]: new Date().toISOString() };
    const upd: { passos: any; status_cadastro?: string; motivo_recusa?: null } = { passos };
    if (ORDEM.indexOf(alvo) > atual) { upd["status_cadastro"] = alvo; upd["motivo_recusa"] = null; }
    await db.from("influenciadores").update(upd).eq("id", i.id);
    return { ok: true };
  });

async function checarLinks(db: any, id: string, mensal: string, vitalicio: string) {
  const { data: cfg } = await db.from("config_admin").select("*").single();
  const { data: outros } = await db.from("influenciadores").select("link_mensal, link_vitalicio").neq("id", id);
  const e = validarLinks(mensal, vitalicio, cfg?.dominios_checkout ?? [], [cfg?.link_padrao_mensal ?? "", cfg?.link_padrao_vitalicio ?? ""],
    (outros ?? []).flatMap((o: any) => [o.link_mensal, o.link_vitalicio]).filter(Boolean));
  if (e) throw new Error(e);
}

export const submitLinks = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ codigo: z.string().trim().toLowerCase().max(20), mensal: z.string().trim().max(500), vitalicio: z.string().trim().max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const i = await meuInfluenciador(db, context.claims);
    if (!i) throw new Error("Conta de influenciador não encontrada.");
    if (!["afiliacao_aprovada", "links_enviados"].includes(i.status_cadastro)) throw new Error("Aguarde a aprovação da sua afiliação para enviar os links.");
    const e = validarCodigo(data.codigo); if (e) throw new Error(e);
    const { data: redir } = await db.from("codigos_redirect").select("influenciador_id").eq("codigo_antigo", data.codigo).maybeSingle();
    if (redir && redir.influenciador_id !== i.id) throw new Error("Esse código já está em uso.");
    await checarLinks(db, i.id, data.mensal, data.vitalicio);
    const { error } = await db.from("influenciadores").update({ codigo: data.codigo, link_mensal: data.mensal, link_vitalicio: data.vitalicio, status_cadastro: "links_enviados", motivo_recusa: null,
      passos: { ...(i.passos ?? {}), links: new Date().toISOString() } }).eq("id", i.id);
    if (error) throw new Error(error.code === "23505" ? "Esse código já está em uso." : error.message);
    return { ok: true };
  });

export const requestLinkChange = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ mensal: z.string().trim().max(500), vitalicio: z.string().trim().max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const i = await meuInfluenciador(db, context.claims);
    if (!i || i.status_cadastro !== "ativo") throw new Error("Disponível só para influenciadores ativos.");
    await checarLinks(db, i.id, data.mensal, data.vitalicio);
    await db.from("influenciadores").update({ pedido_troca_links: { ...data, pedido_em: new Date().toISOString() } }).eq("id", i.id);
    return { ok: true };
  });
