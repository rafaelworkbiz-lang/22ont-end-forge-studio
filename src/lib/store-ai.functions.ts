import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "./admin.functions";
import { IA_ESTILOS, inicioDoMes, type IaTipo } from "./store-ai-moderation";
import { DIRECAO, NEGATIVO, PESO, limparBriefing, somarUso, type Briefing, type Conceito, type ProdutoCtx } from "./store-ai-art";
import { USD_IMG, baixarRefs, editarImagem, gerarImagem } from "./store-ai-gen.server";
import type { Json } from "@/integrations/supabase/types";
import { gerarCore, type GerarInput } from "./store-ai-core";

const DEFAULT_MODEL = "openai/gpt-image-2.5-sunburst";
const SIZES: Record<IaTipo, string> = { logo: "1024x1024", banner: "1536x1024" };

async function planoDe(db: Parameters<typeof import("./access-core.server")["computeAccess"]>[0], userId: string) {
  const { computeAccess } = await import("./access-core.server");
  const a = await computeAccess(db, userId);
  if (!a.allowed) return null;
  return a.plan === "lifetime" || a.reason === "admin" || a.reason === "influencer" ? "vitalicio" as const : "mensal" as const;
}

async function uso(userId: string, plano: "mensal" | "vitalicio") {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: cfg }, { data: rows }] = await Promise.all([
    supabaseAdmin.from("config_ia").select("limite_mensal").eq("plano", plano).maybeSingle(),
    supabaseAdmin.from("ia_geracoes").select("status, peso").eq("user_id", userId).gte("criado_em", inicioDoMes().toISOString()),
  ]);
  return { usado: somarUso(rows ?? []), limite: cfg?.limite_mensal ?? 0 };
}

export const getIaUsage = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const plano = await planoDe(context.supabase, context.userId);
  if (!plano) return { usado: 0, limite: 0, plano: null };
  return { ...(await uso(context.userId, plano)), plano };
});

type Admin = typeof import("@/integrations/supabase/client.server")["supabaseAdmin"];
const toB64 = (u: Uint8Array) => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(s); };

/** Contexto automático: tema e os 6 principais produtos da loja. */
async function contextoLoja(admin: Admin, lojaId: string) {
  const { data: rows } = await admin.from("loja_produtos").select("ordem, meus_produtos!inner(fornecedor, item_id)").eq("loja_id", lojaId).order("ordem").limit(6);
  const itens = (rows ?? []).map(r => (r as unknown as { meus_produtos: { fornecedor: string; item_id: string } }).meus_produtos);
  if (!itens.length) return [] as ProdutoCtx[];
  const { data: cache } = await admin.from("produtos_cache").select("fornecedor, item_id, titulo, categoria, imagens").in("item_id", itens.map(i => i.item_id));
  return itens.flatMap(i => { const c = (cache ?? []).find(x => x.item_id === i.item_id && x.fornecedor === i.fornecedor); return c ? [{ titulo: c.titulo.slice(0, 80), categoria: c.categoria, foto: c.imagens?.[0] ?? null }] : []; });
}

async function salvarPngs(admin: Admin, imgs: Uint8Array[], base: string, ext: string) {
  const paths = imgs.map((_, i) => `${base}-${i}.${ext}`);
  const ups = await Promise.all(imgs.map((b, i) => admin.storage.from("lojas").upload(paths[i]!, b, { contentType: `image/${ext}`, upsert: true })));
  if (ups.some(u => u.error)) throw new Error("upload");
  return paths;
}

const briefingSchema = z.object({ publico: z.string().max(120).optional(), personalidade: z.array(z.string().max(30)).max(3).optional(), simbolo: z.string().max(120).optional(), cores: z.string().max(80).optional(), evitar: z.string().max(120).optional() });

export const salvarBriefing = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ lojaId: z.string().uuid(), briefing: briefingSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("lojas").update({ briefing: limparBriefing(data.briefing) }).eq("id", data.lojaId).eq("user_id", context.userId);
    return { ok: !error };
  });

export const getBriefing = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ lojaId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: l } = await context.supabase.from("lojas").select("briefing").eq("id", data.lojaId).eq("user_id", context.userId).maybeSingle();
    return limparBriefing((l?.briefing ?? {}) as Briefing);
  });

