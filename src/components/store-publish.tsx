import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Check, Copy, Download, ExternalLink, Eye, Lock, Megaphone, Rocket, X } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { checkSlug, publishStore, removeAffectedProducts, storeChecklist } from "@/lib/store-publish.functions";
import { slugify, slugFormatProblem, SLUG_MAX, SLUG_MSG } from "@/lib/store-rules";

const BASE = "https://afiliaplace.site/loja/";

export function StorePublish({ lojaId }: { lojaId: string }) {
  const fetchCheck = useServerFn(storeChecklist); const check = useServerFn(checkSlug);
  const publish = useServerFn(publishStore); const removeAff = useServerFn(removeAffectedProducts);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["store-check", lojaId], queryFn: () => fetchCheck({ data: { lojaId } }) });
  const [slug, setSlug] = useState(""); const [touched, setTouched] = useState(false);
  const [st, setSt] = useState<{ ok: boolean; mensagem: string | null; sugestoes: string[] } | null>(null);
  const [busy, setBusy] = useState(false); const [published, setPublished] = useState<string | null>(null);
  const a = q.data;

  useEffect(() => { if (a && !touched) setSlug(a.loja.slug ?? slugify(a.loja.nome)); }, [a, touched]);
  useEffect(() => { if (a?.loja.status === "publicada" && a.loja.slug) setPublished(a.loja.slug); }, [a]);
  const local = slug ? slugFormatProblem(slug) : "curto";
  useEffect(() => {
    if (!a || a.loja.slugTravado || local) { setSt(null); return; }
    const t = window.setTimeout(() => { void check({ data: { lojaId, slug } }).then(setSt).catch(() => null); }, 350);
    return () => window.clearTimeout(t);
  }, [slug, local, a, lojaId, check]);

  if (q.isLoading) return <Skeleton className="st-card-skel" />;
  if (!a) return <div className="v2-card v2-empty"><p>Loja não encontrada.</p><Button asChild><Link to="/painel/lojas">Minhas lojas</Link></Button></div>;

  const locked = a.loja.slugTravado;
  const slugOk = locked || (!local && st?.ok === true);
  const msg = locked ? null : local ? SLUG_MSG[local] : st && !st.ok ? st.mensagem : null;

  async function doPublish() {
    setBusy(true);
    const r = await publish({ data: { lojaId, slug } }).catch(() => null);
    setBusy(false);
    if (!r?.ok) { toast.error(r?.error ?? "Não foi possível publicar."); void q.refetch(); return; }
    setPublished(r.slug); toast.success("Loja no ar!");
    void qc.invalidateQueries({ queryKey: ["stores"] }); void q.refetch();
  }
  async function removeAffected() {
    const r = await removeAff({ data: { lojaId, ids: a!.afetados } }).catch(() => null);
    if (r?.ok) { toast.success(`${r.removidos} produto(s) removido(s) da loja.`); void q.refetch(); } else toast.error("Não foi possível remover.");
  }

  return <div className="pub">
    <section className="v2-card pub-sec"><h2>Endereço da loja</h2>
      <label className="pub-slug"><span className="pub-base">afiliaplace.site/loja/</span>
        <input value={slug} disabled={locked} maxLength={SLUG_MAX} aria-invalid={!!msg} aria-describedby="pub-slug-msg" onChange={e => { setTouched(true); setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} />
        {locked ? <Lock aria-label="Endereço travado" /> : slugOk ? <Check className="pub-ok" aria-label="Disponível" /> : null}</label>
      <p id="pub-slug-msg" className={msg ? "pub-err" : "pub-hint"} role="status">{locked ? "O endereço fica travado depois da primeira publicação. O nome da loja pode mudar quando quiser." : msg ?? (slugOk ? "Endereço disponível." : "Conferindo…")}</p>
      {!locked && !!st?.sugestoes.length && <div className="pub-sug">Sugestões: {st.sugestoes.map(s => <button key={s} type="button" onClick={() => { setTouched(true); setSlug(s); }}>{s}</button>)}</div>}
    </section>

    <section className="v2-card pub-sec"><h2>Análise antes de publicar</h2>
      <ul className="pub-check">{a.items.map(i => <li key={i.id} className={`is-${i.ok ? "ok" : i.tipo}`}>
        {i.ok ? <Check aria-hidden="true" /> : i.tipo === "bloqueia" ? <X aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
        <span>{i.texto}</span>{!i.ok && <small>{i.tipo === "bloqueia" ? "Impede publicar" : "Aviso"}</small>}
        {i.id === "fornecedor" && !i.ok && <Button size="sm" variant="outline" onClick={removeAffected}>Remover produtos afetados</Button>}
        {i.id === "links" && !i.ok && <Button size="sm" variant="outline" asChild><Link to="/painel/fornecedores">Ir para Fornecedores</Link></Button>}
        {i.id === "produtos" && !i.ok && <Button size="sm" variant="outline" asChild><Link to="/painel/lojas" search={{ janela: "loja-editor", id: lojaId }}>Editar loja</Link></Button>}
      </li>)}</ul>
      <div className="pub-actions">
        <Button variant="outline" asChild><a href={`/loja/previa/${lojaId}`} target="_blank" rel="noopener noreferrer"><Eye />Ver prévia</a></Button>
        <Button onClick={doPublish} disabled={!a.podePublicar || !slugOk || busy}><Rocket />{busy ? "Publicando…" : a.loja.status === "publicada" ? "Atualizar publicação" : "Publicar loja"}</Button>
      </div>
    </section>

    {published && <PublishedCard slug={published} lojaId={lojaId} />}
  </div>;
}

function PublishedCard({ slug, lojaId }: { slug: string; lojaId: string }) {
  const url = BASE + slug;
  const [qr, setQr] = useState<string | null>(null);
  useEffect(() => { void QRCode.toDataURL(url, { width: 512, margin: 2, color: { dark: "#16140F", light: "#FFFFFF" } }).then(setQr); }, [url]);
  const copy = async () => { await navigator.clipboard.writeText(url).then(() => toast.success("Link copiado."), () => toast.error("Não foi possível copiar.")); };
  const share = async () => {
    if (navigator.share) { await navigator.share({ title: "Minha loja", url }).catch(() => null); return; }
    window.open(`https://wa.me/?text=${encodeURIComponent(`Confira meus achados: ${url}`)}`, "_blank", "noopener");
  };
  return <section className="v2-card pub-sec pub-done"><h2>Sua loja está no ar</h2>
    <div className="pub-done-row">
      <div className="pub-link"><code>{url.replace("https://", "")}</code>
        <div className="pub-actions">
          <Button onClick={copy}><Copy />Copiar</Button>
          <Button variant="outline" asChild><a href={`/loja/${slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink />Abrir</a></Button>
          <Button variant="outline" onClick={share}><Megaphone />Compartilhar</Button>
          <Button variant="outline" asChild><Link to="/painel/divulgacao" search={{ aba: "mensagem", loja: lojaId }}><Megaphone />Divulgar nos grupos</Link></Button>
        </div></div>
      {qr && <div className="pub-qr"><img src={qr} alt={`QR Code de ${url}`} width={140} height={140} />
        <Button size="sm" variant="outline" asChild><a href={qr} download={`loja-${slug}.png`}><Download />Baixar PNG</a></Button></div>}
    </div></section>;
}
