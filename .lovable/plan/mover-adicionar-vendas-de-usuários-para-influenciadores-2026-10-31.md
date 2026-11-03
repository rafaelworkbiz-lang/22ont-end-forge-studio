# Mover "Adicionar vendas" de Usuários para Influenciadores

- Administração › Usuários: remover o botão de sacola "Adicionar vendas" (e a janela ligada a ele).
- Administração › Influenciadores: adicionar o mesmo botão em cada influenciador, abrindo a mesma janela (quantidade 1–500, dia até 30 dias atrás, produtos sorteados, lista de lotes com "Remover").
- Regras continuam iguais: vendas aparecem só no painel da própria pessoa, fora das métricas do admin, e ficam no Histórico.

## Detalhes técnicos
- `src/components/users-manager.tsx`: tirar import/estado `salesFor`, botão e `<ManualSalesDialog>`.
- `src/components/influencers-manager.tsx`: adicionar estado `salesFor`, botão com ícone ShoppingBag nas ações de cada linha/cartão, e renderizar `<ManualSalesDialog person={{name,email}} />`.
- Funções do servidor sem mudança.