export const gerarIdentidade = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ lojaId: z.string().uuid(), tipo: z.enum(["logo", "banner"]), estilo: z.enum(IA_ESTILOS), descricao: z.string().trim().max(200).nullable().optional(), comTexto: z.boolean().optional(), briefing: briefingSchema.optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const plano = await planoDe(context.supabase, context.userId);
    if (!plano) return { ok: false as const, code: "limite" as const, error: "Seu plano não está ativo.", usado: 0, limite: 0 };
    const { data: loja } = await context.supabase.from("lojas").select("id, nome, nicho, cor_destaque, tema, briefing").eq("id", data.lojaId).eq("user_id", context.userId).maybeSingle();
    if (!loja) return { ok: false as const, code: "erro" as const, error: "Loja não encontrada.", usado: 0, limite: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const apiKey = process.env["LOVABLE_API_KEY"];
    const cfgModel = (await supabaseAdmin.from("config_ia").select("modelo").eq("plano", plano).maybeSingle()).data?.modelo;
    const model = cfgModel?.startsWith("openai/") ? cfgModel : DEFAULT_MODEL;
    const briefing = limparBriefing(data.briefing ?? (loja.briefing as Briefing));
    if (data.briefing) await context.supabase.from("lojas").update({ briefing }).eq("id", loja.id);
    const tema = (loja.tema ?? {}) as { cor_destaque?: string; cor_fundo?: string; fonte?: string };
    const comTexto = data.tipo === "logo" && !!data.comTexto;
    const extra = [briefing.publico, briefing.simbolo, briefing.cores, briefing.evitar, ...(briefing.personalidade ?? [])].filter(Boolean).join(" ");
    const input: GerarInput = { userId: context.userId, lojaId: loja.id, tipo: data.tipo, estilo: data.estilo, descricao: [data.descricao, extra].filter(Boolean).join(" · ") || null, nome: loja.nome, nicho: loja.nicho, cor: loja.cor_destaque, plano, comTexto };
    const r = await gerarCore({
      limite: async p => (await supabaseAdmin.from("config_ia").select("limite_mensal").eq("plano", p).maybeSingle()).data?.limite_mensal ?? 0,
      statusDoMes: async (uid, desde) => (await supabaseAdmin.from("ia_geracoes").select("status, peso").eq("user_id", uid).gte("criado_em", desde.toISOString())).data ?? [],
      bloqueios: async () => {
        const [m, s] = await Promise.all([supabaseAdmin.from("marcas_bloqueadas").select("termo"), supabaseAdmin.from("slugs_reservados").select("termo")]);
        return { marcas: (m.data ?? []).map(x => x.termo), reservados: (s.data ?? []).map(x => x.termo) };
      },
      registrar: async row => {
        const { data: g, error } = await supabaseAdmin.from("ia_geracoes").insert({ user_id: context.userId, loja_id: loja.id, tipo: row.tipo, estilo: row.estilo, descricao: row.descricao, status: row.status, motivo: row.motivo ?? null, opcoes: row.opcoes ?? [], custo_estimado: row.custo ?? null, custo_real: row.custo ?? null, conceitos: (row.conceitos ?? []) as Json, peso: row.peso ?? 1, modelo: model, com_texto: comTexto }).select("id").single();
        if (error) throw error; return g.id;
      },
      gerarImagens: async (tipo, n) => {
        if (!apiKey) throw new Error("sem chave LOVABLE_API_KEY");
        // Rápido: sem diretor de arte e sem revisão — as ideias saem direto do pedido do usuário.
        const produtos = tipo === "banner" ? await contextoLoja(supabaseAdmin, loja.id) : [];
        let usd = 0;
        const base = `${tipo === "logo" ? "A simple, distinctive brand symbol (no text, no letters) for a small online store" : "A wide promotional banner photo scene for a small online store"} named "${loja.nome}"${loja.nicho ? ` in the niche "${loja.nicho}"` : ""}. ${data.descricao ? `Idea from the owner: ${data.descricao}. ` : ""}Color palette: ${briefing.cores ?? loja.cor_destaque}.`;
        const todos: Conceito[] = [
          { nome_curto: "A", tipo: "simbolo", ideia: "Versão fiel ao pedido", prompt_imagem: `${base} Faithful, clean interpretation.` } ,
          { nome_curto: "B", tipo: "simbolo", ideia: "Versão mais ousada", prompt_imagem: `${base} A bolder, more creative interpretation.` } ,
        ].slice(0, n);
        const refs = tipo === "banner" ? await baixarRefs(produtos.flatMap(p => p.foto ? [p.foto] : [])) : [];
        const opts = { model, tipo, size: SIZES[tipo], quality: "medium" as const };
        const fazer = (c: Conceito) => {
          const p = `${c.prompt_imagem}\n${DIRECAO[data.estilo][tipo]}. ${NEGATIVO}${tipo === "banner" ? " Leave the left third calm and empty for text. Use the reference product photos as the products shown in the scene, studio light, niche setting." : ""}`;
          return refs.length ? editarImagem(apiKey, opts, p, refs) : gerarImagem(apiKey, opts, p);
        };
        const rs = await Promise.allSettled(todos.map(fazer));
        let atuais: { img: Uint8Array; c: Conceito }[] = [];
        rs.forEach((x, i) => { if (x.status === "fulfilled") atuais.push({ img: x.value, c: todos[i]! }); });
        usd += atuais.length * USD_IMG.medium[tipo];
        if (!atuais.length) throw (rs[0] as PromiseRejectedResult).reason;
        const ext = tipo === "logo" ? "png" : "webp";
        const paths = await salvarPngs(supabaseAdmin, atuais.map(x => x.img), `${context.userId}/_ia/${loja.id}-${tipo}-${Date.now()}`, ext);
        return { paths, conceitos: atuais.map(x => ({ nome_curto: x.c.nome_curto, tipo: x.c.tipo, ideia: x.c.ideia })), custo: +usd.toFixed(4) };
      },
    }, input);
    if (!r.ok) return r;
    const { data: signed } = await supabaseAdmin.storage.from("lojas").createSignedUrls(r.opcoes, 3600);
    return { ok: true as const, geracaoId: r.geracaoId, opcoes: (signed ?? []).map(s => s.signedUrl ?? ""), ideias: (r.conceitos as { ideia?: string }[]).map(c => c.ideia ?? ""), usado: r.usado, limite: r.limite };
  });

