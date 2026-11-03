import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FAQ, LandingPage, type PartnerCheckout } from "@/components/landing-page";
import { getPublicInfluencer } from "@/lib/influencer-public.functions";

const TITLE = "AfiliaPlace — Venda como afiliado do Mercado Livre e da Shopee";
const DESC = "Escolha produtos validados, crie sua loja com logo e banner feitos por IA e divulgue no WhatsApp e Facebook. Mercado Livre e Shopee.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://afiliaplace.site/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://afiliaplace.site/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }),
    }],
  }),
  component: HomePage,
});

// Visitante que chegou pelo código de um influenciador (cookie de 30 dias) continua com os links dele.
function HomePage() {
  const [partner, setPartner] = useState<PartnerCheckout>();
  useEffect(() => {
    const c = document.cookie.match(/(?:^|; )afp_ref=([a-z0-9-]{3,20})/)?.[1];
    if (c) void getPublicInfluencer({ data: { codigo: c } }).then((i) => { if (i?.mensal && i.vitalicio) setPartner({ monthly: { price: "172,00", url: i.mensal }, lifetime: { price: "297,00", url: i.vitalicio } }); }).catch(() => null);
  }, []);
  return <LandingPage partner={partner} />;
}
