// Chamadas ao gateway de IA do Lovable para o gerador de logo/banner (só servidor).
import type { Conceito } from "./store-ai-art";

const BASE = "https://ai.gateway.lovable.dev/v1";
export const TEXT_MODEL = "openai/gpt-6-astra";
// Preço aproximado do texto (USD por token) para o custo exibido no admin.
const USD_IN = 1.25 / 1e6, USD_OUT = 10 / 1e6;
export const USD_IMG: Record<"medium" | "high", Record<"logo" | "banner", number>> = { medium: { logo: 0.042, banner: 0.063 }, high: { logo: 0.167, banner: 0.25 } };

type Part = { type: "input_text"; text: string } | { type: "input_image"; image_url: string };

function erroGateway(status: number, body: string): Error {
  console.error("Gateway IA", status, body.slice(0, 400));
  if (/moderation|safety|refus|content_policy/i.test(body)) return new Error("moderacao");
  if (status === 402) return new Error("creditos");
  return new Error(`gateway ${status}`);
}

/** Chamada de texto (Responses, em streaming) com saída JSON estrita. Devolve objeto e custo em USD. */
async function responsesJson<T>(apiKey: string, content: Part[], schemaName: string, schema: object): Promise<{ data: T; usd: number }> {
  const res = await fetch(`${BASE}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({ model: TEXT_MODEL, stream: true, store: false, reasoning: { effort: "low" }, input: [{ role: "user", content }], text: { format: { type: "json_schema", name: schemaName, strict: true, schema } } }),
  });
  if (!res.ok || !res.body) throw erroGateway(res.status, await res.text());
  const reader = res.body.getReader(); const dec = new TextDecoder();
  let buf = "", out = "", usd = 0, refused = false;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    buf += dec.decode(value, { stream: true });
    let i; while ((i = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, i); buf = buf.slice(i + 2);
      const line = frame.split("\n").find(l => l.startsWith("data:")); if (!line) continue;
      const raw = line.slice(5).trim(); if (!raw || raw === "[DONE]") continue;
      try {
        const ev = JSON.parse(raw) as { type?: string; delta?: string; response?: { usage?: { input_tokens?: number; output_tokens?: number } } };
        if (ev.type === "response.output_text.delta" && ev.delta) out += ev.delta;
        else if (ev.type === "response.refusal.delta") refused = true;
        else if (ev.type === "response.completed" || ev.type === "response.incomplete") { const u = ev.response?.usage; usd = (u?.input_tokens ?? 0) * USD_IN + (u?.output_tokens ?? 0) * USD_OUT; }
        else if (ev.type === "error" || ev.type === "response.failed") throw new Error("gateway texto");
      } catch (e) { if (e instanceof Error && e.message === "gateway texto") throw e; }
    }
  }
  if (refused || !out) throw new Error("moderacao");
  return { data: JSON.parse(out) as T, usd };
}

const CONCEITO_SCHEMA = { type: "object", additionalProperties: false, required: ["conceitos"], properties: { conceitos: { type: "array", items: { type: "object", additionalProperties: false, required: ["nome_curto", "tipo", "ideia", "prompt_imagem"], properties: { nome_curto: { type: "string" }, tipo: { type: "string" }, ideia: { type: "string" }, prompt_imagem: { type: "string" } } } } } };

export async function diretorConceitos(apiKey: string, prompt: string) {
  const r = await responsesJson<{ conceitos: Conceito[] }>(apiKey, [{ type: "input_text", text: prompt }], "conceitos", CONCEITO_SCHEMA);
  return { conceitos: r.data.conceitos ?? [], usd: r.usd };
}

/** O diretor olha as imagens e devolve os índices aprovados. */
export async function checarImagens(apiKey: string, urls: string[], tipo: "logo" | "banner", comTexto: boolean) {
  const text = `You are reviewing ${urls.length} ${tipo} options for a small store, numbered from 0 in the order shown. Reject an option if it has garbled or fake text${comTexto ? " (other than the store name spelled correctly)" : " or any text at all"}, contains shopping carts, generic shopping bags, light bulbs, gears, globes, rockets, handshakes, growth arrows, generic purple/blue gradients, neon/glow, third-party logos or real people, ${tipo === "logo" ? "is not legible at 32px, " : ""}or is nearly identical to an earlier approved option. Return the approved indices.`;
  const schema = { type: "object", additionalProperties: false, required: ["aprovadas"], properties: { aprovadas: { type: "array", items: { type: "integer" } } } };
  const r = await responsesJson<{ aprovadas: number[] }>(apiKey, [{ type: "input_text", text }, ...urls.map(u => ({ type: "input_image" as const, image_url: u }))], "checagem", schema);
  return { aprovadas: [...new Set(r.data.aprovadas ?? [])].filter(i => i >= 0 && i < urls.length), usd: r.usd };
}

async function lerImagem(res: Response): Promise<Uint8Array> {
  if (!res.ok) throw erroGateway(res.status, await res.text());
  const json = await res.json() as { data?: { b64_json?: string }[] };
  const b64 = json.data?.[0]?.b64_json; if (!b64) throw new Error("sem imagem");
  const bin = atob(b64); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u;
}

export type ImgOpts = { model: string; tipo: "logo" | "banner"; size: string; quality: "medium" | "high" };

export async function gerarImagem(apiKey: string, o: ImgOpts, prompt: string) {
  return lerImagem(await fetch(`${BASE}/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({ model: o.model, prompt, n: 1, size: o.size, quality: o.quality, background: o.tipo === "logo" ? "transparent" : "opaque", output_format: o.tipo === "logo" ? "png" : "webp" }),
  }));
}

/** Edição de imagem com referências (fotos dos produtos ou a opção escolhida). */
export async function editarImagem(apiKey: string, o: ImgOpts, prompt: string, refs: Blob[]) {
  const form = new FormData();
  form.set("model", o.model); form.set("prompt", prompt); form.set("size", o.size); form.set("quality", o.quality);
  form.set("background", o.tipo === "logo" ? "transparent" : "opaque"); form.set("output_format", o.tipo === "logo" ? "png" : "webp");
  refs.forEach((b, i) => form.append("image[]", new File([b], `ref-${i}.${b.type.includes("webp") ? "webp" : b.type.includes("jpeg") ? "jpg" : "png"}`, { type: b.type || "image/png" })));
  return lerImagem(await fetch(`${BASE}/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" }, body: form }));
}

/** Baixa imagens de referência (até 4) ignorando as que falham. */
export async function baixarRefs(urls: string[], max = 4): Promise<Blob[]> {
  const rs = await Promise.allSettled(urls.slice(0, max).map(async u => { const r = await fetch(u); if (!r.ok) throw new Error("ref"); const b = await r.blob(); if (!/^image\/(png|jpe?g|webp)/.test(b.type) || b.size > 8e6) throw new Error("tipo"); return b; }));
  return rs.flatMap(r => r.status === "fulfilled" ? [r.value] : []);
}
