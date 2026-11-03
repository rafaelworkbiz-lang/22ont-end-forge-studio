# Voltar o "Adicionar vendas" para os usuários

## O que você vai ter
- **Onde fica:** em Administração › Usuários, cada pessoa ganha um botão **"Adicionar vendas"**.
- **Como funciona:** você escolhe quantas vendas (de 1 a 500) e o dia. Por padrão é hoje, e dá para escolher até 30 dias para trás.
- **O que é gerado:**
  - Os produtos são sorteados da aba Produtos validados.
  - Os horários ficam espalhados pelo dia.
  - Hoje, só até a hora atual; os horários que ainda não chegaram continuam como "Ainda não chegou".
- **Onde aparece:** só no painel da própria pessoa (Início: gráfico, resumo e filtros de período), como funcionava antes. A comissão usa o percentual que já existe na conta dela; se não tiver, fica em 10%.
- **Onde não aparece:** métricas e relatórios do admin, Assinaturas, Recuperação e a página ao vivo.
- **Desfazer:** a mesma janela lista os lotes já lançados, com um botão **"Remover"** em cada um.
- **O que não volta:** as vendas automáticas por dia e o saldo, como você escolheu.

## Regras
- **Quem usa:** só o admin lança e remove, e cada ação fica no Histórico.
- **Sem repetir:** cada lote tem um código próprio, então clicar duas vezes não duplica vendas.
- **Conta de teste:** ela também pode receber vendas.

## Detalhes técnicos
- **Banco:** reaproveitar `test_balance_entries` com chave `manual:<uuid>` e `ficticio = true`. Não precisa mudar a estrutura, só atualizar os comentários de "DEPRECATED".
- **Servidor:**
  - novo `addManualSales({ user_id, quantidade, dia })` com `requireAdmin`
  - ele sorteia produtos de `produtos_cache` (validados) e gera os eventos pelo `demo-engine`
  - também gravo `admin_audit_log`
  - mais `listManualSales(user_id)` e `removeManualSales(batch_key)`
- **Painel:**
  - `getDemoOverview` deixa de estar desligado
  - passa a ler só os lotes `manual:*` do próprio usuário (qualquer conta com acesso, não só influenciadores)
  - ignora as configurações automáticas
- **Tela:** janela em `users-manager` com quantidade, dia e a lista de lotes.
- **Teste:**
  - gera exatamente N vendas
  - nenhuma venda depois da hora atual quando o dia é hoje
  - remover o lote zera as vendas