/** Refinar a opção escolhida: 2 variações por edição de imagem, conta meia geração. */
export const refinarIdentidade = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ geracaoId: z.string().uuid(), indice: z.number().int().min(0).max(3), pedido: z.string().trim().min(3).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const plano = await planoDe(context.supabase, context.userId);
    if (!plano) return { ok: false as const, code: "limite" as const, error: "Seu plano não está ativo.", usado: 0, limite: 0 };
    const { data: g } = await context.supabase.from("ia_geracoes").select("id, loja_id, tipo, estilo, status, opcoes, limpo, com_texto").eq("id", data.geracaoId).eq("user_id", context.userId).maybeSingle();
    const src = ((g?.opcoes ?? []) as string[])[data.indice];
    if (!g || g.status !== "ok" || g.limpo || !src || !g.loja_id) return { ok: false as const, code: "erro" as const, error: "Essas opções expiraram. Gere novamente.", usado: 0, limite: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: loja } = await supabaseAdmin.from("lojas").select("id, nome, nicho, cor_destaque").eq("id", g.loja_id).eq("user_id", context.userId).maybeSingle();
    if (!loja) return { ok: false as const, code: "erro" as const, error: "Loja não encontrada.", usado: 0, limite: 0 };
    const apiKey = process.env["LOVABLE_API_KEY"];
    const cfgModel = (await supabaseAdmin.from("config_ia").select("modelo").eq("plano", plano).maybeSingle()).data?.modelo;
    const model = cfgModel?.startsWith("openai/") ? cfgModel : DEFAULT_MODEL;
    const tipo = g.tipo as IaTipo; const estilo = (IA_ESTILOS as readonly string[]).includes(g.estilo) ? g.estilo as (typeof IA_ESTILOS)[number] : "Moderno";
    const r = await gerarCore({
      limite: async p => (await supabaseAdmin.from("config_ia").select("limite_mensal").eq("plano", p).maybeSingle()).data?.limite_mensal ?? 0,
      statusDoMes: async (uid, desde) => (await supabaseAdmin.from("ia_geracoes").select("status, peso").eq("user_id", uid).gte("criado_em", desde.toISOString())).data ?? [],
      bloqueios: async () => {
        const [m, s] = await Promise.all([supabaseAdmin.from("marcas_bloqueadas").select("termo"), supabaseAdmin.from("slugs_reservados").select("termo")]);
        return { marcas: (m.data ?? []).map(x => x.termo), reservados: (s.data ?? []).map(x => x.termo) };
      },
      registrar: async row => {
        const { data: n, error } = await supabaseAdmin.from("ia_geracoes").insert({ user_id: context.userId, loja_id: loja.id, tipo, estilo, descricao: row.descricao, status: row.status, motivo: row.motivo ?? null, opcoes: row.opcoes ?? [], custo_estimado: row.custo ?? null, custo_real: row.custo ?? null, conceitos: (row.conceitos ?? []) as Json, peso: PESO.refino, origem_id: g.id, modelo: model, com_texto: g.com_texto }).select("id").single();
        if (error) throw error; return n.id;
      },
      gerarImagens: async () => {
        if (!apiKey) throw new Error("sem chave LOVABLE_API_KEY");
        const { data: blob } = await supabaseAdmin.storage.from("lojas").download(src);
        if (!blob) throw new Error("origem");
        const opts = { model, tipo, size: SIZES[tipo], quality: "medium" as const };
        const base = `Keep the same concept, composition and identity of this ${tipo}. Apply this change: "${data.pedido}". ${NEGATIVO}${g.com_texto ? "" : " No letters or text."}`;
        const rs = await Promise.allSettled([editarImagem(apiKey, opts, `${base} Variation A, faithful.`, [blob]), editarImagem(apiKey, opts, `${base} Variation B, slightly bolder interpretation.`, [blob])]);
        const imgs = rs.flatMap(x => x.status === "fulfilled" ? [x.value] : []);
        if (!imgs.length) throw (rs[0] as PromiseRejectedResult).reason;
        const paths = await salvarPngs(supabaseAdmin, imgs, `${context.userId}/_ia/${loja.id}-${tipo}-ref-${Date.now()}`, tipo === "logo" ? "png" : "webp");
        return { paths, conceitos: imgs.map((_, i) => ({ ideia: `Ajuste: ${data.pedido}${i ? " (versão mais ousada)" : ""}` })), custo: +(imgs.length * USD_IMG.medium[tipo]).toFixed(4) };
      },
    }, { userId: context.userId, lojaId: loja.id, tipo, estilo, descricao: data.pedido, nome: loja.nome, nicho: loja.nicho, cor: loja.cor_destaque, plano, peso: PESO.refino });
    if (!r.ok) return r;
    const { data: signed } = await supabaseAdmin.storage.from("lojas").createSignedUrls(r.opcoes, 3600);
    return { ok: true as const, geracaoId: r.geracaoId, opcoes: (signed ?? []).map(s => s.signedUrl ?? ""), ideias: (r.conceitos as { ideia?: string }[]).map(c => c.ideia ?? ""), usado: r.usado, limite: r.limite };
  });

