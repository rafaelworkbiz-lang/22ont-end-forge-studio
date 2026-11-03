import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin.functions";
import { validarCodigo, validarLinks } from "@/lib/influencer-rules";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
async function audit(db: any, adminId: string, acao: string, alvo: string | null, antes: unknown, depois: unknown) {
  await db.from("admin_audit_log").insert({ admin_id: adminId, acao, alvo_email: alvo, antes: antes ?? null, depois: depois ?? null });
}

export type InfluencerRow = {
  id: string; member_id: string; nome: string; email: string; whatsapp: string; codigo: string | null; status_cadastro: string;
  applyfy_email: string | null; applyfy_afiliado_id: string | null; link_mensal: string | null; link_vitalicio: string | null;
  is_gerente: boolean; gerente_id: string | null; motivo_recusa: string | null; comissao_percentual: number; pedido_troca_links: { mensal: string; vitalicio: string } | null;
  avatar_url: string | null; created_at: string | null; last_sign_in_at: string | null; plan: string | null; lojas: number;
};

export const listInfluencers = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async (): Promise<InfluencerRow[]> => {
  const db = await admin();
  const { data, error } = await db.from("influenciadores").select("*, members(name, email, whatsapp, plan, created_at)").order("criado_em");
  if (error) throw new Error(error.message);
  const users: any[] = [];
  for (let page = 1; page <= 20; page++) { const { data: u } = await db.auth.admin.listUsers({ page, perPage: 200 }); users.push(...(u?.users ?? [])); if ((u?.users?.length ?? 0) < 200) break; }
  const byEmail = new Map(users.map((u) => [String(u.email).toLowerCase(), u]));
  const { data: lojas } = await db.from("lojas").select("user_id");
  const lojasPor = new Map<string, number>(); for (const l of lojas ?? []) lojasPor.set(l.user_id, (lojasPor.get(l.user_id) ?? 0) + 1);
  const rows = (data ?? []).map(({ members: m, ...i }: any) => {
    const u = byEmail.get(String(m?.email ?? "").toLowerCase());
    return { ...i, comissao_percentual: Number(i.comissao_percentual), nome: m?.name ?? "—", email: m?.email ?? "", whatsapp: m?.whatsapp ?? "",
      plan: m?.plan ?? null, created_at: m?.created_at ?? null, last_sign_in_at: u?.last_sign_in_at ?? null, lojas: u ? lojasPor.get(u.id) ?? 0 : 0,
      _avatar: (u?.user_metadata as any)?.avatar_path ?? null, avatar_url: null as string | null };
  });
  const paths = rows.map((r) => r._avatar).filter(Boolean) as string[];
  if (paths.length) {
    const { data: signed } = await db.storage.from("avatars").createSignedUrls(paths, 3600);
    const map = new Map((signed ?? []).map((x: any) => [x.path, x.signedUrl]));
    for (const r of rows) if (r._avatar) r.avatar_url = map.get(r._avatar) ?? null;
  }
  return rows.map(({ _avatar, ...r }) => r);
});

const STATUS = ["convidado", "conta_applyfy", "afiliacao_pedida", "afiliacao_aprovada", "links_enviados", "ativo", "recusado"] as const;

