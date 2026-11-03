import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin.functions";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Member = {
  id: string; name: string; email: string; whatsapp: string; is_test?: boolean;
  plan: "monthly" | "lifetime"; status: "active" | "cancelled";
  expires_at: string | null; created_at: string; influencer: boolean; lojas: number; last_sign_in_at: string | null; blocked: boolean;
};

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const in30 = (from?: string | null) => {
  const base = from && new Date(from) > new Date() ? new Date(from) : new Date();
  base.setDate(base.getDate() + 30);
  return base.toISOString();
};

export const listMembers = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async (): Promise<Member[]> => {
  const db = await admin();
  const { data, error } = await db.from("members").select("*, member_roles(role)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const users: any[] = [];
  for (let page = 1; page <= 20; page++) { const { data: u } = await db.auth.admin.listUsers({ page, perPage: 200 }); users.push(...(u?.users ?? [])); if ((u?.users?.length ?? 0) < 200) break; }
  const byEmail = new Map(users.map((u) => [String(u.email).toLowerCase(), u]));
  const { data: lojas } = await db.from("lojas").select("user_id");
  const lojasPor = new Map<string, number>(); for (const l of lojas ?? []) lojasPor.set(l.user_id, (lojasPor.get(l.user_id) ?? 0) + 1);
  return (data ?? []).map(({ member_roles, demo_commission_percent: _d, ...m }: any) => {
    const u = byEmail.get(m.email.toLowerCase());
    return { ...m, influencer: (member_roles ?? []).some((r: any) => r.role === "influencer"), lojas: u ? lojasPor.get(u.id) ?? 0 : 0,
      last_sign_in_at: u?.last_sign_in_at ?? null, blocked: !!u?.banned_until && new Date(u.banned_until) > new Date() };
  });
});

const memberInput = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(255),
  whatsapp: z.string().transform((v) => v.replace(/\D/g, "")).pipe(z.string().min(10).max(13)),
  plan: z.enum(["monthly", "lifetime"]),
  influencer: z.boolean(),
});

async function setInfluencer(db: any, id: string, on: boolean) {
  if (on) {
    await db.from("member_roles").upsert({ member_id: id, role: "influencer" }, { onConflict: "member_id,role" });
    await db.from("influenciadores").upsert({ member_id: id }, { onConflict: "member_id", ignoreDuplicates: true });
  } else {
    await db.from("member_roles").delete().eq("member_id", id).eq("role", "influencer");
    await db.from("influenciadores").delete().eq("member_id", id);
  }
}

async function findAuthUser(db: any, email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const u = data?.users?.find((x: any) => x.email?.toLowerCase() === email.toLowerCase());
    if (u) return u;
    if (!data?.users?.length || data.users.length < 200) return null;
  }
  return null;
}

async function setLoginEmail(db: any, previousEmail: string, email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const u = data?.users?.find((x: any) => x.email?.toLowerCase() === previousEmail.toLowerCase());
    if (u) { const { error } = await db.auth.admin.updateUserById(u.id, { email, email_confirm: true }); if (error) throw new Error(error.message); return; }
    if (!data?.users?.length || data.users.length < 200) return;
  }
}

async function audit(db: any, adminId: string, acao: string, alvo_email: string | null, antes: unknown, depois: unknown) {
  await db.from("admin_audit_log").insert({ admin_id: adminId, acao, alvo_email, antes: antes ?? null, depois: depois ?? null });
}

export const listAudit = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async ({ context }) => {
  const { data, error } = await (context as any).supabase.from("admin_audit_log").select("*").order("criado_em", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; acao: string; alvo_email: string | null; antes: any; depois: any; criado_em: string }[];
});

export const createMember = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator((d) => memberInput.extend({ is_test: z.boolean().default(false) }).parse(d)).handler(async ({ data, context }) => {
  const db = await admin();
  const { influencer, ...m } = data;
  const origin = process.env["SITE_URL"] || "https://afiliaplace.site";
  const { error: invErr } = await db.auth.admin.inviteUserByEmail(m.email, { redirectTo: `${origin}/reset-password` });
  if (invErr && !/already|registered|exists/i.test(invErr.message)) throw new Error(invErr.message);
  const { data: row, error } = await db.from("members").insert({ ...m, expires_at: m.plan === "monthly" ? in30() : null }).select("id").single();
  if (error) throw new Error(error.code === "23505" ? "Este e-mail já está cadastrado." : error.message);
  await setInfluencer(db, row.id, influencer);
  await audit(db, (context as any).userId, "criar_usuario", m.email, null, { ...m, influencer });
  return { ok: true };
});

