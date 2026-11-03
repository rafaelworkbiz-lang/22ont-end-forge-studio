import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/admin.functions";
import { gerarCodigoConvite, validarLinksGerente } from "@/lib/influencer-rules";
import { meuInfluenciador } from "@/lib/influencer-onboarding.functions";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
async function audit(db: any, adminId: string, acao: string, alvo: string | null, antes: unknown, depois: unknown) {
  await db.from("admin_audit_log").insert({ admin_id: adminId, acao, alvo_email: alvo, antes: antes ?? null, depois: depois ?? null });
}

export type TeamMember = { id: string; nome: string; codigo: string | null; status: string; link_mensal: string | null; link_vitalicio: string | null; criado_em: string };
export type Invite = { id: string; codigo: string; ativo: boolean; limite_usos: number; usos: number; expira_em: string };
export type TeamData = { gerenteId: string; nome: string | null; mensagem: string | null; link_afiliacao_mensal: string | null; link_afiliacao_vitalicio: string | null; percentual_info: number | null; membros: TeamMember[]; convites: Invite[] };

async function loadTeam(db: any, gerenteId: string): Promise<TeamData> {
  const [{ data: t }, { data: ms }, { data: cs }] = await Promise.all([
    db.from("times").select("*").eq("gerente_id", gerenteId).maybeSingle(),
    db.from("influenciadores").select("id, codigo, status_cadastro, link_mensal, link_vitalicio, criado_em, members(name)").eq("gerente_id", gerenteId).order("criado_em"),
    db.from("convites").select("id, codigo, ativo, limite_usos, usos, expira_em").eq("gerente_id", gerenteId).order("criado_em", { ascending: false }),
  ]);
  return {
    gerenteId, nome: t?.nome ?? null, mensagem: t?.mensagem_boas_vindas ?? null, link_afiliacao_mensal: t?.link_afiliacao_mensal ?? null, link_afiliacao_vitalicio: t?.link_afiliacao_vitalicio ?? null,
    percentual_info: t?.percentual_gerente_info == null ? null : Number(t.percentual_gerente_info),
    membros: (ms ?? []).map((m: any) => ({ id: m.id, nome: m.members?.name ?? "—", codigo: m.codigo, status: m.status_cadastro, link_mensal: m.link_mensal, link_vitalicio: m.link_vitalicio, criado_em: m.criado_em })),
    convites: cs ?? [],
  };
}

async function meuGerente(db: any, claims: any) {
  const i = await meuInfluenciador(db, claims);
  if (!i || !i.is_gerente) throw new Error("Área exclusiva de gerentes.");
  return i;
}

const byOwner = (q: any, g: string | null) => (g ? q.eq("gerente_id", g) : q.is("gerente_id", null));
async function inviteAction(db: any, gerenteId: string | null, a: { acao: "criar" | "ativar" | "desativar" | "novo_codigo"; id?: string | undefined; limite?: number | undefined; dias?: number | undefined }) {
  const extra = { ...(a.limite ? { limite_usos: a.limite } : {}), ...(a.dias ? { expira_em: new Date(Date.now() + a.dias * 864e5).toISOString() } : {}) };
  if (a.acao === "criar") {
    await byOwner(db.from("convites").update({ ativo: false }), gerenteId);
    const { error } = await db.from("convites").insert({ gerente_id: gerenteId, codigo: gerarCodigoConvite(), ...extra });
    if (error) throw new Error(error.message);
    return;
  }
  if (!a.id) throw new Error("Convite não informado.");
  const { data: c } = await byOwner(db.from("convites").select("id").eq("id", a.id), gerenteId).maybeSingle();
  if (!c) throw new Error("Convite não encontrado.");
  const upd = a.acao === "novo_codigo" ? { codigo: gerarCodigoConvite(), usos: 0, ...extra } : { ativo: a.acao === "ativar", ...extra };
  if (a.acao === "ativar") await byOwner(db.from("convites").update({ ativo: false }), gerenteId).neq("id", a.id);
  const { error } = await db.from("convites").update(upd).eq("id", a.id);
  if (error) throw new Error(error.message);
}
const inviteInput = z.object({ acao: z.enum(["criar", "ativar", "desativar", "novo_codigo"]), id: z.string().uuid().optional(), limite: z.number().int().min(1).max(1000).optional(), dias: z.number().int().min(1).max(365).optional() });

