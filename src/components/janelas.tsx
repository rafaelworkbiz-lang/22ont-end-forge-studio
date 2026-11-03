import { StoreEditor } from "@/components/store-editor";
import { StorePublish } from "@/components/store-publish";
import { CouponsContent } from "@/components/coupons-dialog";
import type { JanelaProps } from "@/components/janela";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLibraryItem } from "@/lib/library.functions";
import { parseProductKey, productKey } from "@/lib/library-rules";
import { DeleteStoreContent } from "@/components/stores-list";
import { ChooseStoreContent } from "@/components/my-products";
import { AddContent, useMyProducts } from "@/components/library-shared";

const Missing = () => <div className="v2-empty"><p>Não encontramos o que você queria abrir.</p></div>;
export function LojaEditorJanela({ params }: JanelaProps) {
  return params["id"] ? <StoreEditor key={params["id"]} id={params["id"]} passo={params["passo"] ? Number(params["passo"]) : undefined} /> : <Missing />;
}
export function PublicarJanela({ params }: JanelaProps) {
  return params["loja"] ? <StorePublish key={params["loja"]} lojaId={params["loja"]} /> : <Missing />;
}
export function CuponsJanela() { return <CouponsContent />; }

export function AdicionarProdutoJanela({ params, fechar }: JanelaProps) {
  const key = parseProductKey(`${params["f"] ?? ""}:${params["id"] ?? ""}`);
  const getItem = useServerFn(getLibraryItem); const mine = useMyProducts();
  const q = useQuery({ queryKey: ["library-item", key ? productKey(key.fornecedor, key.itemId) : null], queryFn: () => getItem({ data: key! }), enabled: !!key, staleTime: 5 * 60_000 });
  if (!key) return <Missing />;
  const item = q.data?.item;
  if (!item) return q.isLoading ? <div className="janela-load">Carregando produto…</div> : <Missing />;
  const saved = (mine.data?.items ?? []).some(m => m.fornecedor === item.fornecedor && m.itemId === item.itemId);
  return <AddContent product={item} saved={saved} fechar={fechar} />;
}
export function ComoValidamosJanela() {
  return <ul className="lib-how-list">
    <li>Anúncio ativo e produto novo.</li>
    <li>Mercado Livre: vendedor com reputação amarela ou melhor. Shopee: avaliação 4,5 ou mais.</li>
    <li>Entre os mais vendidos da categoria, pelo ranking oficial de cada fornecedor.</li>
    <li>Conferido todo dia às 06:00. Produto que sai do ar some da biblioteca.</li>
    <li>Comissão: a Shopee informa a taxa oficial; o Mercado Livre não informa por produto, então mostramos "consulte no ML".</li>
  </ul>;
}
export function EscolherLojaJanela({ params, fechar }: JanelaProps) { return params["id"] ? <ChooseStoreContent meuProdutoId={params["id"]} fechar={fechar} /> : <Missing />; }
export function ExcluirLojaJanela({ params, fechar }: JanelaProps) { return params["loja"] ? <DeleteStoreContent lojaId={params["loja"]} fechar={fechar} /> : <Missing />; }
