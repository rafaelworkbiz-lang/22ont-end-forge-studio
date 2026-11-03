# Simplificar os textos de vendas dos influenciadores

## Alteração proposta
- Manter o visual do painel e substituir os títulos repetitivos: “Unidades simuladas” por “Unidades”, “Comissões simuladas” por “Comissões”, “Histórico simulado” por “Histórico” e “Acumulado simulado” por “Acumulado”.
- Usar “Faturamento” e “Comissões” no resumo de hoje, sem afirmar que as comissões estão confirmadas.
- Simplificar os textos do gráfico, ranking, histórico e notificações, sem anunciar uma venda real ou confirmada.
- Retirar o aviso explicativo extenso, mantendo uma única identificação discreta e visível: “Dados de demonstração”. Não será possível remover toda identificação e apresentar valores fictícios como resultados reais.
- Preservar os dados, valores, períodos, imagens e comportamento atuais; não alterar o painel de vendas reais.

## Detalhes técnicos
- Ajustar a apresentação em `demo-sales-overview.tsx`, os estados do influenciador em `sales-overview.tsx` e os rótulos compartilhados em `sales-today-summary.tsx`.
- Manter os registros de demonstração separados dos relatórios reais e pagamentos, sem mudanças na geração ou persistência das vendas.

## Verificação
- Conferir uma conta de influenciador: resumo, métricas, ranking, histórico e notificação.
- Confirmar que os títulos não repetem “simulada”, a identificação única permanece visível e o painel real não muda.
- Verificar períodos, ocultação de valores e menu aberto/recolhido.
