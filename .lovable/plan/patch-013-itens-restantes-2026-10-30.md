# PATCH-013: itens restantes

O painel continua claro com o amarelo #FFE600. Regras de negócio, banco e pagamentos não mudam.

## O que será feito
1. **Blocos cinza enquanto carrega:** nas abas Início, Produtos validados, Meus produtos, Minhas lojas e Divulgação, a rodinha dá lugar a blocos cinza no formato do conteúdo.
2. **"Desfazer" na hora:** quando você salva ou remove um produto, favorita um grupo ou marca algo como postado, a tela muda na hora e aparece um aviso com "Desfazer" por alguns segundos. Se der erro, tudo volta como estava.
3. **Filtros que continuam:** os filtros de Produtos validados, Meus produtos e Divulgação ficam guardados no endereço da página, então recarregar ou voltar não perde os filtros.
4. **Limpeza:** tirar telas e estilos antigos que não são mais usados.
5. **Medição de velocidade:** medir quanto cada aba leva para abrir e se trava, e mostrar os números.
6. **Conferir no navegador:** a busca rápida (Ctrl+K), o destaque deslizante do menu e o caminho no topo das janelas.

## Como vou conferir
- Os testes automáticos atuais, mais testes novos para os filtros e para o "Desfazer".
- O navegador na conta de teste, em notebook (1366×657), em tela grande (1920×1080) e no celular (390px).
- Nada será publicado sem você pedir.

## Detalhes técnicos
- Blocos cinza: `Skeleton` nos estados de carregamento.
- "Desfazer": onMutate/onError com rollback no React Query + toast do sonner com ação.
- Filtros: validateSearch com zod + fallback.
- Limpeza: rg por componentes e classes sem referência antes de remover.
