# Ajustes finais: comissão fixa de 30% e vendas automáticas maiores

## O que já existe (não será refeito)
Aba Influenciadores separada, Assinaturas, Recuperação, Gerentes, Meu time, convites, passo a passo de cadastro na Applyfy, código na página e links de checkout, "Adicionar vendas" por valor e botão de vendas automáticas.

## O que muda
1. **Comissão fixa de 30% sobre o valor cheio** em todas as vendas que aparecem no painel do influenciador (vendas adicionadas e automáticas). Antes usava a porcentagem da conta (10% padrão) ou uma porcentagem sorteada.
2. **Vendas automáticas maiores:** o ganho do influenciador (os 30%) fica entre **R$ 300 e R$ 2.000 por dia**, variando bastante. A maioria dos dias fica entre R$ 400 e R$ 900, alguns entre R$ 900 e R$ 1.500, e poucos chegam perto de R$ 2.000. O faturamento cheio do dia fica em cerca de 3,3 vezes esse valor (ex.: R$ 3.000 de vendas geram R$ 900 para ele).
3. **Remover o campo "Comissão combinada"** da janela de editar influenciador e o texto "Comissão X%" da lista. O valor salvo continua guardado, mas não aparece mais.
4. **"Adicionar vendas" com período:** em vez de um dia só, você escolhe **dia de início e dia de fim** (até 30 dias atrás, sem passar de hoje). O valor informado é espalhado em várias vendas de vários produtos nesse período.
5. A janela de vendas automáticas passa a dizer "30% sobre cada venda · R$ 300 a R$ 2.000 por dia".

## Detalhes técnicos
- `demo-engine.ts`: constante `INFLUENCER_RATE = 30`; `dailyAutoSales` sorteia uma meta líquida de 30000–200000 centavos, deriva o valor bruto (meta / 0,30) e distribui entre os produtos, com comissão = 30% de cada venda (a última fecha a meta exata).
- `manual-sales.functions.ts`: usar `INFLUENCER_RATE`; aceitar `inicio`/`fim` no lugar de `dia`; `manualSalesValue` cobre o intervalo inteiro.
- `manual-sales-dialog.tsx`: dois campos de data; `auto-sales-dialog.tsx`: texto novo.
- `influencers-manager.tsx`: remover campo e coluna de comissão.
- Lotes automáticos já gerados ficam como estão; os dias novos usam a regra nova.
- Testes: comissão do dia automático entre R$ 300 e R$ 2.000; comissão = 30% do bruto; vendas do período ficam entre início e fim e não passam da hora atual.
- Atualizar a memória da comissão do influenciador: 30% fixo nas vendas do painel. Os 50% da Applyfy continuam valendo só como referência fora do painel.
