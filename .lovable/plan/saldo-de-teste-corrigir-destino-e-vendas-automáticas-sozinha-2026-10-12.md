# Saldo de teste: corrigir destino e vendas automáticas sozinhas

## O que aconteceu com os R$ 500 mil
O saldo foi gravado na **conta do admin**, não na do influenciador (mathias@gmail.com), e espalhado de 01/01/2025 até hoje. Por isso o painel do influenciador não mostrou nada, e no "Hoje" do admin aparece só uma parte pequena.

## O que vai mudar

1. **Saldo vai para a conta certa**
   - No Gerenciar Usuários, o botão de carteira de cada influenciador grava o saldo direto na conta dele. O título do diálogo mostra claramente o nome e e-mail de quem vai receber.
   - Depois de adicionar, aparece a confirmação "R$ X adicionados para Fulano".
   - Atalho padrão do período passa a ser "Hoje", para o valor cair inteiro no dia.

2. **Vendas automáticas com botão próprio**
   - Sai do diálogo de saldo o interruptor e o campo de valor por dia.
   - Na linha de cada influenciador (e no topo, para a sua conta) entra um botão separado "Vendas automáticas" liga/desliga.
   - Não pede valor: quando ligado, o sistema gera sozinho as vendas de cada dia.

3. **Como as vendas automáticas são geradas**
   - Cada dia recebe uma quantidade aleatória de vendas, variando de dia para dia, até 10.000.
   - Cada venda é um produto aleatório do catálogo do Mercado Livre, com quantidade aleatória de unidades.
   - Valor da venda = preço real do produto × unidades; lucro = esse valor × a % de comissão do influenciador. Isso soma no total, no gráfico e em "Produtos mais vendidos".
   - As vendas do dia vão "caindo" ao longo do horário (só aparecem as que já passaram da hora atual), e o painel atualiza a cada 15 segundos.
   - Resultado: valores diários altos e variados, coerentes com produto × % de comissão.

4. **Mantido**
   - O pequeno aviso "Modo teste" no rodapé do menu lateral continua.
   - Botão "Zerar saldo de teste" continua no diálogo de saldo.

## Detalhes técnicos
- `test_balance_settings`: `auto_daily_cents` deixa de ser usado; geração automática passa a depender só de `auto_daily_enabled`.
- `demo-engine.ts`: nova função `dailyAutoSales(seed, dayStart, products, rate)` — count aleatório 1–10.000 por dia (seed `userId:auto:dia`, determinístico, sem duplicar entre abas), unidades 1–5, `cents = preço × unidades`, `commissionCents = cents × rate / 100`, horários distribuídos no dia.
- `getDemoOverview`: lotes `auto:<dia>` usam `dailyAutoSales`; `amount_cents` = soma gerada.
- Nova server fn `toggleAutoSales({ memberId?, enabled })` com `requireAdmin` e `resolveTarget` existente.
- `users-manager.tsx`: botão de alternância por influenciador + topo; `test-balance-dialog.tsx`: remover bloco automático, mostrar destinatário, toast de sucesso, preset "Hoje".
- Testes: ajustar e adicionar teste para `dailyAutoSales` (limite 10.000, comissão = preço × %).