export const updateMember = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) => memberInput.extend({ id: z.string().uuid(), is_test: z.boolean().default(false), expires_at: z.string().datetime({ offset: true }).nullable().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { id, influencer, ...m } = data;
    const { data: cur } = await db.from("members").select("plan, expires_at, email, status, name, whatsapp").eq("id", id).single();
    if (cur && cur.email !== m.email) await setLoginEmail(db, cur.email, m.email);
    const expires_at = m.plan === "lifetime" ? null : m.expires_at ?? (cur?.plan === "monthly" ? cur.expires_at : in30());
    const { error } = await db.from("members").update({ ...m, expires_at }).eq("id", id);
    if (error) throw new Error(error.code === "23505" ? "Este e-mail já está cadastrado." : error.message);
    await setInfluencer(db, id, influencer);
    await audit(db, (context as any).userId, "editar_usuario", m.email, cur, { ...m, influencer, expires_at });
    return { ok: true };
  });

export const memberAction = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((d) => z.object({ id: z.string().uuid(), action: z.enum(["renew", "cancel", "reactivate", "toggleInfluencer", "delete", "block", "unblock", "resendInvite"]) }).parse(d))
  .handler(async ({ data: { id, action }, context }) => {
    const db = await admin();
    const { data: cur } = await db.from("members").select("email, plan, status, expires_at, member_roles(role)").eq("id", id).single();
    await audit(db, (context as any).userId, action, cur?.email ?? null, cur, null);
    if (action === "delete") { await db.from("members").delete().eq("id", id); return { ok: true }; }
    if (!cur) throw new Error("Usuário não encontrado.");
    if (action === "renew") await db.from("members").update({ status: "active", expires_at: cur.plan === "monthly" ? in30(cur.expires_at) : null }).eq("id", id);
    if (action === "cancel") await db.from("members").update({ status: "cancelled" }).eq("id", id);
    if (action === "reactivate") await db.from("members").update({ status: "active", expires_at: cur.plan === "monthly" ? in30(cur.expires_at) : null }).eq("id", id);
    if (action === "block" || action === "unblock") {
      const u = await findAuthUser(db, cur.email);
      if (!u) throw new Error("Essa pessoa ainda não tem login criado.");
      const { error } = await db.auth.admin.updateUserById(u.id, { ban_duration: action === "block" ? "876000h" : "none" });
      if (error) throw new Error(error.message);
    }
    if (action === "resendInvite") {
      const origin = process.env["SITE_URL"] || "https://afiliaplace.site";
      const { error } = await db.auth.resetPasswordForEmail(cur.email, { redirectTo: `${origin}/reset-password` });
      if (error) throw new Error(error.message);
    }
    if (action === "toggleInfluencer") await setInfluencer(db, id, !((cur as any).member_roles ?? []).some((r: any) => r.role === "influencer"));
    return { ok: true };
  });

export const normalizeWhatsapp = (v: string): string | null => {
  let d = String(v ?? "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  if (!/^55\d{10,11}$/.test(d) || /^55(0+)$/.test(d)) return null;
  return d;
};
export const hasWhatsapp = (v: string | null | undefined) => !/^0*$/.test(String(v ?? "").replace(/\D/g, "").replace(/^55/, ""));

export const meuWhatsapp = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const email = String((context.claims as any)?.email ?? "").toLowerCase();
  if (!email) return { precisa: false };
  const db = await admin();
  const { data } = await db.from("members").select("whatsapp").eq("email", email).maybeSingle();
  return { precisa: !!data && !hasWhatsapp(data.whatsapp) };
});

export const salvarMeuWhatsapp = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((i: { whatsapp: string }) => i)
  .handler(async ({ data, context }) => {
    const n = normalizeWhatsapp(data.whatsapp);
    if (!n) throw new Error("Número inválido. Use DDD + número.");
    const email = String((context.claims as any)?.email ?? "").toLowerCase();
    const db = await admin();
    const { error } = await db.from("members").update({ whatsapp: n }).eq("email", email);
    if (error) throw new Error("Não foi possível salvar.");
    return { ok: true };
  });
