// Pure helpers for the Shopee Affiliate Open API (no secrets stored here).
export const SHOPEE_ENDPOINT = "https://open-api.affiliate.shopee.com.br/graphql";

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
const enc = new TextEncoder();

export async function sha256Hex(s: string) {
  return hex(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}

/** Authorization header: SHA256(AppId + Timestamp + Payload + Secret). */
export async function shopeeAuthHeader(appId: string, secret: string, payload: string, ts = Math.floor(Date.now() / 1000)) {
  const sig = await sha256Hex(`${appId}${ts}${payload}${secret}`);
  return `SHA256 Credential=${appId}, Timestamp=${ts}, Signature=${sig}`;
}

export function maskAppId(id: string) {
  return id.length <= 6 ? "•".repeat(id.length) : `${id.slice(0, 4)}••••${id.slice(-2)}`;
}

export type ShopeeErrorKind = "credencial" | "permissao" | "limite" | "indisponivel" | "desconhecido";
export const SHOPEE_ERROR_TEXT: Record<ShopeeErrorKind, string> = {
  credencial: "App ID ou Secret inválidos. Copie os dois de novo no portal de afiliados da Shopee, em Open API, sem espaços.",
  permissao: "A Shopee não liberou a Open API para esse App ID. Confira se o App ID está certo e se sua conta foi aprovada no programa de afiliados (Open API) e tente de novo.",
  limite: "A Shopee limitou as consultas por alguns instantes. Aguarde um minuto e tente de novo.",
  indisponivel: "A Shopee não respondeu agora. Tente de novo em alguns minutos.",
  desconhecido: "A Shopee recusou a consulta. Confira as credenciais e tente de novo.",
};

/** Maps Shopee GraphQL error codes / HTTP status to a readable kind. */
export function classifyShopeeError(httpStatus: number, body: unknown): ShopeeErrorKind {
  const errs = (body as { errors?: { message?: string; extensions?: { code?: number } }[] } | null)?.errors;
  const code = errs?.[0]?.extensions?.code;
  const msg = (errs?.[0]?.message ?? "").toLowerCase();
  if (code === 10020 || /signature|credential|invalid app|auth/.test(msg)) return "credencial";
  if (code === 10030 || httpStatus === 429 || /rate|limit/.test(msg)) return "limite";
  if (code === 10031 || code === 10035 || httpStatus === 403 || /permission|access den/.test(msg)) return "permissao";
  if (httpStatus >= 500) return "indisponivel";
  if (httpStatus === 401) return "credencial";
  return "desconhecido";
}

async function aesKey(secret: string) {
  const raw = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}
const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function encryptSecret(plain: string, keyMaterial: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(keyMaterial), enc.encode(plain)));
  return `v1:${b64(iv)}:${b64(ct)}`;
}
export async function decryptSecret(stored: string, keyMaterial: string) {
  const [v, iv, ct] = stored.split(":");
  if (v !== "v1" || !iv || !ct) throw new Error("bad ciphertext");
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, await aesKey(keyMaterial), unb64(ct));
  return new TextDecoder().decode(pt);
}
