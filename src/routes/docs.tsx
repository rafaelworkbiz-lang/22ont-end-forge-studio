import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [
    { title: "Documentação da Plataforma | AfiliaPlace" },
    { name: "description", content: "Guia de referência AfiliaPlace: estrutura, páginas, componentes, design system e padrões." },
    { property: "og:title", content: "Documentação da Plataforma | AfiliaPlace" },
    { property: "og:description", content: "Estrutura, componentes, páginas e design system da plataforma AfiliaPlace." },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DocsPage,
});

const swatches = [
  { name: "Laranja dourado (primária)", var: "--saas-primary", use: "Botões principais, links, destaques, gráficos" },
  { name: "Dourado suave", var: "--saas-primary-soft", use: "Fundos de destaque, badges, hover" },
  { name: "Cinza clarinho (fundo)", var: "--saas-bg", use: "Fundo geral das páginas" },
  { name: "Branco (superfície)", var: "--saas-surface", use: "Cartões, tabelas, painéis" },
  { name: "Cinza borda", var: "--saas-line", use: "Bordas e divisórias" },
  { name: "Grafite (texto)", var: "--saas-ink", use: "Títulos e texto principal" },
];

const sections = [
  { id: "design", title: "Design system e temas" },
  { id: "estrutura", title: "Estrutura" },
  { id: "paginas", title: "Páginas" },
  { id: "componentes", title: "Componentes" },
  { id: "padroes", title: "Padrões" },
];

