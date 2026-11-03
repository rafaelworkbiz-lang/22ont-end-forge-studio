# PATCH-006 · Fase 5 — Colocar no ar

## O que o usuário vai ver
- Na etapa "Colocar no ar" da loja: campo de endereço `afiliaplace.site/loja/…` com conferência ao vivo (disponível / em uso / reservado / formato inválido) e até 3 sugestões livres.
- Checklist com o estado real da loja: itens que bloqueiam (vermelho) e avisos (amarelo). O botão Publicar só libera sem bloqueios.
  - Bloqueia: plano ativo; pelo menos 1 produto ativo; fornecedor de cada produto conectado (com botão "Remover produtos afetados"); link de afiliado de todos os produtos (o sistema tenta gerar antes de reprovar).
  - Aviso: menos de 4 produtos; sem logo ou banner.
  - Automático: aviso de loja afiliada sempre presente na página.
- Depois de publicar: link da loja com Copiar, Abrir, Divulgar e QR Code para baixar em PNG.
- Depois da primeira publicação o endereço fica travado (mostra cadeado); o nome da loja continua editável.
- Página pública `/loja/{endereço}`: rápida, funciona no celular, com título, descrição, imagem de compartilhamento (banner), endereço oficial e indexável no Google; aviso de loja afiliada no rodapé. Cliques nos produtos passam pelo contador já existente.
- Loja pausada: "Esta loja está temporariamente indisponível". Endereço inexistente: página 404 amigável.
- Admin: nova seção "Endereços reservados" para incluir/remover termos.

## Pausa automática por assinatura
Plano: quando a Applyfy avisar cancelamento, reembolso, chargeback ou vencimento, as lojas publicadas da pessoa pausam sozinhas (marcadas como "pausada pelo sistema"); quando a assinatura voltar, só essas voltam a publicadas — lojas pausadas manualmente pelo usuário continuam pausadas. Também uma checagem diária para mensais vencidos sem aviso. **Preciso da sua confirmação desse comportamento** (o patch pede confirmar com o dono do produto); se não aprovar, deixo apenas o bloqueio no checklist.

## Detalhes técnicos
- Migração:
  - `slugs_reservados(termo text pk)` com os termos do sistema e marcas listados; leitura/escrita só admin (has_role) e service_role.
  - `lojas`: novas colunas `slug_travado boolean default false`, `pausada_por_sistema boolean default false`; índice único em `lower(slug)`; trigger passa a impedir mudar slug quando `slug_travado` e impedir status `publicada` vindo do cliente (publicação só via servidor com admin client).
  - Leitura pública: política `TO anon, authenticated` em `lojas` apenas para `status in ('publicada','pausada')` com colunas seguras via função security definer `loja_publica(slug)` retornando loja + produtos (nome, imagem, preço, id para `/r/...`), sem expor user_id. Sem grant direto de tabela a anon.
  - Storage bucket `lojas`: política SELECT pública para arquivos de lojas publicadas (pasta do dono com loja publicada), mantendo escrita só do dono.
- Regras puras em `src/lib/store-rules.ts`: validar endereço (regex `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–40), normalizar, gerar sugestões, montar checklist a partir de um estado. Testes em `src/test` para cada regra (limites 2/3/40/41, hífens, reservado, maiúsculas, bloqueios vs avisos).
- Server functions em `stores.functions.ts` (requireSupabaseAuth): `checkSlug`, `storeChecklist` (gera links faltantes via `affiliate-links.server.ts`), `removeAffectedProducts`, `publishStore` (revalida tudo no servidor, depois grava status/publicada_em/slug/slug_travado com admin client), funções admin para reservados.
- Rota pública `src/routes/loja.$slug.tsx` com loader via server function pública (cliente publishable), `head()` com title/description/og:image do banner/canonical `https://afiliaplace.site/loja/{slug}`, `notFound()` para inexistente.
- QR Code com pacote `qrcode` gerado no navegador, download PNG.
- Webhook Applyfy (`purchase-access`/handler existente): chamar função que pausa/reativa lojas do usuário; cron diário existente ou novo para vencidos.
- Verificação: typecheck, testes, Playwright na conta de teste (endereço ao vivo, checklist, publicar, página pública desktop/390px, pausada, 404). Sem publicar o site sem pedido.
