# Ajustar saldo do mathias para R$ 498 mil (jan/2025 até hoje)

## O que existe hoje na conta
- R$ 500.000 adicionados à mão, espalhados de 01/01/2025 até hoje.
- R$ 1.146.082 gerados só hoje pelas vendas automáticas (por isso passou de R$ 1 milhão).

## O que vai ser feito
1. Apagar as vendas automáticas de hoje e o saldo manual atual dessa conta.
2. Desligar as vendas automáticas dessa conta, senão ela gera mais de R$ 1 milhão de novo no mesmo dia.
3. Gerar um novo saldo de **R$ 498.000** distribuído de 01/01/2025 até agora, com produtos aleatórios do catálogo e comissão de 10% (a taxa da conta).
4. Deixar as vendas automáticas mais realistas para quando forem religadas: no máximo cerca de 40 vendas por dia, variando de um dia para o outro, em vez de até 10 mil.

Resultado: o painel do mathias mostra R$ 498 mil acumulados ao longo de quase dois anos (cerca de R$ 770 por dia), com comissões proporcionais.

## Detalhes técnicos
- Exclusão por `user_id = 0d8e392c-...` em `test_balance_entries`; `auto_daily_enabled = false` em `test_balance_settings`.
- Novo lote: script único usando `splitSales` + `demoCatalog`, gravado como `manual:<uuid>` (49.800.000 centavos, start 2025-01-01T03:00Z, end now), formato compacto v2.
- `dailyAutoSales`: contagem diária aleatória de 1 a 40 (constante `MAX_AUTO_DAILY`), mantendo preço × unidades × taxa.
