import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, BarChart3, Eye, MoreHorizontal, Plus, Store as StoreIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useJanela } from "@/components/janela";
import { TabHeader } from "@/components/tab-header";
import { WithTip } from "@/components/product-modal";
import { StoreLogo, bannerStyle } from "@/components/loja-publica";
import { useStores } from "@/components/stores-query";
import { createStore, deleteStore, duplicateStore, setStoreStatus, type Store } from "@/lib/stores.functions";
import { remainingText } from "@/lib/store-rules";
import { LAYOUTS as PRESETS } from "@/lib/store-theme";

const LIFETIME_URL = "https://checkout.applyfy.com.br/checkout/cmvv7iqfj04ga01n60jjth2ss?offer=ggo7ayu";
const STATUS = { rascunho: "Rascunho", publicada: "Publicada", pausada: "Pausada" } as const;

export function limitToast() {
  toast.error("Você usou todas as lojas do seu plano.", { action: { label: "Fazer upgrade", onClick: () => window.open(LIFETIME_URL, "_blank", "noopener") } });
}

export function useCreateStore() {
  const create = useServerFn(createStore); const navigate = useNavigate(); const qc = useQueryClient();
  return async () => {
    const r = await create({ data: {} }).catch(() => null);
    if (!r?.ok) { if (r?.limit) limitToast(); else toast.error(r?.error ?? "Não foi possível criar a loja."); return null; }
    await qc.invalidateQueries({ queryKey: ["stores"] });
    void navigate({ to: "/painel/lojas", search: { janela: "loja-editor", id: r.id, passo: "1" }, state: { __janela: true } as never });
    return r.id;
  };
}

export function StoresList() {
  const q = useStores(); const qc = useQueryClient();
  const create = useCreateStore(); const dup = useServerFn(duplicateStore); const status = useServerFn(setStoreStatus);
  const { abrir } = useJanela();
  const stores = q.data?.stores ?? []; const limite = q.data?.limite ?? 0; const left = Math.max(0, limite - stores.length);
  const refresh = () => qc.invalidateQueries({ queryKey: ["stores"] });
  const onCreate = () => { if (left <= 0) { limitToast(); return; } void create(); };
  return <div className="v2-page">
    <TabHeader tone="dark" icon={StoreIcon} badge="Minhas lojas" word="LOJAS" title="Suas lojas, do seu jeito" description="Monte vitrines com seus produtos e compartilhe um endereço só."
      summary={{ value: stores.filter(s => s.status === "publicada").length, label: "lojas publicadas" }}
      actions={<><Button variant="outline" className="st-white" onClick={onCreate}><Plus />Criar loja</Button>
        <WithTip tip="Disponível quando houver dados"><Button variant="outline" className="st-ghost" disabled>Comparar lojas</Button></WithTip></>}>
      <p className="lib-consulted">{q.data ? `${stores.length} de ${limite} lojas usadas` : "…"}</p>
    </TabHeader>
    {q.isLoading ? <div className="st-grid">{[0, 1, 2].map(i => <Skeleton key={i} className="st-card-skel" />)}</div>
    : <div className="st-grid">
      {stores.map(s => <StoreCard key={s.id} s={s}
        onDuplicate={async () => { const r = await dup({ data: { id: s.id } }).catch(() => null); if (r?.ok) { toast.success("Loja duplicada."); void refresh(); } else if (r && "limit" in r && r.limit) limitToast(); else toast.error(r?.error ?? "Não foi possível duplicar."); }}
        onStatus={async () => { const r = await status({ data: { id: s.id, status: s.status === "publicada" ? "pausada" : "publicada" } }).catch(() => null); if (r?.ok) void refresh(); else toast.error("Não foi possível alterar."); }}
        onDelete={() => abrir("excluir-loja", { loja: s.id })} />)}
      <button type="button" className="st-new" onClick={onCreate}><Plus aria-hidden="true" /><strong>Criar nova loja</strong><span>{remainingText(left, q.data?.plano ?? "")}</span></button>
    </div>}
  </div>;
}