export const updateInfluencer = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    codigo: z.string().trim().toLowerCase().max(20).nullable(),
    status_cadastro: z.enum(STATUS),
    applyfy_email: z.string().trim().toLowerCase().email().max(255).nullable(),
    applyfy_afiliado_id: z.string().trim().max(100).nullable(),
    link_mensal: z.string().trim().max(500).nullable(),
    link_vitalicio: z.string().trim().max(500).nullable(),
    motivo_recusa: z.string().trim().max(500).nullable(),
    comissao_percentual: z.number().min(0).max(100),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: cur } = await db.from("influenciadores").select("*, members(email)").eq("id", data.id).single();
    if (!cur) throw new Error("Influenciador não encontrado.");
    if (data.codigo) { const e = validarCodigo(data.codigo); if (e) throw new Error(e); }
    if (data.status_cadastro === "ativo" && (!data.codigo || !data.link_mensal || !data.link_vitalicio)) throw new Error("Para ativar, informe código e os dois links.");
    if (data.link_mensal && data.link_vitalicio) {
      const { data: cfg } = await db.from("config_admin").select("*").single();
      const { data: outros } = await db.from("influenciadores").select("link_mensal, link_vitalicio").neq("id", data.id);
      const e = validarLinks(data.link_mensal, data.link_vitalicio, cfg?.dominios_checkout ?? [], [cfg?.link_padrao_mensal ?? "", cfg?.link_padrao_vitalicio ?? ""],
        (outros ?? []).flatMap((o) => [o.link_mensal, o.link_vitalicio]).filter(Boolean) as string[]);
      if (e) throw new Error(e);
    }
    if (data.status_cadastro === "recusado" && !data.motivo_recusa) throw new Error("Informe o motivo da recusa.");
    const { id, ...upd } = data;
    const { error } = await db.from("influenciadores").update({ ...upd, aprovado_em: data.status_cadastro === "ativo" ? cur.aprovado_em ?? new Date().toISOString() : cur.aprovado_em }).eq("id", id);
    if (error) throw new Error(error.code === "23505" ? "Esse código já está em uso." : error.message);
    if (cur.codigo && cur.codigo !== data.codigo) {
      await db.from("codigos_redirect").upsert({ codigo_antigo: cur.codigo, influenciador_id: id, expira_em: new Date(Date.now() + 90 * 864e5).toISOString() });
    }
    const { members, ...antes } = cur as any;
    await audit(db, (context as any).userId, "editar_influenciador", members?.email ?? null, antes, upd);
    return { ok: true };
  });

export const setInfluencerManager = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid(), gerente: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: cur } = await db.from("influenciadores").select("is_gerente, members(email)").eq("id", data.id).single();
    if (!cur) throw new Error("Influenciador não encontrado.");
    const { error } = await db.from("influenciadores").update({ is_gerente: data.gerente }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(db, (context as any).userId, data.gerente ? "tornar_gerente" : "remover_gerente", (cur as any).members?.email ?? null, { is_gerente: cur.is_gerente }, { is_gerente: data.gerente });
    return { ok: true };
  });

export const removeInfluencerTag = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: cur } = await db.from("influenciadores").select("*, members(email)").eq("id", data.id).single();
    if (!cur) throw new Error("Influenciador não encontrado.");
    await db.from("member_roles").delete().eq("member_id", cur.member_id).eq("role", "influencer");
    await db.from("influenciadores").delete().eq("id", data.id);
    await audit(db, (context as any).userId, "remover_influenciador", (cur as any).members?.email ?? null, cur, null);
    return { ok: true };
  });

export type AdminConfig = { percentual_influenciador: number; dominios_checkout: string[]; link_padrao_mensal: string; link_padrao_vitalicio: string; link_cadastro_applyfy: string; link_afiliacao_mensal: string; link_afiliacao_vitalicio: string; modelos_whatsapp: Record<string, string> };

export const getAdminConfig = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }): Promise<AdminConfig> => {
  const { data, error } = await context.supabase.from("config_admin").select("*").single();
  if (error) throw new Error(error.message);
  return { ...data, percentual_influenciador: Number(data.percentual_influenciador), modelos_whatsapp: (data.modelos_whatsapp ?? {}) as Record<string, string> };
});

export const saveAdminConfig = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({
    percentual_influenciador: z.number().min(0).max(100),
    dominios_checkout: z.array(z.string().trim().toLowerCase().regex(/^[a-z0-9.-]+$/).max(100)).min(1).max(10),
    link_padrao_mensal: z.string().url().max(500),
    link_padrao_vitalicio: z.string().url().max(500),
    link_cadastro_applyfy: z.string().url().max(500),
    link_afiliacao_mensal: z.string().url().max(500),
    link_afiliacao_vitalicio: z.string().url().max(500),
    modelos_whatsapp: z.record(z.string(), z.string().max(1000)),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: antes } = await db.from("config_admin").select("*").single();
    const { error } = await db.from("config_admin").update({ ...data, atualizado_em: new Date().toISOString() }).eq("id", true);
    if (error) throw new Error(error.message);
    await audit(db, (context as any).userId, "editar_configuracoes", null, antes, data);
    return { ok: true };
  });