// ---------- Gerente ----------
export const getMyTeam = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const db = await admin();
  const g = await meuGerente(db, context.claims);
  return loadTeam(db, g.id);
});

export const saveMyTeam = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ nome: z.string().trim().max(60).nullable(), mensagem: z.string().trim().max(500).nullable(), link_afiliacao_mensal: z.string().trim().max(500), link_afiliacao_vitalicio: z.string().trim().max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const g = await meuGerente(db, context.claims);
    const e = validarLinksGerente(data.link_afiliacao_mensal, data.link_afiliacao_vitalicio); if (e) throw new Error(e);
    const { error } = await db.from("times").upsert({ gerente_id: g.id, nome: data.nome || null, mensagem_boas_vindas: data.mensagem || null, link_afiliacao_mensal: data.link_afiliacao_mensal, link_afiliacao_vitalicio: data.link_afiliacao_vitalicio, atualizado_em: new Date().toISOString() });
    if (error) throw new Error(error.message);
    const { count } = await db.from("convites").select("id", { count: "exact", head: true }).eq("gerente_id", g.id);
    if (!count) await inviteAction(db, g.id, { acao: "criar" });
    return { ok: true };
  });

export const manageMyInvite = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => inviteInput.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const g = await meuGerente(db, context.claims);
    await inviteAction(db, g.id, data);
    return { ok: true };
  });

export const reviewMyMember = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), acao: z.enum(["aprovar_afiliacao", "aprovar_links", "recusar"]), motivo: z.string().trim().max(500).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { proximaEtapa } = await import("@/lib/influencer-rules");
    const db = await admin();
    const g = await meuGerente(db, context.claims);
    const { data: m } = await db.from("influenciadores").select("*, members(email)").eq("id", data.id).eq("gerente_id", g.id).maybeSingle();
    if (!m) throw new Error("Membro não encontrado no seu time.");
    const r = proximaEtapa(m.status_cadastro, data.acao);
    if ("erro" in r) throw new Error(r.erro);
    if (data.acao === "recusar" && !data.motivo) throw new Error("Informe o motivo da recusa.");
    if (data.acao === "aprovar_links" && (!m.codigo || !m.link_mensal || !m.link_vitalicio)) throw new Error("Faltam o código ou os links.");
    const upd: Record<string, unknown> = { status_cadastro: r.status, motivo_recusa: data.acao === "recusar" ? data.motivo : null };
    if (r.status === "ativo") upd["aprovado_em"] = m.aprovado_em ?? new Date().toISOString();
    if (r.status === "afiliacao_aprovada") upd["passos"] = { ...((m.passos ?? {}) as Record<string, unknown>), aprovada: new Date().toISOString() };
    const { error } = await db.from("influenciadores").update(upd as any).eq("id", m.id);
    if (error) throw new Error(error.message);
    await audit(db, (context as any).userId, `gerente_${data.acao}`, (m as any).members?.email ?? null, { status: m.status_cadastro }, upd);
    return { ok: true };
  });

// ---------- Admin ----------
export type ManagerRow = { id: string; nome: string; email: string; codigo: string | null; time: string | null; ativos: number; emCadastro: number; convite: Invite | null };

export const listManagers = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async (): Promise<ManagerRow[]> => {
  const db = await admin();
  const [{ data: gs }, { data: ms }, { data: cs }, { data: ts }] = await Promise.all([
    db.from("influenciadores").select("id, codigo, members(name, email)").eq("is_gerente", true),
    db.from("influenciadores").select("gerente_id, status_cadastro").not("gerente_id", "is", null),
    db.from("convites").select("id, codigo, ativo, limite_usos, usos, expira_em, gerente_id").eq("ativo", true),
    db.from("times").select("gerente_id, nome"),
  ]);
  return (gs ?? []).map((g: any) => {
    const mine = (ms ?? []).filter((m: any) => m.gerente_id === g.id);
    return { id: g.id, nome: g.members?.name ?? "—", email: g.members?.email ?? "", codigo: g.codigo, time: (ts ?? []).find((t: any) => t.gerente_id === g.id)?.nome ?? null,
      ativos: mine.filter((m: any) => m.status_cadastro === "ativo").length, emCadastro: mine.filter((m: any) => m.status_cadastro !== "ativo").length,
      convite: ((cs ?? []).find((c: any) => c.gerente_id === g.id) as Invite | undefined) ?? null };
  });
});