/** Acabamento: versão final em qualidade alta (sem custo no limite) e cópia para a pasta da loja. */
export const escolherIdentidade = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ geracaoId: z.string().uuid(), indice: z.number().int().min(0).max(3) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: g } = await context.supabase.from("ia_geracoes").select("id, loja_id, tipo, status, opcoes, limpo, modelo, custo_real").eq("id", data.geracaoId).eq("user_id", context.userId).maybeSingle();
    const opcoes = (g?.opcoes ?? []) as string[]; const src = opcoes[data.indice];
    if (!g || g.status !== "ok" || g.limpo || !src || !g.loja_id) return { ok: false as const, error: "Essas opções expiraram. Gere novamente." };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: loja } = await supabaseAdmin.from("lojas").select("logo_url, banner_url").eq("id", g.loja_id).eq("user_id", context.userId).maybeSingle();
    if (!loja) return { ok: false as const, error: "Loja não encontrada." };
    const tipo = g.tipo as IaTipo; const ext = src.endsWith(".webp") ? "webp" : "png";
    const dest = `${context.userId}/${g.loja_id}/${tipo}-ia-${Date.now()}.${ext}`;
    let feito = false; let extra = 0;
    const apiKey = process.env["LOVABLE_API_KEY"];
    const { data: blob } = await supabaseAdmin.storage.from("lojas").download(src);
    void apiKey; void blob; // cópia direta: a opção escolhida entra na hora
    if (!feito) { const { error } = await supabaseAdmin.storage.from("lojas").copy(src, dest); if (error) return { ok: false as const, error: "Não foi possível usar essa opção." }; }
    const old = tipo === "logo" ? loja.logo_url : loja.banner_url;
    await supabaseAdmin.from("lojas").update(tipo === "logo" ? { logo_url: dest } : { banner_url: dest }).eq("id", g.loja_id);
    if (old && old !== dest) await supabaseAdmin.storage.from("lojas").remove([old]);
    await supabaseAdmin.from("ia_geracoes").update({ escolhida_url: dest, custo_real: +(Number(g.custo_real ?? 0) + extra).toFixed(4) }).eq("id", g.id);
    const { data: s } = await supabaseAdmin.storage.from("lojas").createSignedUrl(dest, 3600);
    return { ok: true as const, tipo, path: dest, url: s?.signedUrl ?? null, geracaoId: g.id };
  });