function DocsPage() {
  const [active, setActive] = useState("design");
  return (
    <div className="saas-theme docs-layout">
      <aside className="docs-side">
        <div className="saas-logo">Afilia<span>Place</span> <em>Docs</em></div>
        <nav>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={active === s.id ? "on" : ""} onClick={() => setActive(s.id)}>{s.title}</a>
          ))}
        </nav>
        <div className="docs-links"><Link to="/painel">Painel afiliado</Link><Link to="/admin">Painel admin</Link></div>
      </aside>
      <main className="docs-main">
        <p className="docs-kicker">Guia de referência · v1.0</p>
        <h1>Documentação da plataforma</h1>
        <p className="saas-sub">Referência oficial para manter a consistência de estrutura, visual e comportamento em todas as atualizações.</p>

        <section id="design" className="docs-block">
          <h2>Design system e temas</h2>
          <div className="docs-callout"><b>Diretriz oficial:</b> a identidade visual da plataforma é um blend de <b>laranja meio dourado</b> com um <b>cinza bem clarinho</b>, seguindo o padrão de softwares SaaS modernos: muito espaço em branco, cartões limpos, bordas sutis, cantos arredondados e acentos de cor usados com moderação.</div>
          <div className="docs-swatches">
            {swatches.map((s) => (
              <div key={s.var} className="saas-card docs-swatch">
                <div className="chip" style={{ background: `var(${s.var})` }} />
                <b>{s.name}</b><code>{s.var}</code><small>{s.use}</small>
              </div>
            ))}
          </div>
          <ul className="docs-list">
            <li><b>Tipografia:</b> sans-serif limpa; títulos em peso 600–700, texto em 400.</li>
            <li><b>Raios:</b> 10–14px em cartões, 8px em botões e campos.</li>
            <li><b>Sombras:</b> leves e difusas, nunca pesadas.</li>
            <li><b>Cores:</b> sempre via variáveis do tema, nunca valores fixos nos componentes.</li>
            <li><b>Temas:</b> o tema claro (laranja dourado + cinza claro) é o padrão da marca. O painel do afiliado também usa essa identidade: claro por padrão, com variação escura opcional (botão de tema) que mantém o dourado como cor de destaque.</li>
          </ul>
        </section>

        <section id="estrutura" className="docs-block">
          <h2>Estrutura</h2>
          <pre className="docs-code">{`src/
  routes/          páginas (uma por arquivo)
    index.tsx      painel do afiliado
    admin.tsx      painel admin
    docs.tsx       esta documentação
    auth.tsx       login e criar conta
    reset-password.tsx  recuperação de senha
  components/
    panel-shell.tsx
    divulgacao.tsx        grupos curados e mensagens
    ui/            componentes base (Button etc.)
  lib/
    whatsapp-groups-data.ts  convites, fontes e membros informados
  styles.css       tokens de cor e estilos globais`}</pre>
        </section>

        <section id="paginas" className="docs-block">
          <h2>Páginas</h2>
          <div className="docs-grid">
            <div className="saas-card"><b>/ — Painel do afiliado</b><p>Vendas e lucro em destaque, evolução central e produtos vendidos na lateral. Sem relatório oficial, os resultados ficam indisponíveis.</p></div>
            <div className="saas-card"><b>/admin — Painel admin</b><p>Cadastros reais e gestão de usuários e influenciadores, compartilhados com Gerenciar Usuários.</p></div>
            <div className="saas-card"><b>/docs — Documentação</b><p>Guia de estrutura, design system e padrões.</p></div>
            <div className="saas-card"><b>/auth — Acesso</b><p>Entrar e criar conta com e-mail e senha, com confirmação por e-mail. Sem dados de perfil adicionais.</p></div>
            <div className="saas-card"><b>/reset-password — Nova senha</b><p>Recuperação de senha por link de e-mail. Acesso não concede plano nem permissão administrativa.</p></div>
          </div>
        </section>

        <section id="componentes" className="docs-block">
          <h2>Componentes</h2>
          <ul className="docs-list">
            <li><b>Button</b> — botão compartilhado para todas as ações (variantes default, outline, ghost).</li>
            <li><b>Cartão de métrica</b> — rótulo, ícone e valor em destaque.</li>
            <li><b>Tabela</b> — linhas com nome + e-mail, valores e ações à direita.</li>
            <li><b>Pill de status</b> — ativo (verde), pendente (dourado), bloqueado (vermelho).</li>
            <li><b>Menu lateral</b> — navegação principal com item ativo destacado.</li>
            <li><b>Grupos WhatsApp</b> — convites públicos pesquisados, busca, nichos, ordenação, copiar convite, acessar grupo e adicionar por URL. Os grupos manuais duram esta sessão.</li>
          </ul>
        </section>

        <section id="padroes" className="docs-block">
          <h2>Padrões</h2>
          <ul className="docs-list">
            <li>Resultados financeiros reais não usam dados fictícios ou pedidos de vendedores como vendas de afiliados. Influenciadores têm uma demonstração identificada, com histórico de R$ 500 mil, até 100 unidades simuladas por dia e comissão ilustrativa configurável. Eventos persistentes e notificações de venda simulada ficam separados de relatórios reais e não geram saldo para saque. A conexão OAuth e a tag não comprovam atribuição real.</li>
            <li>Produtos: administrador acessa sem conexão pessoal; influenciadores navegam sem conexão, mas só geram links depois de conectar a própria conta do Mercado Livre e confirmar a tag; clientes precisam conectar sua própria conta para liberar o catálogo. Clientes veem apenas resultados confirmados ou “Dados indisponíveis”.</li>
            <li>Facebook: sem grupos sintéticos ou membros inventados; números cadastrados manualmente são identificados como informados pelo usuário.</li>
            <li>Idioma da interface: português (pt-BR); valores em Real (R$).</li>
            <li>Cada página tem título e descrição próprios.</li>
            <li>O acesso usa Lovable Cloud. A permissão administrativa fica separada em user_roles, com limite de um administrador. A gestão de membros valida autenticação e papel administrativo no servidor; novos cadastros não ganham esse papel.</li>
            <li>Layouts responsivos: grade de cartões vira coluna única no celular.</li>
            <li>Novas cores entram primeiro como variável no tema e depois são usadas.</li>
            <li>WhatsApp: não inventar grupos ou membros; manter a fonte de cada convite. Contagens são informadas pela fonte, não representam pessoas únicas e não são atualizadas em tempo real. Divulgação depende das regras do grupo; não há envio automático.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
