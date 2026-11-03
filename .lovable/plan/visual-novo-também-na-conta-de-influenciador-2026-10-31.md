# Visual novo também na conta de influenciador

## O que encontrei
As janelas de Produtos validados e Meus produtos são as mesmas para todo tipo de conta: não existe nenhuma versão separada para influenciador. A causa mais provável é outra: as últimas mudanças (janelas novas, cantos redondos, "Adicionar" dentro da janela, editor de loja) estão só na **prévia**. O site publicado (afiliaplace.site) ainda está na versão de antes. Se você entrou com a conta de influenciador pelo site publicado, vai ver o estilo antigo.

Isso ainda não está confirmado: primeiro vou conferir.

## Passos
1. Entrar na prévia com uma conta de influenciador e abrir as janelas de Produtos validados e Meus produtos, tirando fotos da tela.
2. Se o visual estiver novo na prévia, **publicar o site** para que a versão nova chegue a todo mundo, inclusive aos influenciadores.
3. Se o visual estiver antigo também na prévia, achar o que é diferente nessa conta (por exemplo, um estilo que depende do tipo de conta) e corrigir, sem mexer nas permissões.
4. Conferir de novo com fotos depois da correção.

## Detalhes técnicos
- Comparar `library.tsx` / `library-shared.tsx` / `janela.tsx` renderizados com sessão de influenciador (member_roles) e com a conta de teste.
- Publicação só depois da conferência.
