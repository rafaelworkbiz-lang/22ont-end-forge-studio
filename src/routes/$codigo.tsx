import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { LandingPage } from "@/components/landing-page";
import { getPublicInfluencer } from "@/lib/influencer-public.functions";
import { CODIGOS_RESERVADOS } from "@/lib/influencer-rules";

const TITLE = "AfiliaPlace — Venda direto do seu fornecedor";
const DESC = "Produtos validados do Mercado Livre e da Shopee, loja pronta, grupos e scripts para divulgar.";

export const Route = createFileRoute("/$codigo")({
  loader: async ({ params }) => {
    const c = params.codigo.toLowerCase();
    if (CODIGOS_RESERVADOS.has(c) || !/^[a-z0-9-]{3,20}$/.test(c)) throw notFound();
    const inf = await getPublicInfluencer({ data: { codigo: c } });
    if (inf?.redirect) throw redirect({ to: "/$codigo", params: { codigo: inf.redirect }, statusCode: 301 });
    return { inf: inf?.mensal && inf.vitalicio ? inf : null };
  },
  head: () => ({ meta: [
    { title: TITLE }, { name: "description", content: DESC },
    { property: "og:title", content: TITLE }, { property: "og:description", content: DESC },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CodigoPage,
});

function CodigoPage() {
  const { inf } = Route.useLoaderData();
  useEffect(() => { if (inf?.codigo) document.cookie = `afp_ref=${inf.codigo}; Max-Age=${30 * 86400}; Path=/; SameSite=Lax`; }, [inf?.codigo]);
  return <LandingPage partner={inf ? { monthly: { price: "172,00", url: inf.mensal! }, lifetime: { price: "297,00", url: inf.vitalicio! } } : undefined} />;
}
