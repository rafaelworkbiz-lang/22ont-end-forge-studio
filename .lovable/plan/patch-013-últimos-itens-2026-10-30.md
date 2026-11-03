# PATCH-013: últimos itens

O painel continua claro com o amarelo #FFE600. Regras de negócio, banco e pagamentos não mudam.

## O que será feito
1. **"Desfazer" na hora:** quando você salva ou remove um produto, favorita um grupo ou marca algo como postado, a tela muda na hora e aparece um aviso com "Desfazer" por alguns segundos. Se der erro, tudo volta como estava.
2. **Filtros que continuam:** os filtros de Produtos validados, Meus produtos e Divulgação ficam guardados no endereço da página. Assim, recarregar a página ou voltar não perde o que você escolheu.
3. **Limpeza:** tirar telas e estilos antigos que não são mais usados.
4. **Medição de velocidade:** medir quanto cada aba leva para abrir e se trava, e mostrar os números.
5. **Conferir no navegador:** o destaque deslizante do menu, o caminho no topo das janelas e o celular (390px) e a tela grande (1920×1080).

## Como vou conferir
- Os testes automáticos atuais, mais testes novos para os filtros e para o "Desfazer".
- O navegador na conta de teste.
- Nada será publicado sem você pedir.

## Detalhes técnicos
- "Desfazer": onMutate/onError com rollback no React Query + toast do sonner com ação.
- Filtros: validateSearch com zod + fallback.
- Limpeza: buscar com rg componentes e classes sem referência antes de remover.