function StoreCard({ s, onDuplicate, onStatus, onDelete }: { s: Store; onDuplicate: () => void; onStatus: () => void; onDelete: () => void }) {
  const b = bannerStyle({ bannerUrl: s.bannerUrl, bannerEstilo: s.bannerEstilo, cor: s.cor });
  const sups = [...new Set(s.produtos.map(p => p.fornecedor))];
  const supText = sups.length === 2 ? "ML + Shopee" : sups[0] === "shopee" ? "Shopee" : sups[0] === "ml" ? "ML" : null;
  const hidden = s.produtos.filter(p => p.oculto).length;
  return <article className="st-card">
    <div className="st-banner" style={{ background: b.bg, color: b.on }}>{b.image && <span className="loja-hero-shade" aria-hidden="true" />}<strong>{s.nome}</strong>{supText && <span className="st-sup">{supText}</span>}
      <span className="st-logo"><StoreLogo loja={{ nome: s.nome, logoUrl: s.logoUrl, logoEstilo: s.logoEstilo, cor: s.cor }} size={52} /></span></div>
    <div className="st-body">
      <div className="st-title"><div><h3>{s.nome}</h3><span className="st-slug">{s.slug ? `/${s.slug}` : "Sem endereço ainda"}</span></div>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Mais ações de ${s.nome}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">{s.status === "publicada" && <DropdownMenuItem asChild><Link to="/painel/divulgacao" search={{ aba: "mensagem", loja: s.id }}>Divulgar nos grupos</Link></DropdownMenuItem>}<DropdownMenuItem onSelect={onDuplicate}>Duplicar</DropdownMenuItem>
            <DropdownMenuItem disabled={s.status === "rascunho"} onSelect={onStatus}>{s.status === "pausada" ? "Reativar" : "Pausar"}</DropdownMenuItem>
            <DropdownMenuItem className="lib-danger" onSelect={onDelete}>Excluir</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
      <div className="st-badges"><span className={`st-status st-status-${s.status}`}>● {STATUS[s.status]}</span><span className="st-meta">{s.produtos.length} produto{s.produtos.length === 1 ? "" : "s"} · {PRESETS.find(p => p.id === s.preset)?.nome}</span></div>
      {hidden > 0 && <p className="st-alert"><AlertTriangle aria-hidden="true" />{hidden} produto{hidden > 1 ? "s ocultos" : " oculto"} na loja</p>}
      <div className="st-actions"><Button asChild className="lib-grow"><Link to="/painel/lojas" search={{ janela: "loja-editor", id: s.id }} state={{ __janela: true } as never}>Editar loja</Link></Button>
        <WithTip tip="Disponível quando a loja receber visitas"><Button variant="outline" size="icon" disabled aria-label="Métricas"><BarChart3 /></Button></WithTip>
        <Button variant="outline" size="icon" asChild aria-label="Ver prévia"><a href={`/loja/previa/${s.id}`} target="_blank" rel="noopener noreferrer"><Eye /></a></Button></div>
    </div>
  </article>;
}

export function DeleteStoreContent({ lojaId, fechar }: { lojaId: string; fechar: () => void }) {
  const q = useStores(); const qc = useQueryClient(); const store = q.data?.stores.find(x => x.id === lojaId) ?? null;
  const [name, setName] = useState(""); const [busy, setBusy] = useState(false);
  const del = useServerFn(deleteStore);
  if (!store) return <p>{q.isLoading ? "Carregando…" : "Loja não encontrada."}</p>;
  return <div className="st-del">
    <p>Excluir “{store.nome}”? A loja, a seleção de produtos e as imagens enviadas serão apagadas. Seus produtos continuam em Meus produtos. Para confirmar, digite o nome da loja.</p>
    <input className="st-input" value={name} onChange={e => setName(e.target.value)} aria-label="Nome da loja" placeholder={store.nome} />
    <div className="lib-add-actions"><Button variant="outline" onClick={fechar}>Cancelar</Button>
      <Button variant="destructive" disabled={busy || name.trim() !== store.nome.trim()} onClick={async () => {
        setBusy(true); const r = await del({ data: { id: store.id, confirmName: name } }).catch(() => null); setBusy(false);
        if (r?.ok) { toast.success("Loja excluída."); fechar(); void qc.invalidateQueries({ queryKey: ["stores"] }); } else toast.error(r?.error ?? "Não foi possível excluir.");
      }}>{busy ? "Excluindo…" : "Excluir loja"}</Button></div>
  </div>;
}
