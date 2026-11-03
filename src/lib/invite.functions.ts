import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { LIMITE_CADASTROS_POR_IP_HORA } from "@/lib/influencer-rules";

export type InvitePublic = { gerente: string | null; time: string | null; mensagem: string | null; valido: boolean } | null;

export const getInvitePublic = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ codigo: z.string().trim().toLowerCase().regex(/^[a-z0-9]{6,16}$/) }).parse(d))
  .handler(async ({ data }): Promise<InvitePublic> => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
    });
    const { data: r } = await (sb.rpc as any)("convite_publico", { _codigo: data.codigo });
    return (r ?? null) as InvitePublic;
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({
    codigo: z.string().trim().toLowerCase().regex(/^[a-z0-9]{6,16}$/),
    nome: z.string().trim().min(2).max(40),
    sobrenome: z.string().trim().min(2).max(40),
    senha: z.string().min(8).max(72),
    foto: z.string().regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/).max(2_800_000),
    email: z.string().trim().toLowerCase().email().max(255),
    whatsapp: z.string().trim().regex(/^[\d\s()+-]{10,20}$/),
    termos: z.literal(true),
  }).parse(d))
  .handler(async ({ data }) => {
    const db = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
    const ip = (getRequestHeader("cf-connecting-ip") || getRequestHeader("x-forwarded-for")?.split(",")[0] || "desconhecido").trim().slice(0, 64);
    const { data: okRate } = await (db.rpc as any)("cadastro_rate_hit", { _ip: ip, _limit: LIMITE_CADASTROS_POR_IP_HORA });
    if (!okRate) return { ok: false as const, erro: "Muitos cadastros a partir desta conexão. Tente de novo em 1 hora." };
    const { data: existe } = await db.from("members").select("id").ilike("email", data.email).maybeSingle();
    if (existe) return { ok: false as const, erro: "Este e-mail já tem conta. Entre com ele ou fale com quem te convidou." };
    const { data: conviteId } = await (db.rpc as any)("usar_convite", { _codigo: data.codigo });
    if (!conviteId) return { ok: false as const, erro: "Este convite não é mais válido. Peça um novo link a quem te convidou." };
    const { data: c } = await db.from("convites").select("gerente_id").eq("id", conviteId).single();
    const nomeCompleto = `${data.nome} ${data.sobrenome}`.trim();
    const { data: cu, error: cuErr } = await db.auth.admin.createUser({ email: data.email, password: data.senha, email_confirm: true, user_metadata: { name: nomeCompleto } });
    if (cuErr || !cu?.user) return { ok: false as const, erro: "Não foi possível criar a conta agora. Tente novamente." };
    const uid = cu.user.id;
    const falha = async () => { await db.auth.admin.deleteUser(uid); return { ok: false as const, erro: "Não foi possível criar a conta agora. Tente novamente." }; };
    const [, mime, b64] = data.foto.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)!;
    const bytes = Uint8Array.from(atob(b64!), (ch) => ch.charCodeAt(0));
    if (bytes.length > 2 * 1024 * 1024) return falha();
    const path = `${uid}/avatar-${Date.now()}.${mime!.split("/")[1] === "jpeg" ? "jpg" : mime!.split("/")[1]}`;
    const { error: upErr } = await db.storage.from("avatars").upload(path, bytes, { contentType: mime!, upsert: true });
    if (upErr) return falha();
    await db.auth.admin.updateUserById(uid, { user_metadata: { name: nomeCompleto, avatar_path: path } });
    const wa = data.whatsapp.replace(/\D/g, ""); const waN = wa.length <= 11 ? "55" + wa : wa;
    const { data: m, error: mErr } = await db.from("members").insert({ name: nomeCompleto, email: data.email, whatsapp: waN, plan: "monthly", status: "active", expires_at: null }).select("id").single();
    if (mErr || !m) return falha();
    const inv = { user: { id: uid } };
    await db.from("member_roles").insert({ member_id: m.id, role: "influencer" });
    await db.from("influenciadores").insert({ member_id: m.id, gerente_id: c?.gerente_id ?? null, status_cadastro: "convidado" });
    await db.from("convite_usos").insert({ convite_id: conviteId, user_id_criado: inv?.user?.id ?? null, ip });
    if (inv?.user?.id) await db.from("admin_audit_log").insert({ admin_id: inv.user.id, acao: "cadastro_por_convite", alvo_email: data.email, antes: null, depois: { convite_id: conviteId, gerente_id: c?.gerente_id } });
    return { ok: true as const };
  });
