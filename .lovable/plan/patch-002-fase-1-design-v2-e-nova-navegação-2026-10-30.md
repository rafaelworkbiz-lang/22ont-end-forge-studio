# PATCH-002 · Fase 1 — Design v2 e nova navegação

Visual novo do painel inteiro e menu por endereços próprios. Regras de negócio, pagamentos, Mercado Livre, vendas automáticas e workspace do produto ficam como estão.

## Decisões importantes (confirme se discordar)
- **Tema escuro sai.** O pedido proíbe fundos pretos, então o painel passa a ser só claro e o botão de tema some. Isso substitui a regra antiga "tema preto fixo".
- **"is_influencer"** não existe como coluna: hoje o influenciador é marcado pelo papel "influenciador" já usado no admin. A regra dos cupons vai usar esse papel (mesma pessoa, mesma marcação).
- **Página pública, login, /admin e /ao-vivo-k7q9** mantêm o visual atual; só o /admin ganha a seção de cupons.
- Imagens do pacote (ícone, favicon, Mercado Livre, Shopee) vêm do zip enviado; as telas HTML do pacote servem de referência visual.

## O que muda
1. **Tokens**: cores, fontes (Bricolage Grotesque / Plus Jakarta Sans), cantos, sombras, botões em pílula, escala de camadas e animações ≤200ms conforme o patch.
2. **Casca**: fundo externo, menu lateral branco (250px, recolhível) e área de trabalho; no celular, barra inferior flutuante com Início, Produtos, Lojas, Divulgar, Mais (Mais abre os demais itens).
3. **Menu** na ordem pedida, com contador em Meus produtos (0 nesta fase), rodapé com cartão de cupons (só influenciador), Configurações (Perfil), avatar/nome/e-mail e Sair. Admin continua vendo Gerenciar usuários e Assinaturas.
4. **Cabeçalho amarelo reutilizável** com selo, título, descrição, ações e caixa de resumo, com os textos de cada aba; Início mostra "Bom te ver, {nome}" e o filtro de período em pílulas.
5. **Rotas**: /painel (Início), /painel/lojas, /painel/publicar, /painel/meus-produtos (estado vazio "Em breve" + botão Produtos validados), /painel/produtos (catálogo + workspace com ?produto=&etapa=), /painel/divulgacao (Facebook e WhatsApp em abas), /painel/fornecedores, /painel/perfil. /painel/integracoes redireciona para /painel/fornecedores. Retorno do OAuth do Mercado Livre passa a cair em Fornecedores.
6. **Abas existentes** recebem cartões brancos sem borda e selos com texto/ícone; lógica intacta.
7. **Fornecedores**: card Mercado Livre com a conexão e tag atuais; card Shopee "Em breve".
8. **Cupons exclusivos**: nova tabela, gestão no /admin (listar, criar, desativar), cartão no menu e janela com os textos pedidos, copiar código e estado vazio.
9. **Plano** sai do menu para Perfil > Plano (Mensal/Vitalício, lojas usadas X de 3 ou 10 — 0 nesta fase — e botão de upgrade para o checkout Vitalício).
10. **Favicon** novo e título "{Aba} · AfiliaPlace" em cada rota.

## Testes ao final (reportados item a item)
Rotas com casca nova e sem blocos pretos; workspace, cópia de link, tag, grupos e dashboard funcionando; redirecionamento de integrações; conta de teste sem papel de influenciador não vê cupons e a consulta volta vazia, com papel vê cartão e janela (papel removido depois); celular 390px com 5 itens sem cortes. Contas reais não são alteradas.

## Detalhes técnicos
- `/painel` vira layout (`painel.tsx` com gate de acesso + casca + `<Outlet />`), filhos `painel.index.tsx`, `painel.lojas.tsx`, `painel.publicar.tsx`, `painel.meus-produtos.tsx`, `painel.produtos.tsx` (validateSearch produto/etapa movido para cá; redirect de `/painel?produto=` antigo), `painel.divulgacao.tsx`, `painel.fornecedores.tsx`, `painel.integracoes.tsx` (redirect, preservando code/state), `painel.perfil.tsx`, e rotas admin internas `painel.usuarios.tsx`/`painel.assinaturas.tsx` com checagem server-side existente. Telas internas continuam lazy-loaded.
- `affiliate-dashboard.tsx` vira `PanelShell` (sidebar, bottom bar, sheet "Mais"); novo `tab-header.tsx`; `coupons-dialog.tsx`; `suppliers.tsx` envolvendo `Integrations`.
- Fontes via `<link>` em `__root.tsx`; tokens novos em `src/styles.css` (`@theme inline`), removendo variantes dark do painel; scroll restoration do router ativada.
- Migration: `cupons_influenciador` (id, codigo unique, valor_desconto numeric default 30, desconto_max_percentual default 50, validade timestamptz, ativo default true, criado_em) + GRANT SELECT a authenticated, ALL a service_role; RLS SELECT via função security definer `is_influencer(auth.uid())` (lê member_roles pelo e-mail do usuário) e `ativo`; escrita só por server functions com `requireAdmin` + admin client.
- Server fns `coupons.functions.ts`: listar ativos (influenciador), listar/criar/desativar (admin). `getAccessStatus`/conta expõe `isInfluencer` para mostrar o cartão.
- Assets via `lovable-assets` (ícone, Mercado Livre, Shopee); `public/favicon.png` como arquivo real.
- Atualizar `AGENTS.md` (navegação por rotas aninhadas, painel só tema claro) e memória de design.
