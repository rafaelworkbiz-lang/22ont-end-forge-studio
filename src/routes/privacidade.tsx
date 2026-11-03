import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [
    { title: "Privacidade — AfiliaPlace" },
    { name: "description", content: "Política de privacidade da AfiliaPlace (texto em revisão)." },
    { property: "og:title", content: "Privacidade — AfiliaPlace" },
    { property: "og:description", content: "Política de privacidade da AfiliaPlace." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <main className="lp2 lp2-doc">
      <Link to="/">← Voltar</Link>
      <h1>Privacidade</h1>
      <p className="lp2-badge">Texto em revisão</p>
      <p>Este é um texto provisório. A versão definitiva da Política de privacidade está em revisão e será publicada aqui.</p>
      <p>Usamos os dados informados no cadastro e no pagamento apenas para liberar e manter o seu acesso à plataforma.</p>
      <p>Se você começar uma compra ou cadastro e não concluir, ou se sua assinatura vencer, podemos entrar em contato pelo WhatsApp ou e-mail informados para ajudar a concluir. Você pode pedir a qualquer momento para não ser mais contatado. Dados de quem não concluiu a compra são apagados em até 90 dias.</p>
    </main>
  ),
});
