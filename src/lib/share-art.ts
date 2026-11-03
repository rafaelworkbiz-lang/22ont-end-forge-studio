// Arte de divulgação desenhada no navegador (sem IA): banner/logo/cor da loja + nome e frase em texto.
export type ArtInput = { nome: string; frase: string; cor: string; bannerUrl: string | null; logoUrl: string | null };

function loadImage(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise(res => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}
const darkText = (hex: string) => { const n = parseInt(hex.replace("#", ""), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 > 150; };

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/); const lines: string[] = []; let cur = "";
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (ctx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines.slice(0, 3);
}

export async function renderArt(a: ArtInput, w: number, h: number): Promise<string> {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d"); if (!ctx) return "";
  const [banner, logo] = await Promise.all([loadImage(a.bannerUrl), loadImage(a.logoUrl)]);
  ctx.fillStyle = a.cor; ctx.fillRect(0, 0, w, h);
  const bannerH = Math.round(h * (h > w ? 0.55 : 0.5));
  if (banner) { try { cover(ctx, banner, 0, 0, w, bannerH); } catch { /* imagem bloqueada */ } }
  const ink = darkText(a.cor) ? "#16140F" : "#FFFFFF";
  // Painel inferior com texto
  ctx.fillStyle = a.cor; ctx.fillRect(0, bannerH, w, h - bannerH);
  const pad = 80; let y = bannerH + 90;
  if (logo) { const s = 150; ctx.save(); ctx.beginPath(); ctx.arc(pad + s / 2, bannerH, s / 2 + 8, 0, Math.PI * 2); ctx.fillStyle = "#FFFFFF"; ctx.fill();
    ctx.beginPath(); ctx.arc(pad + s / 2, bannerH, s / 2, 0, Math.PI * 2); ctx.clip(); try { cover(ctx, logo, pad, bannerH - s / 2, s, s); } catch { /* */ } ctx.restore(); y += 50; }
  ctx.fillStyle = ink; ctx.textBaseline = "top";
  ctx.font = `800 ${Math.round(w * 0.085)}px "Plus Jakarta Sans", system-ui, sans-serif`;
  for (const l of wrap(ctx, a.nome, w - pad * 2)) { ctx.fillText(l, pad, y); y += Math.round(w * 0.1); }
  y += 10; ctx.font = `500 ${Math.round(w * 0.042)}px "Plus Jakarta Sans", system-ui, sans-serif`;
  for (const l of wrap(ctx, a.frase, w - pad * 2)) { ctx.fillText(l, pad, y); y += Math.round(w * 0.058); }
  ctx.font = `700 ${Math.round(w * 0.032)}px system-ui, sans-serif`; ctx.globalAlpha = 0.8;
  ctx.fillText("afiliaplace.site", pad, h - pad - 20); ctx.globalAlpha = 1;
  try { return c.toDataURL("image/png"); } catch {
    // Banner de outra origem sem permissão: refaz só com a cor.
    return renderArt({ ...a, bannerUrl: null, logoUrl: null }, w, h);
  }
}
