import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/components/auth-provider";
import { useMeliConnection } from "@/components/integrations";
import { useShopeeStatus } from "@/components/suppliers";
import { ProductWorkspace, type TagStatus } from "@/components/product-workspace";
import { getPerfilState, saveAffiliateProfile } from "@/lib/perfil.functions";
import { getProgress } from "@/lib/workspace.functions";
import { isStepId, isValidTag, type StepId } from "@/lib/product-share";
import { addMyProduct, removeMyProducts, restoreMyProducts } from "@/lib/my-products.functions";
import { supplierLink, type LibraryItem } from "@/lib/library.functions";
import { SUPPLIER_NAME, commissionValue, type Supplier } from "@/lib/library-rules";
import { meliCategories } from "@/lib/meli-categories";
import type { MeliProduct } from "@/lib/meli.functions";

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtStamp = (iso: string | null | undefined) => iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", " ·") : "—";
export const catName = (id: string) => meliCategories.find(c => c.id === id)?.name ?? "Produtos";

export { useMyProducts } from "@/components/my-products-query";
import { useStores } from "@/components/stores-query";
import { useCreateStore } from "@/components/stores-list";

/** Quais fornecedores o usuário conectou (para gerar links próprios). */
export function useSupplierConnections() {
  const meli = useMeliConnection();
  const shopee = useShopeeStatus();
  return { ml: !!meli.data?.connected, shopee: !!shopee.data?.connected, loading: meli.isLoading || shopee.isLoading };
}

export function SupplierBadge({ f }: { f: Supplier }) {
  return <span className={`lib-sbadge lib-sbadge-${f}`}>{SUPPLIER_NAME[f]}</span>;
}

export function commissionText(p: LibraryItem) {
  const v = commissionValue(p.preco, p.comissao);
  if (v == null) return p.fornecedor === "ml" ? "Comissão: consulte no ML" : null;
  const pct = (p.comissao! > 1 ? p.comissao! : p.comissao! * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `Comissão estimada ${brl(v)} (${pct}%)`;
}
export function soldText(p: LibraryItem) {
  if (p.vendidos && p.vendidos > 0) return `+${p.vendidos.toLocaleString("pt-BR")} vendidos (estimado)`;
  if (p.posicao) return `#${p.posicao} mais vendido em ${catName(p.categoria)}`;
  return null;
}

/** Abre a janela já no clique (evita bloqueio de pop-up) e depois aponta para o link de afiliado. */
export function useOpenAtSupplier() {
  const getLink = useServerFn(supplierLink);
  return useCallback(async (p: { fornecedor: Supplier; itemId: string; link: string }) => {
    const w = window.open("about:blank", "_blank");
    const r = await getLink({ data: { fornecedor: p.fornecedor, itemId: p.itemId } }).catch(() => ({ url: null, affiliate: false }));
    const url = r.url ?? p.link;
    if (w) { w.opener = null; w.location.href = url; } else window.open(url, "_blank", "noopener,noreferrer");
    if (!r.affiliate) toast("Aberto sem a sua identificação de afiliado. Conecte o fornecedor e confirme sua tag para ganhar comissão.");
  }, [getLink]);
}

type Removed = { fornecedor: Supplier; itemId: string; preco: number; link: string | null; linkEm: string | null; em: string }[];
export function useMyProductActions() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const add = useServerFn(addMyProduct), remove = useServerFn(removeMyProducts), restore = useServerFn(restoreMyProducts);
  const refresh = () => qc.invalidateQueries({ queryKey: ["my-products"] });
  const addMut = useMutation({ mutationFn: (p: { fornecedor: Supplier; itemId: string; lojaId?: string | undefined }) => add({ data: p }), onSuccess: (r, v) => {
    void refresh(); if (v.lojaId) void qc.invalidateQueries({ queryKey: ["stores"] });
    if (r.ok && v.lojaId) toast.success("Produto adicionado à loja.", { action: { label: "Editar loja", onClick: () => void navigate({ to: "/painel/lojas", search: { janela: "loja-editor", id: v.lojaId! } }) } });
    else if (r.ok) toast.success("Produto adicionado a Meus produtos.", { action: { label: "Ver Meus produtos", onClick: () => void navigate({ to: "/painel/meus-produtos" }) } });
    else toast.error("Não foi possível adicionar.");
  } });
  const removeMany = useCallback(async (items: { fornecedor: Supplier; itemId: string }[]) => {
    // Some da tela na hora; volta se der erro.
    const prev = qc.getQueriesData({ queryKey: ["my-products"] });
    const keys = new Set(items.map(i => `${i.fornecedor}:${i.itemId}`));
    qc.setQueriesData<{ items: { fornecedor: string; itemId: string }[] }>({ queryKey: ["my-products"] }, d => d && { ...d, items: d.items.filter(m => !keys.has(`${m.fornecedor}:${m.itemId}`)) });
    const r = await remove({ data: { items } }).catch(() => null);
    if (!r?.ok) { prev.forEach(([k, d]) => qc.setQueryData(k, d)); await refresh(); toast.error("Não foi possível remover."); return; }
    await refresh();
    const rows: Removed = r.removed;
    toast(items.length > 1 ? `${items.length} produtos removidos.` : "Produto removido de Meus produtos.", { duration: 5000, action: rows.length ? { label: "Desfazer", onClick: () => void restore({ data: { rows } }).then(x => { void refresh(); if (x.ok) toast.success("Restaurado."); }) } : undefined });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remove, restore]);
  return { addMut, removeMany };
}

