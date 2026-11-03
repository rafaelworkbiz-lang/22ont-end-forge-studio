import { useEffect, useState } from "react";
import { Copy, ExternalLink, RefreshCw, MessageCircle, Facebook, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { MeliProduct } from "@/lib/meli.functions";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
type Channel = "whatsapp" | "facebook";
type FbScript = { title: string; body: string; tags: string };

export function whatsappScripts(p: MeliProduct, link: string): string[] {
  const price = brl(p.price);
  const ship = p.freeShipping ? "\n🚚 Frete GRÁTIS" : "";
  return [
    `🔥 *ACHADINHO DO DIA* 🔥\n\n🛍️ *${p.title}*\n\n💰 Por apenas *${price}*${ship}\n\n👉 Compre aqui: ${link}\n\n⚡ Corre que o preço pode mudar!`,
    `🚨 *OFERTA RELÂMPAGO* 🚨\n\n${p.title}\n\n✅ Preço: *${price}*${ship}\n✅ Vendido no Mercado Livre\n\n🛒 ${link}`,
    `😱 Olha esse preço, gente!\n\n*${p.title}*\n💸 ${price}${ship}\n\nLink 👇\n${link}\n\n📲 Manda pra quem tá precisando!`,
    `💎 *Achado imperdível*\n\n📦 ${p.title}\n🏷️ ${price}${ship}\n🔒 Compra segura pelo Mercado Livre\n\n➡️ ${link}`,
  ];
}

function facebookScripts(p: MeliProduct, link: string): FbScript[] {
  const price = brl(p.price);
  const ship = p.freeShipping ? "🚚 Frete grátis\n" : "";
  return [
    { title: "🔥 ACHADO IMPERDÍVEL NO MERCADO LIVRE 🔥", body: `🛍️ ${p.title}\n\n💰 Apenas ${price}\n${ship}🔒 Compra 100% segura pelo Mercado Livre\n\n👉 Garanta o seu: ${link}\n\n💬 Comenta "EU QUERO" que eu te ajudo!`, tags: "#achadinhos #ofertas #mercadolivre" },
    { title: "🚨 PROMOÇÃO DO DIA 🚨", body: `${p.title}\n\n✨ Por que vale a pena:\n✅ Preço: ${price}\n${ship}✅ Entrega pelo Mercado Livre\n✅ Garantia e devolução fácil\n\n🛒 Link da oferta: ${link}`, tags: "#promoção #desconto #achados" },
    { title: "😍 Gente, olha o que eu achei!", body: `📦 ${p.title}\nsaindo por ${price} 😱\n${ship}\nCorre antes que acabe 👇\n${link}\n\n👥 Marca aquele amigo que precisa ver isso!`, tags: "#achadinhos #oferta #mercadolivre" },
    { title: "💎 DICA DE COMPRA 💎", body: `🏷️ ${p.title}\n💸 ${price}\n${ship}\n👉 ${link}\n\n⏰ Oferta por tempo limitado`, tags: "#ofertasdodia #mercadolivre" },
  ];
}

export function ProductScriptDialog({ product, link, onClose }: { product: MeliProduct | null; link: string; onClose: () => void }) {
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [index, setIndex] = useState(0);
  useEffect(() => { setIndex(0); }, [product?.id, channel]);
  if (!product) return null;
  const wa = whatsappScripts(product, link);
  const fb = facebookScripts(product, link);
  const total = channel === "whatsapp" ? wa.length : fb.length;
  const i = index % total;
  const fbCur = fb[i];
  if (!fbCur) return null;
  const text = channel === "whatsapp" ? wa[i] ?? '' : `${fbCur.title}\n\n${fbCur.body}\n\n${fbCur.tags}`;
  const copy = async (value: string, msg: string) => { try { await navigator.clipboard.writeText(value); } catch { /* unavailable */ } toast.success(msg); };

  return <Dialog open onOpenChange={o => !o && onClose()}>
    <DialogContent className="script-dialog">
      <DialogHeader className="sr-only"><DialogTitle>{product.title}</DialogTitle><DialogDescription>Script de divulgação do produto</DialogDescription></DialogHeader>
      <div className="script-product">
        <div className="script-photo">{product.thumbnail && <img src={product.thumbnail} alt={product.title} />}</div>
        <div><h3>{product.title}</h3><strong>{brl(product.price)}</strong>{product.freeShipping && <span className="script-ship"><Truck />Frete grátis</span>}</div>
      </div>
      <div className="script-actions">
        <Button onClick={() => copy(link, "Link copiado")}><Copy />Copiar link</Button>
        <Button variant="outline" asChild><a href={link} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir no ML</a></Button>
      </div>
      <div className="script-box">
        <div className="script-head"><span>Script de divulgação</span>
          <div className="script-tabs" role="tablist">
            <button role="tab" aria-selected={channel === "whatsapp"} className={channel === "whatsapp" ? "on" : ""} onClick={() => setChannel("whatsapp")}><MessageCircle />WhatsApp</button>
            <button role="tab" aria-selected={channel === "facebook"} className={channel === "facebook" ? "on" : ""} onClick={() => setChannel("facebook")}><Facebook />Facebook</button>
          </div>
        </div>
        {channel === "whatsapp" ? <pre className="script-text">{text}</pre> : <div className="script-parts">
          {([["Título da postagem", fbCur.title, "Título copiado"], ["Descrição", fbCur.body, "Descrição copiada"], ["Hashtags", fbCur.tags, "Hashtags copiadas"]] as const).map(([label, value, msg]) =>
            <div className="script-part" key={label}>
              <div className="script-part-head"><span>{label}</span><button type="button" onClick={() => copy(value, msg)} aria-label={`Copiar ${label}`}><Copy />Copiar</button></div>
              <pre className="script-text">{value}</pre>
            </div>)}
        </div>}
        <div className="script-foot">
          <small>Modelo {i + 1} de {total}</small>
          <div><Button size="sm" variant="outline" onClick={() => setIndex(n => n + 1)}><RefreshCw />Trocar script</Button>
            <Button size="sm" onClick={() => copy(text, "Script copiado")}><Copy />Copiar script</Button></div>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
