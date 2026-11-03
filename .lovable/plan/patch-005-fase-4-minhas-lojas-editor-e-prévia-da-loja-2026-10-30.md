# PATCH-005 · Fase 4 — Minhas lojas, editor e prévia da loja

Mantém o visual e tudo das Fases 1–3. Fora desta fase: publicação pública, endereço `/loja/<endereço>` (Fase 5) e IA de imagem (Fase 6).

## O que o usuário vai ver
1. **Minhas lojas** (`/painel/lojas`): cabeçalho amarelo com "Criar loja", "Comparar lojas" (desativado), "{n} de {limite} lojas usadas" e "{n} publicadas". Grade de 3 colunas com cards (banner, logo sobreposto, selo ML/Shopee, status com texto, "{n} produtos · preset", alerta de produto oculto, "Editar loja" + Métricas + Prévia, menu ⋯ Duplicar/Pausar/Excluir). Último card tracejado "Criar nova loja" com o que resta no plano.
2. **Editor** (`/painel/lojas/nova` e `/painel/lojas/{id}`): painel à esquerda (~420px) + prévia ao vivo Computador/Celular (moldura 360px). Etapas 1 Nome · 2 Identidade · 3 Layout · 4 Produtos, rascunho automático (1s, "Salvando…/Salvo hh:mm"), confirmação ao sair com alterações pendentes. Final leva a `/painel/publicar?loja={id}` ("Em breve" + "Ver prévia").
3. **Prévia privada** (`/loja/previa/{id}`): só o dono, noindex, faixa "Prévia — só você vê esta página". Cabeçalho, hero por nicho, pílulas de categoria, grade conforme preset, 3 blocos de confiança com data da consulta, rodapé de loja afiliada e "Feito com afiliaplace". Oculta produtos fora do ar ou de fornecedor desconectado. Nunca usa marca do fornecedor como identidade da loja.
4. **Clique rastreado** `/r/{loja}/{produto}`: confere que o produto é da loja, registra o clique (`?c=` opcional) e redireciona (302) para o link de afiliado do dono — gerando-o se vazio, como na Fase 3.
5. **Integrações**: Meus produtos ganha "Adicionar à loja" (lojas + "Nova loja"), selos com nomes das lojas, filtro "Sem loja" e números reais; pop-up Adicionar de Produtos validados lista lojas reais; menu lateral sem "Em breve" em Minhas lojas.

## Regras
- Limite no servidor: Mensal 3, Vitalício 10 (rascunhos contam). Admin/influenciador: tratados como Vitalício (10). Erro "Você usou todas as lojas do seu plano." + botão de upgrade.
- Imagens PNG/JPG/WebP até 2 MB, convertidas para WebP no navegador antes do envio; arquivos privados do dono (leitura por link temporário).
- Cor de destaque com contraste AA automático; uma ação amarela por área; sem preto no painel; transições ≤200ms, crossfade de preset, reduced-motion respeitado; arrastar sempre com botões ↑/↓ e teclado.

## Detalhes técnicos
- Migration: `lojas`, `loja_produtos` (único loja+produto, FK cascade a lojas e meus_produtos), `cliques` (sem grants de insert para usuários; leitura pelo dono via policy). GRANTs + RLS por dono; `loja_produtos` via `exists` na loja do dono. Trigger `atualizado_em`. Função security-definer `limite_lojas(uid)` + trigger BEFORE INSERT bloqueando acima do limite (defesa extra além da server function).
- Bucket privado `lojas` com policies em `storage.objects` restringindo ao prefixo `{auth.uid()}/`.
- `src/lib/stores.functions.ts` (requireSupabaseAuth): listar, obter, criar (checa limite), salvar rascunho, duplicar, pausar/reativar, excluir (remove arquivos), definir produtos/ordem, adicionar produto à loja, dados da prévia.
- `src/lib/store-rules.ts` (puro): limites por plano, contraste AA, frase por nicho, filtro de produtos visíveis; testes em `src/test/store-rules.test.ts`.
- Rota servidor `src/routes/r.$lojaId.$produtoId.ts` usando admin client só após validar vínculo loja↔produto e status; reutiliza `affiliate-links.server.ts`. Não conflita com `/r234`.
- Componentes: `stores-list.tsx`, `store-editor.tsx`, `loja-publica.tsx` (reutilizável na Fase 5); rotas `painel.lojas.index.tsx`, `painel.lojas.nova.tsx`, `painel.lojas.$id.tsx`, `loja.previa.$id.tsx`; `painel.lojas.tsx` vira layout com Outlet. Lazy-load como nas demais abas.
- AGENTS.md: regra da loja (limite no servidor, cliques só pela rota de redirecionamento).

## Testes (conta de teste)
Os 9 itens do patch: 4 passos + reabrir rascunho; 4ª loja bloqueada (UI e chamada direta); 4 presets desktop/celular sem perder produtos; adicionar via Meus produtos e Produtos validados; produto fora do ar some e alerta aparece; clique registra e redireciona (ML com tag só se a conta tiver tag confirmada — senão fica pendente como na Fase 3); outro usuário bloqueado na prévia e nos arquivos; exclusão exige digitar o nome; 390px sem cortes. Sem publicar até você pedir.
