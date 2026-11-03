# PATCH-001 – Novo modal de produto + "Publicar no meu perfil ML"

## Fase 0 – Resposta: como o link é gerado hoje
Modo **B (montado localmente)**. Em `src/lib/meli-categories.ts`, função `affiliateLink(permalink, tag)`: pega o link do produto e acrescenta `matt_word=<tag>` e `matt_tool=afiliasplace`. Nenhum endpoint do programa de afiliados é chamado. A tag vem de `meli_connections.affiliate_tag` (lida no servidor em `src/lib/meli-access.server.ts`); se o usuário não a editou, ela é o apelido da conta, então não é "confirmada" pelo Mercado Livre. Portanto o item 4 segue o **Modo B**.

## O que muda (só a aba Produtos + 1 campo em Integrações)
1. **Modal novo** no lugar do pop-up atual: 2 colunas no computador (galeria com miniaturas e zoom; à direita selos, título com "ver mais", preço com antigo riscado e % de desconto, vendidos, reputação do vendedor colorida, ações e abas Link | Mensagem pronta). No celular, painel de baixo para cima em tela cheia, arrastar para fechar e botões fixos no rodapé.
2. **Ações**: "Copiar link de afiliado" (dourado, aviso "Link copiado" e ✓ por 2s), "Publicar no meu perfil ML", "Abrir no Mercado Livre" com o link de afiliado. No card: atalhos ao passar o mouse (computador) ou menu "⋯" (celular).
3. **Mensagem pronta**: usa os modelos de Scripts existentes com nome, preço, frete e link; escolher modelo; Copiar e Enviar no WhatsApp.
4. **Navegação**: setas ‹ › e teclas ←/→ seguindo busca/filtro/categoria atuais; Esc fecha; endereço com `?produto=MLB...` (recarregar abre direto, voltar fecha); foco preso no modal e devolvido ao card; pré-carregamento ao passar o mouse e dos vizinhos; esqueleto de carregamento; transição suave.
5. **Publicar (Modo B)**: elegibilidade calculada no servidor (novo, ativo, reputação amarela/verde-clara/verde); se não elegível, botão desativado com explicação. Ao clicar abre o produto no ML e mostra a instrução "Na barra de afiliados no topo da página, clique em Compartilhar..." + botão "Marcar como publicado" (salva como manual). Só mostra "✓ No seu perfil" depois dessa confirmação. Selo "No perfil" nos cards publicados. Botão "Ver meu perfil" quando a URL do perfil estiver preenchida.
6. **Sem conta/tag confirmada**: faixa no topo do modal com botão para Integrações; Copiar e Publicar desativados com explicação.
7. **Integrações**: campo opcional "URL do meu perfil de afiliado no Mercado Livre".

Não altera Dashboard, Grupos, Admin nem pagamento. Tema escuro/claro atual mantido, contraste AA e tudo usável pelo teclado.

## Detalhes técnicos
- Migração: tabela `perfil_publicacoes` (id, user_id, item_id, status `auto|manual`, publicado_em, único por user_id+item_id) com GRANT para authenticated/service_role, RLS só nas próprias linhas (select/insert/update/delete). Nova tabela `meli_affiliate_profile` (user_id pk, profile_url, tag_confirmed_at) com RLS própria, já que `meli_connections` é fechada; "tag confirmada" = usuário salvou/confirmou a tag em Integrações.
- Servidor (`src/lib/meli.functions.ts`): `getProductDetail(id)` busca `/items/{id}` (fotos, preço original, condição, status, vendidos) + `/users/{seller_id}` (reputação) e devolve `eligible` + `ineligibleReason` e o link de afiliado. Tudo no servidor com cache por React Query.
- `src/lib/perfil.functions.ts`: listar publicações, marcar manual (valida elegibilidade de novo no servidor), salvar URL do perfil.
- Componentes novos: `product-modal.tsx` (Dialog/Drawer conforme largura, foco via Radix), `product-card-actions.tsx`; `products-catalog.tsx` passa a lista filtrada para navegação e usa `validateSearch` com `produto` na rota `/painel`. `product-script-dialog.tsx` reaproveitado para os modelos.
- Testes: regra de elegibilidade (condição/status/níveis de reputação) e montagem da mensagem do WhatsApp.