/** Variações do logo montadas no navegador (ícone 512, favicon 64, horizontal) salvas na pasta da loja. */
export const salvarVariacoes = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(d => z.object({ geracaoId: z.string().uuid(), icone: z.string().max(2_000_000), favicon: z.string().max(200_000), horizontal: z.string().max(3_000_000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: g } = await context.supabase.from("ia_geracoes").select("id, loja_id").eq("id", data.geracaoId).eq("user_id", context.userId).maybeSingle();
    if (!g?.loja_id) return { ok: false as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const out: Record<string, string> = {}; const stamp = Date.now();
    for (const k of ["icone", "favicon", "horizontal"] as const) {
      const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(data[k]); if (!m) return { ok: false as const };
      const bin = atob(m[1]!); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      const path = `${context.userId}/${g.loja_id}/logo-${k}-${stamp}.png`;
      const { error } = await supabaseAdmin.storage.from("lojas").upload(path, u, { contentType: "image/png", upsert: true });
      if (error) return { ok: false as const }; out[k] = path;
    }
    await supabaseAdmin.from("ia_geracoes").update({ variacoes: out }).eq("id", g.id);
    return { ok: true as const, variacoes: out };
  });

/* ---------- Admin ---------- */
export const getIaAdmin = createServerFn({ method: "GET" }).middleware([requireAdmin]).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [cfg, marcas, mes, bloq, users] = await Promise.all([
    supabaseAdmin.from("config_ia").select("plano, limite_mensal, modelo").order("plano"),
    supabaseAdmin.from("marcas_bloqueadas").select("termo").order("termo"),
    supabaseAdmin.from("ia_geracoes").select("user_id, loja_id, status, custo_estimado, custo_real").gte("criado_em", inicioDoMes().toISOString()).limit(5000),
    supabaseAdmin.from("ia_geracoes").select("user_id, tipo, descricao, motivo, criado_em").eq("status", "bloqueado").order("criado_em", { ascending: false }).limit(20),
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const email = new Map((users.data?.users ?? []).map(u => [u.id, u.email ?? "—"]));
  const porUser = new Map<string, { ok: number; erro: number; bloqueado: number }>();
  for (const r of mes.data ?? []) { const c = porUser.get(r.user_id) ?? { ok: 0, erro: 0, bloqueado: 0 }; c[r.status as "ok"]++; porUser.set(r.user_id, c); }
  const custoDe = (r: { custo_real: number | null; custo_estimado: number | null }) => Number(r.custo_real ?? r.custo_estimado ?? 0);
  const custoMes = +((mes.data ?? []).reduce((t, r) => t + custoDe(r), 0)).toFixed(2);
  const okRows = (mes.data ?? []).filter(r => r.status === "ok");
  const custoMedioGeracao = okRows.length ? +(okRows.reduce((t, r) => t + custoDe(r), 0) / okRows.length).toFixed(3) : 0;
  const lojasIds = new Set(okRows.map(r => r.loja_id).filter(Boolean));
  const custoMedioLoja = lojasIds.size ? +(custoMes / lojasIds.size).toFixed(2) : 0;
  return {
    custoMes, custoMedioGeracao, custoMedioLoja, modelo: cfg.data?.[0]?.modelo ?? DEFAULT_MODEL, temChave: !!process.env["LOVABLE_API_KEY"],
    config: cfg.data ?? [], marcas: (marcas.data ?? []).map(m => m.termo),
    uso: [...porUser].map(([uid, c]) => ({ email: email.get(uid) ?? uid, ...c })).sort((a, b) => b.ok - a.ok),
    bloqueios: (bloq.data ?? []).map(b => ({ email: email.get(b.user_id) ?? b.user_id, tipo: b.tipo, descricao: b.descricao, motivo: b.motivo, criadoEm: b.criado_em })),
  };
});

export const setIaLimite = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator(d => z.object({ plano: z.enum(["mensal", "vitalicio"]), limite: z.number().int().min(0).max(1000) }).parse(d)).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("config_ia").upsert({ plano: data.plano, limite_mensal: data.limite });
  return { ok: !error };
});

export const addMarca = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator(d => z.object({ termo: z.string().trim().toLowerCase().min(2).max(60) }).parse(d)).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("marcas_bloqueadas").upsert({ termo: data.termo });
  return { ok: !error };
});

export const removeMarca = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator(d => z.object({ termo: z.string().min(1).max(60) }).parse(d)).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("marcas_bloqueadas").delete().eq("termo", data.termo);
  return { ok: !error };
});

export const setIaModelo = createServerFn({ method: "POST" }).middleware([requireAdmin]).inputValidator(d => z.object({ modelo: z.string().trim().regex(/^[a-z0-9][a-z0-9.\/\-]{2,60}$/) }).parse(d)).handler(async ({ data }) => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("config_ia").update({ modelo: data.modelo }).in("plano", ["mensal", "vitalicio"]);
  return { ok: !error };
});
