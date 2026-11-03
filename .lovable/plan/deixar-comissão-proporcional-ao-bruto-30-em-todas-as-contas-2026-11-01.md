# Deixar comissão proporcional ao bruto (30%) em todas as contas

## O que encontrei
- As regras atuais já calculam 30% do bruto (vendas de hoje do Kawan: R$4.691 bruto → R$1.407 comissão).
- O problema são as vendas antigas já salvas, criadas antes da regra dos 30%. Elas guardaram comissões de 3% a 15% do bruto. Exemplo: 18/10 do Kawan tem R$12.266 bruto e só R$244 de comissão.
- Isso afeta lotes antigos de várias contas, não só do Kawan.

## Correção (só nos dados ilustrativos do painel)
1. **Vendas automáticas antigas (dias 12/10 a 30/10):** manter a comissão que a pessoa já viu e baixar o bruto para ficar proporcional (bruto = comissão ÷ 0,30). Assim os ganhos diários continuam na faixa R$300–R$2.000 e o bruto fica coerente.
2. **Lotes adicionados manualmente pelo admin:** manter o valor total digitado (bruto) e recalcular a comissão para 30% de cada venda.
3. O lote de R$557 do Kawan já está em 30% e não muda.
4. Nada de vendas reais ou métricas do admin é tocado; tudo segue marcado como ilustrativo.

## Como confirmar
- Somar de novo cada lote e verificar que comissão = 30% do bruto em todos.
- Adicionar um teste que garante que novos lotes manuais e automáticos sempre saem com 30%.

## Detalhes técnicos
- Atualização única na tabela `test_balance_entries` (campo `events.sales`, índices 2 = bruto e 3 = comissão), venda a venda, e recalcular `amount_cents`.
- `auto:*` → `cents = round(commission / 0.30)`; `manual:*` → `commission = round(cents * 0.30)`.
- Lote `influencer_demo_batches` legado (histórico de 10%) recebe a mesma regra dos manuais.
