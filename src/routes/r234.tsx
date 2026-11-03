import { createFileRoute } from "@tanstack/react-router";
import { LandingPage, type PartnerCheckout } from "@/components/landing-page";

const partner: PartnerCheckout = {
  monthly: { price: "172,00", url: "https://checkout.applyfy.com.br/checkout/cmvazulju1l5a01op1gq1613t?code=awby625&offer=yddhviy" },
  lifetime: { price: "297,00", url: "https://checkout.applyfy.com.br/checkout/cmvazv33u1ewp01pwrhc3oh7c?code=rllnply&offer=pjlaags" },
};

export const Route = createFileRoute("/r234")({
  head: () => ({ meta: [
    { title: "AfiliaPlace | Convite R234" },
    { name: "description", content: "Conheça a AfiliaPlace: produtos, links de afiliado, scripts e painel de comissões do Mercado Livre." },
    { property: "og:title", content: "AfiliaPlace | Convite R234" },
    { property: "og:description", content: "Tudo que o afiliado do Mercado Livre precisa em um só lugar." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <LandingPage partner={partner} />,
});
