# PATCH-004 · Fase 3 — Produtos validados v2 + Meus produtos

Mantém o visual das Fases 1 e 2, o painel do produto (link, mensagem, grupos, "Publicar no perfil ML"), pagamentos e admin. Sem lojas nesta fase.

## Limitações honestas (já decididas por regras anteriores)
- **Comissão do Mercado Livre:** a API não informa comissão por produto, e a regra do projeto proíbe estimar por categoria. Cards ML mostram "Comissão: consulte no ML" (sem número); ordenação "Maior comissão" usa só produtos Shopee (que trazem a taxa oficial) e coloca ML depois.
- **Vendidos do ML:** o ranking oficial não traz quantidade. Card ML mostra "#N mais vendido em {categoria}"; Shopee mostra "+X vendidos" da própria Shopee.
- **Shopee da plataforma:** sem `SHOPEE_PLATFORM_APP_ID`/`SHOPEE_PLATFORM_SECRET` a rotina pula a Shopee e mostra o aviso no admin. Peço esses dois valores no fim, num formulário seguro (opcional).

## 1. Biblioteca compartilhada
- Tabela `produtos_cache` com os campos pedidos + `posicao_ranking`, `link_origem`, `consultado_em`. Único (fornecedor, item_id). Leitura só para quem tem acesso ativo (assinante, influenciador ou admin) via função `tem_acesso_ativo()`; escrita só pelo servidor.
- Tabela `produtos_atualizacoes` (início, fim, contagens, avisos) para "última atualização" e o aviso do admin.
- Rotina `refreshProductLibrary` no servidor:
  - ML: ranking oficial de mais vendidos por categoria (mesma busca de hoje), com reputação do vendedor e condição; validado = ativo + novo + reputação 3_yellow ou melhor + no ranking.
  - Shopee: `productOfferV2` por palavra-chave da categoria, 50 por página; validado = avaliação ≥ 4,5 e entre os mais vendidos.
  - Itens que sumiram → `fora_do_ar`. Processada em lotes por categoria para caber no tempo do servidor.
- Agendamento diário 06:00 (horário de Brasília) por uma rota protegida chamada pelo agendador da plataforma; botão "Atualizar agora" na aba de produtos do /admin com o aviso da Shopee.

## 2. Aba Produtos validados (/painel/produtos)
- Cabeçalho amarelo, linha de números, painel de filtros (busca no servidor com 300ms, Todos/ML/Shopee, categoria, ordenação, carrossel de categorias com setas, frase + "Como validamos").
- Grade 4 colunas (2 no celular), 24 por página, "Carregar mais", skeleton.
- Card conforme pedido; sem fornecedor conectado: selo "Conecte o ML/a Shopee" e botão leva a Fornecedores.

## 3. Pop-up "Ver produto"
- 860px, galeria + 4 miniaturas, selos, preço com data da consulta, 4 blocos, adicionar, "Abrir área de divulgação" (abre o painel atual do produto para itens ML; para Shopee abre só link/mensagem até a Fase 4), "Abrir no {fornecedor} ↗". URL `?produto=ml:MLB...`. Foco preso e devolvido.

## 4. Pop-up "Adicionar"
- 480px com cabeçalho amarelo, rádio "Só Meus produtos" + linha desativada "Crie sua primeira loja em Minhas lojas"; estado "Já está" com "Remover"; aviso flutuante com "Ver Meus produtos".

## 5. Meus produtos (/painel/meus-produtos)
- Tabela `meus_produtos` com RLS por dono.
- Status calculado (Ativo / Preço caiu / Saiu do ar), cabeçalho, números, busca + pílulas, cards 4 colunas, menu ⋯, "Adicionar à loja" desativado com dica.
- Copiar link: gerado no servidor se vazio (ML com tag confirmada; Shopee com `generateShortLink` do usuário) e salvo.
- Seleção em lote com barra flutuante (Copiar links, Remover com Desfazer 5s).
- Contador real no menu lateral.

## Regras de UI
Overlays fixed z-50 com fundo sólido, uma ação amarela por card, tabular-nums e R$, animações ≤200ms com reduced-motion, aria-label em ícones, alvos ≥44px no celular.

## Testes (conta de teste)
1–8 conforme o pedido. Shopee sem credenciais reais: link curto testado com resposta simulada e informado. Para o link ML com tag, a conta de teste precisa estar conectada ao ML; se não estiver, relato como pendente.

## Detalhes técnicos
- Novos arquivos: `src/lib/library.functions.ts` (listar, detalhe, admin refresh), `src/lib/library-refresh.server.ts`, `src/lib/my-products.functions.ts`, `src/components/library/*` (card, filtros, pop-ups), `src/routes/api/public/jobs/refresh-library.ts` com `authenticateCronRequest`.
- Reaproveita `getToken`/highlights/reputação do ML e `shopeeGraphql` da Fase 2 (refatorados para módulos `.server.ts` compartilhados sem mudar comportamento).
- `products-catalog.tsx` é substituído pela nova biblioteca; o `ProductWorkspace` existente continua sendo aberto pelo botão de divulgação.
