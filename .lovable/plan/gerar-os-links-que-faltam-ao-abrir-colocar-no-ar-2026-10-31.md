## Gerar os links que faltam ao abrir "Colocar no ar"

Hoje, na checagem antes de publicar, a geração automática dos links usa o acesso interno do servidor em vez da sessão da própria pessoa. Por isso, na conta do Kawan, 14 produtos continuaram aparecendo como "sem link", mesmo com o Mercado Livre conectado.

### O que muda
- Ao abrir "Colocar no ar", os links que faltam serão gerados usando a sessão da própria pessoa, como já acontece em Meus produtos.
- Os links criados ficam salvos no produto e o aviso some sozinho.
- Se a tag não estiver confirmada, o aviso continua e indica o que precisa ser feito (conectar o Mercado Livre e confirmar a tag em Fornecedores). Nenhuma tag é preenchida automaticamente.

### Detalhes técnicos
- Em `src/lib/store-publish.functions.ts` (`analyze`), passar `userDb` (cliente com a sessão do usuário) para `buildAffiliateLink` no lugar do cliente admin; manter o admin só para gravar `link_afiliado`.
- Contar o motivo da falha: se for tag não confirmada, mostrar essa mensagem no item do checklist.
- Conferir na conta de teste que o checklist passa a mostrar 0 sem link depois da geração.
