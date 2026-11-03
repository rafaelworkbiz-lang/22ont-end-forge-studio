import { createFileRoute, Link } from "@tanstack/react-router";
import { LojaPublica } from "@/components/loja-publica";
import { getPublicStore } from "@/lib/store-publish.functions";
import { nicheHeadline, type Preset } from "@/lib/store-rules";

export const Route = createFileRoute("/loja/$slug")({
  validateSearch: (s: Record<string, unknown>): { c?: "whatsapp" | "facebook" | undefined } => ({ c: s["c"] === "whatsapp" || s["c"] === "facebook" ? s["c"] : undefined }),
  loader: ({ params }) => getPublicStore({ data: { slug: params.slug } }),
  head: ({ loaderData: s, params }) => {
    const url = `https://afiliaplace.site/loja/${params.slug.toLowerCase()}`;
    if (!s) return { meta: [{ title: "Loja não encontrada · AfiliaPlace" }, { name: "robots", content: "noindex" }] };
    const title = `${s.nome} · Achados selecionados`;
    const desc = s.status === "pausada" ? `${s.nome} está temporariamente indisponível.` : `${nicheHeadline(s.nicho)}. ${s.produtos.length} achados selecionados por ${s.nome} no Mercado Livre e na Shopee.`;
    const img = s.bannerUrl;
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "website" }, { property: "og:url", content: url },
        { name: "twitter:card", content: img ? "summary_large_image" : "summary" },
        ...(img ? [{ property: "og:image", content: img }, { name: "twitter:image", content: img }] : []),
        ...(s.status === "pausada" ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => <div className="loja-page"><div className="loja-missing"><h1>Loja não encontrada</h1><p>Confira se o endereço foi digitado certinho.</p><Link to="/">Conhecer a AfiliaPlace</Link></div></div>,
  component: PublicStorePage,
});

function PublicStorePage() {
  const s = Route.useLoaderData();
  const { c } = Route.useSearch();
  if (s.status === "pausada") return <div className="loja-page"><div className="loja-missing"><h1>{s.nome}</h1><p>Esta loja está temporariamente indisponível.</p></div></div>;
  return <div className="loja-page">
    <LojaPublica loja={{ id: s.id, nome: s.nome, nicho: s.nicho, logoUrl: s.logoUrl, logoEstilo: s.logoEstilo, bannerUrl: s.bannerUrl, bannerEstilo: s.bannerEstilo, cor: s.cor, preset: s.preset as Preset, aparencia: s.aparencia }}
      itens={s.produtos.map(p => ({ meuProdutoId: p.id, fornecedor: p.fornecedor, titulo: p.titulo, imagem: p.imagem, preco: p.preco, categoria: p.categoria }))}
      consultadoEm={s.consultadoEm} hrefFor={i => `/r/${s.id}/${i.meuProdutoId}?c=${c ?? "loja"}`} />
  </div>;
}
