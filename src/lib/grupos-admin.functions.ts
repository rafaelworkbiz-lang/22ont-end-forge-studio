import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin.functions";
import { parseGroupCsv } from "./divulgacao-core";

const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;
const uuid = z.string().uuid();
const groupInput = z.object({
  rede: z.enum(["whatsapp", "facebook"]), nome: z.string().trim().min(2).max(120), link: z.string().trim().url().startsWith("https://").max(300),
  nichos: z.array(z.string().trim().min(1).max(40)).max(10), palavras_chave: z.array(z.string().trim().min(1).max(40)).max(15),
  membros_aprox: z.number().int().min(0).max(10_000_000).nullable(), regras: z.string().trim().max(200).nullable(),
  frequencia_min_horas: z.number().int().min(0).max(720), exige_foto: z.boolean(),
});

export const adminListGroups = createServerFn({ method: "GET" }).middleware([requireAdmin])
  .inputValidator(d => z.object({ q: z.string().max(80).default(""), page: z.number().int().min(1).default(1) }).parse(d ?? {}))
  .handler(async ({ data }) => {
    const db = await admin();
    let q = db.from("grupos").select("id,rede,nome,link,nichos,palavras_chave,membros_aprox,regras,frequencia_min_horas,exige_foto,ativo,verificado_em", { count: "exact" });
    const t = data.q.trim().replace(/[(),*%]/g, " ").trim();
    if (t) q = q.or(`nome.ilike.*${t}*,link.ilike.*${t}*`);
    const from = (data.page - 1) * 30;
    const { data: rows, count } = await q.order("criado_em", { ascending: false }).order("nome").range(from, from + 29);
    const { data: den } = await db.from("grupo_denuncias").select("id,grupo_id,motivo,criado_em,grupos(nome,link,ativo)").order("criado_em", { ascending: false }).limit(100);
    return { rows: rows ?? [], total: count ?? 0, denuncias: den ?? [] };
  });

export const adminSaveGroup = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator(d => z.object({ id: uuid.nullable(), group: groupInput }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const r = data.id ? await db.from("grupos").update(data.group).eq("id", data.id) : await db.from("grupos").insert(data.group);
    return { ok: !r.error, error: r.error?.code === "23505" ? "Já existe um grupo com esse link." : r.error ? "Não foi possível salvar." : null };
  });

export const adminSetGroup = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator(d => z.object({ id: uuid, ativo: z.boolean().optional(), verificado: z.boolean().optional() }).parse(d))
  .handler(async ({ data }) => {
    const patch: { ativo?: boolean; verificado_em?: string | null } = {};
    if (data.ativo !== undefined) patch.ativo = data.ativo;
    if (data.verificado !== undefined) patch.verificado_em = data.verificado ? new Date().toISOString() : null;
    const { error } = await (await admin()).from("grupos").update(patch).eq("id", data.id);
    return { ok: !error };
  });

export const adminImportGroups = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator(d => z.object({ csv: z.string().max(500_000) }).parse(d))
  .handler(async ({ data }) => {
    const { rows, errors } = parseGroupCsv(data.csv);
    if (!rows.length) return { inserted: 0, errors };
    const { data: ins, error } = await (await admin()).from("grupos").upsert(rows, { onConflict: "link", ignoreDuplicates: true }).select("id");
    return { inserted: error ? 0 : ins?.length ?? 0, errors };
  });

export const adminListTemplates = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async () => {
  const { data } = await (await admin()).from("modelos_mensagem").select("id,nome,texto,ativo,ordem").order("ordem");
  return data ?? [];
});

export const adminSaveTemplate = createServerFn({ method: "POST" }).middleware([requireAdmin])
  .inputValidator(d => z.object({ id: uuid.nullable(), nome: z.string().trim().min(2).max(60), texto: z.string().trim().min(5).max(1500), ativo: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin(); const row = { nome: data.nome, texto: data.texto, ativo: data.ativo };
    const r = data.id ? await db.from("modelos_mensagem").update(row).eq("id", data.id) : await db.from("modelos_mensagem").insert({ ...row, ordem: 99 });
    return { ok: !r.error };
  });
