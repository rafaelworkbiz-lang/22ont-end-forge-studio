# Vendas do Kawan + aviso de venda + aba Início rápida

## 1. Vendas de hoje para kawan@gmail.com
- Lançar um lote de vendas de hoje cuja comissão (30%) some R$ 557,00, ou seja, cerca de R$ 1.856,67 de valor cheio.
- Produtos sorteados dos Produtos validados, com horários espalhados até agora.
- Usa o mesmo caminho do botão "Adicionar vendas" (lote com código próprio, removível, registrado no Histórico). Aparece só no painel do Kawan.

## 2. Como funcionam as vendas automáticas (explicação)
- Ligadas por pessoa, caem ao longo das 24h em ondas; horários futuros ficam "Ainda não chegou".
- Ganho do dia entre R$ 300 e R$ 2.000 (normal R$ 400–900).

## 3. Aviso no canto da tela a cada venda
- Com o painel aberto, quando chega o horário de uma venda (manual ou automática), aparece um aviso no canto: "Nova venda! Produto X — comissão R$ Y", com foto pequena.
- Só avisa vendas que chegam enquanto a pessoa está no painel (não repete as antigas ao abrir).
- Checagem a cada 30 segundos comparando os horários das vendas do dia já calculadas.

## 4. Aba Início sem travar
- Trocar a busca externa de produtos da aba Início pela biblioteca interna de produtos validados (resposta instantânea).

## 5. Travas de lojas (já validado)
- Conta nova sem loja; Mensal 3 e Vitalício 10, com trava no banco. Nada a mudar; só conferir de novo depois das mudanças.

## Detalhes técnicos
- Lote: chamar a mesma lógica de `addManualSales` (valor 1856.67, início=fim=hoje) via inserção no `test_balance_entries` do usuário do Kawan.
- Aviso: hook no PanelShell usando os eventos do `demo-engine` do dia; `toast` do sonner; guarda ids já avisados em memória.
- Início: substituir chamada ML por leitura de `produtos_cache`.
- Nada é publicado sem seu OK.
