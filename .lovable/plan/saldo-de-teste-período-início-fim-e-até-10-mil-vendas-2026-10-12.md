# Saldo de teste: período início-fim e até 10 mil vendas

## O que muda para você
No pop-up "Saldo de teste" (Gerenciar Usuários):
- O seletor de período vira dois campos de data: **Início** e **Fim** (com atalhos Hoje, 7 dias e 30 dias que só preenchem as datas).
- Novo campo **Quantidade de vendas** (de 1 a 10.000). Se ficar em branco, o sistema escolhe sozinho um número coerente com o valor e os preços dos produtos.
- O valor digitado (ex.: R$ 500.000) é dividido em todas essas vendas, com produtos, preços e horários aleatórios espalhados entre o início e o fim.
- O **Fim** pode ser uma data futura (até 30 dias): as vendas daquele período vão aparecendo no dashboard conforme o relógio avança, como vendas automáticas ao longo do tempo.
- Aparece um resumo antes de confirmar: "N vendas entre DD/MM e DD/MM".
- O restante (vendas diárias automáticas, zerar saldo, selo "Modo teste" só no rodapé do menu) continua igual.

## Detalhes técnicos
- `src/lib/demo-engine.ts` (`splitSales`): receber `count` opcional e subir o teto de 600 para 10.000; manter semente determinística e soma exata igual ao valor. Garantir ao menos 1 centavo por venda (rejeitar quantidade maior que o valor em centavos).
- `src/lib/test-balance.functions.ts` (`addTestBalance`): novos campos validados `count` (inteiro 1-10.000, opcional); fim limitado a hoje + 30 dias em vez de agora; início anterior ao fim; limite de janela (ex.: até 2 anos para trás).
- Armazenamento compacto: para 10.000 vendas, guardar em `events` a lista de produtos uma vez e cada venda só com índice do produto, horário, valor e comissão (evita ~4 MB por lote). `getDemoOverview` aceita o formato antigo e o novo.
- `getDemoOverview` devolve `products` + vendas compactas; `test-data-query.ts` reidrata para o formato atual, então `sales-overview` e `demo-sales-overview` não mudam. O filtro existente `at <= agora` já esconde vendas futuras.
- `src/components/test-balance-dialog.tsx`: trocar o select de período por campos Início/Fim + atalhos, adicionar o campo de quantidade e o resumo.
- Sem mudança de tabelas.

## Verificação
- Testes de unidade para `splitSales`: 10.000 vendas, soma exata, todas dentro do período, mínimo de 1 centavo.
- No navegador, como admin: adicionar R$ 500.000 com 10.000 vendas em 30 dias; conferir total, gráfico, produtos mais vendidos e tempo de carregamento; testar fim futuro (vendas futuras não aparecem ainda).
