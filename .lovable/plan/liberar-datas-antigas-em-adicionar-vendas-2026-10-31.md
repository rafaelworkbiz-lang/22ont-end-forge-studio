# Liberar datas antigas em "Adicionar vendas"

Hoje o "Dia de início" só aceita até 30 dias atrás. Vamos permitir escolher qualquer data desde 01/01/2019 até hoje.

## O que muda
- Janela "Adicionar vendas": o calendário do dia de início passa a aceitar desde 01/01/2019.
- O servidor deixa de recusar períodos com mais de 30 dias; continua recusando data antes de 2019, fim antes do início ou fim no futuro.
- Mensagem de erro atualizada: "Escolha um período entre 01/01/2019 e hoje, com o fim depois do início."
- O valor continua dividido em várias vendas (até 10 mil) espalhadas no período, nunca depois da hora atual.

## Detalhes técnicos
- `src/components/manual-sales-dialog.tsx`: `min = "2019-01-01"`.
- `src/lib/manual-sales.functions.ts`: trocar `start < now - 31 dias` por `start < Date.parse("2019-01-01T00:00:00-03:00")`.
- Adicionar teste: período iniciando em 2019 gera vendas dentro do intervalo e soma o valor exato.
