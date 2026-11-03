import { Copy, PartyPopper, Share2, ShoppingCart, BadgePercent, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export function InfluencerWelcome({ codigo, nome, onDone }: { codigo: string; nome: string; onDone: () => void }) {
  const url = `https://afiliaplace.site/${codigo}`;
  return <div className="onb v2-app">
    <Toaster />
    <header className="onb-top"><div className="auth-gate-wordmark">Afilia<span>Place</span></div></header>
    <main className="onb-main">
      <section className="onb-card onb-welcome">
        <span className="onb-wait-ic"><PartyPopper /></span>
        <h1>Bem-vindo(a){nome ? `, ${nome}` : ""}! Sua conta foi aprovada.</h1>
        <p>Este é o link da sua página de vendas. Compartilhe à vontade:</p>
        <div className="onb-copy"><code>{url}</code><Button className="um-primary" onClick={() => { void navigator.clipboard.writeText(url); toast.success("Link copiado!"); }}><Copy /> Copiar link</Button></div>
        <small>Você encontra esse link sempre em <b>Configurações › Links e convites</b>.</small>
        <Button className="um-primary onb-aff-next" onClick={onDone}>Ir para o meu painel <ArrowRight /></Button>
      </section>
      <section className="cv-how">
        <h2>Como você ganha</h2>
        <div className="cv-cards">
          <article><Share2 /><h3>Compartilhe seu link</h3><p>Divulgue sua página nas redes sociais, grupos e WhatsApp.</p></article>
          <article><ShoppingCart /><h3>A pessoa compra pela sua página</h3><p>Ela escolhe o plano Mensal ou o Vitalício e a venda fica registrada no seu link.</p></article>
          <article><BadgePercent /><h3>Você ganha comissão</h3><p>Comissão inicial de 50% em cada venda, paga pela Applyfy.</p></article>
        </div>
      </section>
    </main>
  </div>;
}
