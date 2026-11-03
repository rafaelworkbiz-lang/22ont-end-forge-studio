# Botão "Vendas automáticas" na aba Influenciadores

## O que muda para você
Em Administração › Influenciadores, cada pessoa ganha um botão (ao lado da sacola "Adicionar vendas") chamado **Vendas automáticas**. Ele abre uma janela com um botão liga/desliga.

Quando ligado, todo dia caem vendas sozinhas no painel dessa pessoa, do jeito que você pediu antes:
- Produtos sorteados da aba Produtos validados, variando bastante.
- Quantidade varia por dia (ex.: 20, 30, 50, 100 vendas).
- Comissão do dia nunca abaixo de R$ 100; normalmente entre R$ 250 e R$ 450, às vezes mais.
- Vendas chegam em ondas ao longo do dia; o gráfico só marca pico quando cai venda, e horários que ainda não passaram aparecem como "Ainda não chegou".
- Começa a contar a partir do dia em que você ligou (não cria dias passados).
- Ao desligar, param as novas; você escolhe se mantém ou apaga as que já caíram.
- A janela mostra desde quando está ligado e o total já gerado.

Continua igual às vendas manuais: aparece só no painel da própria pessoa, fica fora das métricas do admin, Assinaturas, Recuperação e página ao vivo, e cada ligar/desligar vai para o Histórico. O saldo continua desligado (separado).

## Detalhes técnicos
- Reativar o bloco hoje desligado (`false as boolean &&`) em `src/lib/demo.functions.ts`, usando `dailyAutoSales` já existente com lotes `auto:<dia>` imutáveis (sem duplicar entre abas).
- Novas funções requireAdmin em `manual-sales.functions.ts`: `getAutoSales`, `setAutoSales(userId, enabled, keepExisting)` gravando `auto_daily_enabled`/`auto_started_at` nas configurações da conta + `admin_audit_log`.
- Novo `auto-sales-dialog.tsx` e botão em `influencers-manager.tsx`.
- Teste: comissão diária ≥ R$ 100 e nenhuma venda no futuro.
