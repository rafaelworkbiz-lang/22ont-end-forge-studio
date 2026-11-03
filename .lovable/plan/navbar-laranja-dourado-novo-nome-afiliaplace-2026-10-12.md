# Navbar laranja dourado + novo nome AfiliaPlace

## O que muda

1. **Barra superior (painel do afiliado) fica laranja dourado** — no tema claro, a barra inteira (onde estão o bloco da marca, os ícones de ocultar/recolher e o da conta) ganha fundo laranja dourado, com texto e ícones em tom escuro para contraste. No tema escuro a barra continua como está hoje (fundo escuro), apenas com o nome novo.

2. **Nome novo: AfiliaPlace (sem o S)** — em todas as telas:
   - Painel do afiliado: `Afilia` em preto + `Place` em laranja dourado.
   - Admin, Docs e tela de acesso: mesmo tratamento (`Afilia` escuro + `Place` laranja dourado; nos temas claros o preto fica mais escuro-grafite para legibilidade).
   - Títulos das páginas (aba do navegador, compartilhamento) passam a usar "AfiliaPlace".
   - A logo do Canarinho continua igual, ao lado do nome.

3. **Bloco da marca (logo + nome) deixa de ser cinza** — ganha um laranja dourado bem suave (versão fraca da cor, em tom translúcido), para o nome "AfiliaPlace" se destacar dentro dele.

4. **Efeito de motion leve na barra (in-out)**:
   - Ao carregar a página, a barra entra com um fade + leve deslize de cima para baixo (~0,5s, suave).
   - Os botões/ícones da barra têm transição in-out suave no passar do mouse (leve elevação e realce dourado), sem exagero.

## Arquivos tocados

- `src/styles.css` — novos tokens (laranja da barra, laranja suave do bloco da marca), regras `.light-theme .app-header`, `.brand`, animações `@keyframes` do motion, transições de hover.
- `src/components/affiliate-dashboard.tsx` — texto da marca e `aria-label` para "AfiliaPlace".
- `src/routes/admin.tsx`, `src/routes/docs.tsx`, `src/components/auth-screen.tsx` — mesmo texto da marca.
- Metas (title/description) das rotas — "Afiliasplace" → "AfiliaPlace".
- Menções ao nome dentro do conteúdo do Docs, se houver.

## Memória

- `mem://design/brand-palette`: atualiza o nome oficial para **AfiliaPlace** (marca escrita "Afilia" + "Place" em destaque dourado) e registra que a barra do painel é laranja dourado no tema claro.

## Verificação

- Playwright: painel no tema claro (barra laranja, bloco da marca suave, animação de entrada), tema escuro (barra escura preservada), admin, docs e tela de acesso com o nome novo; mobile 390px sem quebra.
- Build OK e testes do projeto passando.