export const adminGetTeam = createServerFn({ method: "GET" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => loadTeam(await admin(), data.id));

export const adminSaveTeam = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid(), nome: z.string().trim().max(60).nullable(), mensagem: z.string().trim().max(500).nullable(), link_afiliacao_mensal: z.string().trim().max(500).nullable(), link_afiliacao_vitalicio: z.string().trim().max(500).nullable(), percentual_info: z.number().min(0).max(100).nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    if (data.link_afiliacao_mensal || data.link_afiliacao_vitalicio) { const e = validarLinksGerente(data.link_afiliacao_mensal ?? "", data.link_afiliacao_vitalicio ?? ""); if (e) throw new Error(e); }
    const { data: antes } = await db.from("times").select("*").eq("gerente_id", data.id).maybeSingle();
    const depois = { gerente_id: data.id, nome: data.nome || null, mensagem_boas_vindas: data.mensagem || null, link_afiliacao_mensal: data.link_afiliacao_mensal || null, link_afiliacao_vitalicio: data.link_afiliacao_vitalicio || null, percentual_gerente_info: data.percentual_info, atualizado_em: new Date().toISOString() };
    const { error } = await db.from("times").upsert(depois);
    if (error) throw new Error(error.message);
    await audit(db, (context as any).userId, "editar_time", null, antes, depois);
    return { ok: true };
  });

export const adminManageInvite = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => inviteInput.extend({ gerente_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { gerente_id, ...a } = data;
    await inviteAction(db, gerente_id, a);
    await audit(db, (context as any).userId, `convite_${a.acao}`, null, null, data);
    return { ok: true };
  });

export const moveInfluencerTeam = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid(), gerente_id: z.string().uuid().nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    if (data.gerente_id === data.id) throw new Error("Um gerente não pode estar no próprio time.");
    if (data.gerente_id) {
      const { data: g } = await db.from("influenciadores").select("is_gerente").eq("id", data.gerente_id).maybeSingle();
      if (!g?.is_gerente) throw new Error("Escolha um gerente válido.");
    }
    const { data: cur } = await db.from("influenciadores").select("gerente_id, members(email)").eq("id", data.id).single();
    await db.from("influenciadores").update({ gerente_id: data.gerente_id }).eq("id", data.id);
    await audit(db, (context as any).userId, "trocar_time", (cur as any)?.members?.email ?? null, { gerente_id: cur?.gerente_id }, { gerente_id: data.gerente_id });
    return { ok: true };
  });

export const resolveLinkChange = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid(), aprovar: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: i } = await db.from("influenciadores").select("link_mensal, link_vitalicio, pedido_troca_links, members(email)").eq("id", data.id).single();
    const p = i?.pedido_troca_links as { mensal: string; vitalicio: string } | null;
    if (!p) throw new Error("Não há pedido de troca.");
    await db.from("influenciadores").update(data.aprovar ? { link_mensal: p.mensal, link_vitalicio: p.vitalicio, pedido_troca_links: null } : { pedido_troca_links: null }).eq("id", data.id);
    await audit(db, (context as any).userId, data.aprovar ? "aprovar_troca_links" : "recusar_troca_links", (i as any)?.members?.email ?? null, { mensal: i?.link_mensal, vitalicio: i?.link_vitalicio }, p);
    return { ok: true };
  });

// ---------- Convite da plataforma (sem time) ----------
export const adminGetPlatformInvite = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async (): Promise<Invite | null> => {
  const db = await admin();
  const { data } = await db.from("convites").select("id, codigo, ativo, limite_usos, usos, expira_em").is("gerente_id", null).order("ativo", { ascending: false }).order("criado_em", { ascending: false }).limit(1).maybeSingle();
  return (data as Invite | null) ?? null;
});

export const adminManagePlatformInvite = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator((d) => inviteInput.parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    await inviteAction(db, null, data);
    await audit(db, (context as any).userId, `convite_plataforma_${data.acao}`, null, null, data);
    return { ok: true };
  });
