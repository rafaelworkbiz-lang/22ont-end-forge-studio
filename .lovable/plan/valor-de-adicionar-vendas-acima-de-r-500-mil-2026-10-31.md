# Valor de "Adicionar vendas" acima de R$ 500 mil

## O que muda
- O campo "Valor total (R$)" passa a aceitar até **R$ 10.000.000** (hoje trava em R$ 50.000).
- Valores grandes viram **mais vendas**, não vendas caras: hoje o lote para em 600 vendas, então R$ 500 mil daria cerca de R$ 830 por venda. O limite sobe para até **10.000 vendas por lote**, mantendo o preço de cada venda perto do preço real do produto. Acima disso, os preços sobem um pouco para fechar o valor.
- O valor total continua batendo exato e nenhuma venda cai no futuro.

## Detalhes técnicos
- `manual-sales-dialog.tsx`: `max={10000000}`.
- `manual-sales.functions.ts`: zod `valor.max(10_000_000)`.
- `demo-engine.ts` `splitSales`: trocar o teto fixo `600` por `MAX_TEST_SALES` (10.000) quando nenhuma quantidade for pedida.
- Teste: R$ 600.000 fecha o valor exato e gera mais de 600 vendas.
