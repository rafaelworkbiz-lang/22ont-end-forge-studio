import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [
    { title: "Termos de uso — AfiliaPlace" },
    { name: "description", content: "Termos de uso da plataforma AfiliaPlace (texto em revisão)." },
    { property: "og:title", content: "Termos de uso — AfiliaPlace" },
    { property: "og:description", content: "Termos de uso da plataforma AfiliaPlace." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => (
    <main className="lp2 lp2-doc">
      <Link to="/">← Voltar</Link>
      <h1>Termos de uso</h1>
      <p className="lp2-badge">Texto em revisão</p>
      <p>Este é um texto provisório. A versão definitiva dos Termos de uso do AfiliaPlace está em revisão e será publicada aqui.</p>
      <p>O AfiliaPlace é uma ferramenta para afiliados montarem lojas e divulgarem produtos. Comissões são definidas e pagas pelo Mercado Livre e pela Shopee; o AfiliaPlace não promete ganhos.</p>
    </main>
  ),
});