export const adminReviewOnboarding = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid(), acao: z.enum(["aprovar_afiliacao", "aprovar_links", "recusar"]), motivo: z.string().trim().max(500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { proximaEtapa } = await import("@/lib/influencer-rules");
    const db = await admin();
    const { data: cur } = await db.from("influenciadores").select("*, members(email)").eq("id", data.id).single();
    if (!cur) throw new Error("Influenciador não encontrado.");
    const r = proximaEtapa(cur.status_cadastro, data.acao);
    if ("erro" in r) throw new Error(r.erro);
    if (data.acao === "recusar" && !data.motivo) throw new Error("Informe o motivo da recusa.");
    if (data.acao === "aprovar_links" && (!cur.codigo || !cur.link_mensal || !cur.link_vitalicio)) throw new Error("Faltam o código ou os links.");
    const upd: Record<string, unknown> = { status_cadastro: r.status, motivo_recusa: data.acao === "recusar" ? data.motivo : null };
    if (r.status === "ativo") upd["aprovado_em"] = cur.aprovado_em ?? new Date().toISOString();
    const { error } = await db.from("influenciadores").update(upd as any).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(db, (context as any).userId, data.acao, (cur as any).members?.email ?? null, { status: cur.status_cadastro }, upd);
    return { ok: true };
  });

export const deleteInfluencerAccount = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { motivoBloqueioExclusao } = await import("@/lib/influencer-rules");
    const db = await admin();
    const { data: cur } = await db.from("influenciadores").select("*, members(id, email, name)").eq("id", data.id).single();
    if (!cur) throw new Error("Influenciador não encontrado.");
    const email = String((cur as any).members?.email ?? "").toLowerCase();
    let user: any = null;
    for (let page = 1; page <= 20 && !user; page++) {
      const { data: u } = await db.auth.admin.listUsers({ page, perPage: 200 });
      user = (u?.users ?? []).find((x: any) => String(x.email).toLowerCase() === email) ?? null;
      if ((u?.users?.length ?? 0) < 200) break;
    }
    let isAdmin = false;
    if (user) { const { data: r } = await db.from("user_roles").select("id").eq("user_id", user.id).eq("role", "admin"); isAdmin = (r ?? []).length > 0; }
    const bloqueio = motivoBloqueioExclusao(user?.id ?? null, (context as any).userId, isAdmin);
    if (bloqueio) throw new Error(bloqueio);
    await audit(db, (context as any).userId, "excluir_conta_influenciador", email || null, cur, null);
    const id = data.id, memberId = cur.member_id;
    await db.from("influenciadores").update({ gerente_id: null }).eq("gerente_id", id);
    const { data: convs } = await db.from("convites").select("id").eq("gerente_id", id);
    const convIds = (convs ?? []).map((c) => c.id);
    if (convIds.length) { await db.from("convite_usos").delete().in("convite_id", convIds); await db.from("convites").delete().in("id", convIds); }
    await db.from("times").delete().eq("gerente_id", id);
    await db.from("codigos_redirect").delete().eq("influenciador_id", id);
    await db.from("vendas_influenciador").update({ influenciador_id: null }).eq("influenciador_id", id);
    const { error: e1 } = await db.from("influenciadores").delete().eq("id", id);
    if (e1) throw new Error(e1.message);
    if (user) {
      const uid = user.id;
      const { data: lojas } = await db.from("lojas").select("id").eq("user_id", uid);
      const lojaIds = (lojas ?? []).map((l) => l.id);
      if (lojaIds.length) { await db.from("cliques").delete().in("loja_id", lojaIds); await db.from("loja_produtos").delete().in("loja_id", lojaIds); await db.from("ia_geracoes").delete().in("loja_id", lojaIds); await db.from("lojas").delete().in("id", lojaIds); }
      for (const t of ["meus_produtos", "ia_geracoes", "influencer_demo_batches", "influencer_demo_settings", "test_balance_entries", "test_balance_settings", "meli_connections", "meli_affiliate_profile", "fornecedor_conexoes", "perfil_publicacoes", "produto_progresso", "divulgacoes", "grupos_salvos", "grupo_postagens"]) {
        await (db.from(t as any) as any).delete().eq("user_id", uid);
      }
      const { data: files } = await db.storage.from("avatars").list(uid);
      if (files?.length) await db.storage.from("avatars").remove(files.map((f) => `${uid}/${f.name}`));
    }
    await db.from("influencer_demo_settings").delete().eq("member_id", memberId);
    await db.from("member_roles").delete().eq("member_id", memberId);
    await db.from("avisos_vencimento").delete().eq("member_id", memberId);
    await db.from("recuperacao").update({ member_id: null }).eq("member_id", memberId);
    const { error: e2 } = await db.from("members").delete().eq("id", memberId);
    if (e2) throw new Error(e2.message);
    if (user) { const { error } = await db.auth.admin.deleteUser(user.id); if (error) throw new Error(error.message); }
    return { ok: true };
  });
