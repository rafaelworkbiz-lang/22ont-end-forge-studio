// Regras puras da aba Divulgação (sem acesso a banco ou navegador).
export type Canal = "whatsapp" | "facebook";
export const SITE = "https://afiliaplace.site";
export const KEYWORDS = ["Achadinhos", "Ofertas", "Utilidades para casa", "Cozinha", "Dicas para mamãe", "Eletrônicos", "Desconto", "Beleza", "Fitness", "Compra e venda"];
export const PAGE_SIZE = 20;

export function storeLink(slug: string, canal: Canal, categoria?: string | null) {
  const base = `${SITE}/loja/${slug}?c=${canal}`;
  return categoria ? `${base}#${slugify(categoria)}` : base;
}
export function productLink(lojaId: string, meuProdutoId: string, canal: Canal) {
  return `${SITE}/r/${lojaId}/${meuProdutoId}?c=${canal}`;
}
export function slugify(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export type Vars = { loja?: string; link?: string; produto?: string; preco?: string };
/** Substitui {loja} {link} {produto} {preco}; variáveis sem valor somem com a linha vazia que sobrar. */
export function fillTemplate(texto: string, v: Vars) {
  return texto.replace(/\{(loja|link|produto|preco)\}/g, (_, k: keyof Vars) => v[k] ?? "")
    .split("\n").filter((l, i, a) => l.trim() !== "" || (a[i - 1]?.trim() ?? "") !== "").join("\n").trim();
}

/** Horas desde a última postagem e se já pode postar de novo no grupo. */
export function intervalStatus(lastIso: string | null, freqHoras: number, now = Date.now()) {
  if (!lastIso) return { canPost: true, hoursSince: null as number | null, waitHours: 0 };
  const hoursSince = (now - new Date(lastIso).getTime()) / 3600_000;
  const wait = Math.max(0, freqHoras - hoursSince);
  return { canPost: wait <= 0, hoursSince, waitHours: Math.ceil(wait) };
}

/** Início do dia de hoje no fuso de São Paulo, em ISO. */
export function startOfTodaySP(now = new Date()) {
  const d = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  return new Date(`${d}T00:00:00-03:00`).toISOString();
}

export function lastPostLabel(iso: string | null, now = new Date()) {
  if (!iso) return "Você ainda não postou";
  const d = new Date(iso);
  const day = (x: Date) => x.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  if (day(d) === day(now)) return `hoje ${d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })}`;
  const days = Math.max(1, Math.round((now.getTime() - d.getTime()) / 86400_000));
  return days === 1 ? "ontem" : `há ${days} dias`;
}

/** Linha de CSV do admin: rede,nome,link,nichos(;),membros,regras,frequência */
export function parseGroupCsv(text: string) {
  const out: { rede: Canal; nome: string; link: string; nichos: string[]; membros_aprox: number | null; regras: string | null; frequencia_min_horas: number }[] = [];
  const errors: number[] = [];
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim() || (i === 0 && /^rede\s*,/i.test(line))) return;
    const c = splitCsv(line);
    const rede = c[0]?.trim().toLowerCase();
    const link = c[2]?.trim() ?? "";
    if ((rede !== "whatsapp" && rede !== "facebook") || !c[1]?.trim() || !/^https:\/\//.test(link)) { errors.push(i + 1); return; }
    const m = Number(c[4]); const f = Number(c[6]);
    out.push({ rede, nome: c[1].trim().slice(0, 120), link, nichos: (c[3] ?? "").split(";").map(s => s.trim()).filter(Boolean),
      membros_aprox: Number.isFinite(m) && m > 0 ? Math.round(m) : null, regras: c[5]?.trim() || null, frequencia_min_horas: Number.isFinite(f) && f >= 0 && c[6]?.trim() ? Math.round(f) : 6 });
  });
  return { rows: out, errors };
}
function splitCsv(line: string) {
  const r: string[] = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) { const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if (ch === "," && !q) { r.push(cur); cur = ""; } else cur += ch; }
  r.push(cur); return r;
}
