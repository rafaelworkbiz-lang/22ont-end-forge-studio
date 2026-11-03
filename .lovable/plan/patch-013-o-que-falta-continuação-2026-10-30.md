# PATCH-013: o que falta (continuação)

O painel continua claro com o amarelo #FFE600. Regras de negócio, banco e pagamentos não mudam.

## O que será feito
1. **Caminho no topo das janelas:** cada janela mostra onde você está, por exemplo "Minhas lojas › Editar loja".
2. **Esqueletos de carregamento:** enquanto as abas Início, Produtos validados, Meus produtos, Minhas lojas e Divulgação carregam, aparecem blocos cinza no formato do conteúdo no lugar da rodinha.
3. **Mudança na hora com "Desfazer":** ao salvar ou remover um produto, favoritar um grupo ou marcar como postado, a tela muda na hora e mostra um aviso com "Desfazer" por alguns segundos. Se der erro, tudo volta como estava.
4. **Filtros no endereço:** os filtros de Produtos validados, Meus produtos e Divulgação ficam guardados no endereço da página. Recarregar ou voltar mantém os filtros.
5. **Limpeza:** remover telas e estilos antigos que não são mais usados.
6. **Medição de velocidade:** medir quanto tempo cada aba leva para abrir e se trava, e mostrar os números.
7. **Conferir no navegador** a busca rápida (Ctrl+K) e o destaque deslizante do menu, que entraram na etapa anterior.

## Como vou conferir
- Os testes automáticos atuais, mais testes novos para os filtros no endereço e para o "Desfazer".
- O navegador na conta de teste, em notebook (1366×657), em tela grande (1920×1080) e no celular (390px).
- Nada será publicado sem você pedir.

## Detalhes técnicos
- Caminho: campo opcional `trilha` no registro JANELAS, mostrado na moldura do JanelaHost.
- Esqueletos: `Skeleton` do shadcn nos fallbacks de Suspense e de carregamento das abas.
- Otimista: onMutate/onError com rollback no React Query, mais um toast do sonner com ação.
- Filtros: validateSearch com zod + fallback nas rotas filhas de /painel.
- Limpeza: buscar com rg componentes e classes sem referência antes de remover.
