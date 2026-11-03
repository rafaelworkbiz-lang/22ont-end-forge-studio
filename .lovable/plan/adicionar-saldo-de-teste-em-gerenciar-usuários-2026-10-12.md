# Adicionar saldo de teste em Gerenciar Usuários

## O que muda
1. **Gerenciar Usuários**: em cada influenciador (e na sua conta de admin), novo botão "Adicionar saldo".
   - Campo de valor em R$ (ex.: 500.000).
   - Escolha do período: Hoje, 7 dias, 30 dias ou datas personalizadas.
   - O valor é dividido em várias vendas de produtos aleatórios do catálogo dentro desse período.
   - Interruptor "Vendas diárias automáticas" com valor por dia; novas vendas entram ao longo do dia.
   - Botão "Zerar saldo de teste".
2. **Dashboard**: o total, o gráfico, as métricas e os "Produtos mais vendidos" somam esse saldo. Fica igual a um painel real, sem selo perto dos valores.
3. **Única marca**: um aviso pequeno de "Modo teste" no rodapé do menu lateral, que aparece só enquanto houver saldo de teste na conta.
4. Contas normais não são afetadas. O saldo de teste nunca entra em pagamentos nem em relatórios reais do Mercado Livre.

## Detalhes técnicos
- Nova tabela `test_balance_entries` (user_id, amount, period_start, period_end, created_at) com GRANT + RLS: leitura só do próprio dono, escrita só pelo servidor.
- Colunas `auto_daily_enabled` e `auto_daily_amount` em `influencer_demo_settings` (com default).
- Server functions protegidas por `requireAdmin`: `addTestBalance`, `setAutoDaily`, `resetTestBalance`.
- As vendas são geradas de forma determinística a partir do valor e do período (uma chave fixa por lançamento, sem duplicar), com produtos aleatórios do catálogo.
- `getDemoOverview` agrega os lançamentos manuais e automáticos, filtrados pelo período escolhido no dashboard; `sales-overview.tsx` volta a renderizar o painel com esses dados sem selo; aviso "Modo teste" no rodapé do menu lateral.
- UI nova em `users-manager.tsx` (diálogo com valor, período e interruptor).
