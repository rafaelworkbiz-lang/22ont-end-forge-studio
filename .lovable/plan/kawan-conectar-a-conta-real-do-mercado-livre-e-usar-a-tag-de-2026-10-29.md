# Kawan: conectar a conta real do Mercado Livre e usar a tag dele

## O que está acontecendo (confirmado)
- A conta do Kawan é de influenciador. Ele **não tem** nenhuma conta do Mercado Livre conectada de verdade.
- Para influenciadores, o sistema mostra uma conta ilustrativa ("doplasti") como "Conectado" em Integrações e sempre deixa a tag vazia.
- A tela do produto acha que está tudo liberado e mostra "Tag ativa" no topo. Mas, sem tag, nenhum link é montado, e aparece "Confirme sua tag".
- Hoje o influenciador também não tem botão para conectar a conta real, e a confirmação da tag sempre falha para ele.

## O que vai mudar
1. **Integrações (influenciador):** mostra a mesma tela do cliente. Tem botão "Conectar com Mercado Livre", campo da tag, botão "Confirmar", reconectar e desconectar. Sai o "doplasti" ilustrativo.
2. **Tag real:** quando o influenciador conecta, o sistema usa a conta e a tag reais dele. A confirmação da tag passa a funcionar para ele.
3. **Topo da tela do produto:** "Tag ativa" só aparece quando existe uma tag real confirmada. Fora isso, aparece "Tag não confirmada" com o botão certo (Confirmar ou Ir para Integrações).
4. **Catálogo:** continua liberado para influenciadores mesmo sem conexão, como já é hoje. Só os links ficam bloqueados até ele conectar e confirmar a tag.
5. **Não muda:** o dashboard de vendas do influenciador, as vendas automáticas, o admin, os clientes e os pagamentos.

## Depois de publicar
- O Kawan entra em Integrações, conecta a conta dele do Mercado Livre e confirma a tag. Não vou preencher nem confirmar a tag por ele.

## Detalhes técnicos
- `src/lib/meli-access.server.ts`: no modo `demo`, retorna `connected`, `nickname`, `meliUserId`, `tag` e `connectedAt` da conexão real. `catalogAllowed` continua `true` para influenciadores.
- `src/components/integrations.tsx`: remove o bloco fixo de `mode === 'demo'`, então o influenciador usa o fluxo conectado/desconectado do cliente.
- `src/components/products-catalog.tsx`: `canEarn` passa a exigir conexão + tag válida + `tagConfirmed` também em `demo`. O `tagStatus` "pending" vale para `client` e `demo`.
- `src/components/product-workspace.tsx`: o selo do topo usa só `tagStatus === "ok"` com tag válida.
- Conferir se outras telas usam `nickname`/`mode === 'demo'` (consultas de busca e dashboard) e manter o comportamento delas.
- Atualizar/adicionar teste: influenciador sem conexão → sem link; influenciador conectado com tag confirmada → link com a tag.
- Validar no navegador com a conta de teste promovida temporariamente? Não: validar com uma sessão de influenciador simulada só nos testes, sem alterar contas reais.
