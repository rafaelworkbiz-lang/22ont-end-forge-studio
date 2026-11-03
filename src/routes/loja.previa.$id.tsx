import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAccount } from "@/components/auth-provider";
import { LojaPublica } from "@/components/loja-publica";
import { getStore } from "@/lib/stores.functions";

export const Route = createFileRoute("/loja/previa/$id")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Prévia da loja · AfiliaPlace" }, { name: "description", content: "Prévia privada da sua loja afiliada." },
    { name: "robots", content: "noindex, nofollow" }, { property: "og:title", content: "Prévia da loja · AfiliaPlace" },
    { property: "og:description", content: "Prévia privada da sua loja afiliada." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Preview,
});

function Preview() {
  const { id } = Route.useParams();
  const { user, ready } = useAccount(); const navigate = useNavigate();
  const fetchStore = useServerFn(getStore);
  const q = useQuery({ queryKey: ["store-preview", id], queryFn: () => fetchStore({ data: { id } }), enabled: !!user });
  useEffect(() => { if (ready && !user) void navigate({ to: "/auth", replace: true }); }, [ready, user, navigate]);
  if (!ready || !user || q.isLoading) return <div className="view-loading" role="status">Carregando...</div>;
  const s = q.data?.store;
  if (!s) return <div className="loja-missing"><h1>Prévia indisponível</h1><p>Esta loja não existe ou não pertence à sua conta.</p><Link to="/painel/lojas">Minhas lojas</Link></div>;
  const itens = s.produtos.filter(p => !p.oculto).map(p => ({ meuProdutoId: p.meuProdutoId, fornecedor: p.fornecedor, titulo: p.titulo, imagem: p.imagem, preco: p.preco, categoria: p.categoria }));
  return <div className="loja-page"><div className="loja-preview-bar" role="note">Prévia — só você vê esta página</div>
    <LojaPublica loja={{ id: s.id, nome: s.nome, nicho: s.nicho, logoUrl: s.logoUrl, logoEstilo: s.logoEstilo, bannerUrl: s.bannerUrl, bannerEstilo: s.bannerEstilo, cor: s.cor, preset: s.preset, aparencia: { ...s.aparencia, banners: s.bannersUrls } }} itens={itens} consultadoEm={q.data!.consultadoEm} hrefFor={i => `/r/${s.id}/${i.meuProdutoId}?c=previa`} /></div>;
}