/** Conteúdo da janela "Adicionar" (?janela=adicionar-produto&f=&id=). */
export function AddContent({ product, saved, fechar, compact }: { product: LibraryItem; saved: boolean; fechar: () => void; compact?: boolean }) {
  const [done, setDone] = useState(false);
  const onOpenChange = (_v: boolean) => fechar();
  const { addMut, removeMany } = useMyProductActions();
  const [choice, setChoice] = useState("meus");
  const stores = useStores();
  const createStore = useCreateStore();
  return <div className={`lib-add${compact ? " is-compact" : ""}`}>
    {!compact && <div className="lib-add-head"><img src={product.imagens[0]} alt="" width={56} height={56} />
      <div><p className="lib-add-title">{product.titulo}</p><p>{brl(product.preco)} · {SUPPLIER_NAME[product.fornecedor]}</p></div></div>}
    {saved ? <div className="lib-add-body"><p className="lib-add-saved"><Check aria-hidden="true" />Já está em Meus produtos.</p>
      <div className="lib-add-actions"><Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        <Button variant="ghost" className="lib-danger" onClick={() => { void removeMany([{ fornecedor: product.fornecedor, itemId: product.itemId }]); onOpenChange(false); }}><Trash2 />Remover de Meus produtos</Button></div></div>
    : <div className="lib-add-body">
      <fieldset className="lib-radios"><legend>Onde adicionar</legend>
        <label className="lib-radio"><input type="radio" name="dest" checked={choice === "meus"} onChange={() => setChoice("meus")} /><span>Só Meus produtos</span></label>
        {(stores.data?.stores ?? []).map(s => <label key={s.id} className="lib-radio"><input type="radio" name="dest" checked={choice === s.id} onChange={() => setChoice(s.id)} /><span>Meus produtos + loja “{s.nome}”</span></label>)}
        {stores.data && !stores.data.stores.length && <label className="lib-radio is-disabled"><input type="radio" name="dest" disabled /><span>Crie sua primeira loja em <Link to="/painel/lojas">Minhas lojas</Link></span></label>}
        {stores.data && stores.data.stores.length > 0 && <button type="button" className="lib-link-btn" onClick={() => { onOpenChange(false); void createStore(); }}>+ Nova loja</button>}
      </fieldset>
      <div className="lib-add-actions"><Button variant="outline" onClick={() => onOpenChange(false)}>{compact ? "Voltar" : "Cancelar"}</Button>
        <Button className={done ? "lib-add-done" : undefined} disabled={addMut.isPending || done} onClick={() => addMut.mutate({ fornecedor: product.fornecedor, itemId: product.itemId, lojaId: choice === "meus" ? undefined : choice }, { onSuccess: () => { setDone(true); window.setTimeout(fechar, 700); } })}>{done ? <><Check />Adicionado</> : addMut.isPending ? "Adicionando…" : "Adicionar"}</Button></div>
    </div>}
  </div>;
}

/** Área de divulgação (workspace do PATCH-001.2) para um produto do Mercado Livre. */
export function WorkspaceHost({ id, step, product, onStep, onClose }: { id: string; step: string | undefined; product: LibraryItem | null; onStep: (s: StepId) => void; onClose: () => void }) {
  const { user } = useAccount();
  const conn = useMeliConnection();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchPerfil = useServerFn(getPerfilState), fetchProgress = useServerFn(getProgress), saveProfile = useServerFn(saveAffiliateProfile);
  const perfil = useQuery({ queryKey: ["perfil-state", user?.id], queryFn: () => fetchPerfil(), enabled: !!user, staleTime: 60_000 });
  const progress = useQuery({ queryKey: ["workspace-progress", user?.id], queryFn: () => fetchProgress(), enabled: !!user, staleTime: 60_000 });
  const confirm = useMutation({ mutationFn: () => saveProfile({ data: { confirmTag: true } }), onSuccess: r => { if (r.ok) { toast.success("Tag confirmada. Links liberados."); void qc.invalidateQueries({ queryKey: ["perfil-state"] }); } else toast.error("Não foi possível confirmar. Confira em Fornecedores."); } });
  if (!user || !conn.data) return null;
  const c = conn.data; const tag = c.tag;
  const personal = c.mode === "client" || c.mode === "demo";
  const canEarn = personal && c.connected && isValidTag(tag) && !!perfil.data?.tagConfirmed;
  const tagStatus: TagStatus = canEarn ? "ok" : personal && c.connected && perfil.isSuccess && isValidTag(tag) ? "pending" : tag && !isValidTag(tag) ? "invalid" : "none";
  const items: MeliProduct[] = product ? [{ id: product.itemId, title: product.titulo, price: product.preco, thumbnail: product.imagens[0] ?? "", permalink: product.link, freeShipping: product.freteGratis, sold: product.vendidos ?? 0, categoryId: product.categoria }] : [];
  return <ProductWorkspace items={items} id={id} step={isStepId(step) ? step : "visao"} tag={tag} canEarn={canEarn} tagStatus={tagStatus} confirming={confirm.isPending}
    published={new Set((perfil.data?.published ?? []).map(p => p.itemId))} profileUrl={perfil.data?.profileUrl ?? null} progress={progress.data} userId={user.id}
    onStep={onStep} onSelect={() => {}} onClose={onClose} onConfirmTag={() => confirm.mutate()} onOpenIntegrations={() => { onClose(); void navigate({ to: "/painel/fornecedores" }); }} />;
}

export function ExternalIcon() { return <ExternalLink aria-hidden="true" />; }
