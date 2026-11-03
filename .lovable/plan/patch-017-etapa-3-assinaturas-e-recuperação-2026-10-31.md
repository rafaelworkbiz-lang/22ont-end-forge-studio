# PATCH-017, Etapa 3: Assinaturas e Recuperação

## 1. Aba Assinaturas vira o painel de vencimentos
- **No topo, 4 contadores que funcionam como filtro ao clicar:** Vencem em 7 dias · Vencem hoje · Vencidas (últimos 30 dias) · Vitalícios ativos.
- **Na lista:** cliente, plano, status, início, vencimento, dias para vencer, último pagamento, forma de pagamento e ações.
  - O Vitalício aparece como "Sem vencimento".
  - Os dias para vencer ficam negativos quando a assinatura já venceu.
  - A forma de pagamento só aparece se a Applyfy informar.
- **Ordem:** o vencimento mais próximo aparece primeiro.
- **Cores:** verde para ativa, âmbar para quem vence em até 7 dias, vermelho para vencida e cinza para cancelada.
- **Ações:**
  - WhatsApp com a mensagem de renovação pronta
  - copiar o link de renovação
  - estender a validade, com motivo registrado no Histórico
  - ver o histórico de pagamentos (o que já recebemos da Applyfy)
- **Sobre "influenciador de origem":** essa coluna fica de fora. Hoje a Applyfy não nos diz por qual influenciador o cliente comprou, e você pediu para não contarmos vendas por influenciador.

## 2. Rotina diária às 06:00 (horário de Brasília)
- O Mensal com vencimento antes de hoje passa a **vencido**. Com isso as lojas do cliente são pausadas (regra que já existe) e entra um item na Recuperação com o motivo "assinatura vencida".
- O cliente vencido vê no painel: "Sua assinatura venceu — renove para reativar suas lojas", com o botão de renovar.
- **Quando o pagamento é aprovado:** a validade é renovada, as lojas voltam e o item da Recuperação fecha como "recuperado".
- **E-mails de aviso:** 3 dias antes, no dia e 1 dia depois do vencimento, sem repetir. Eles só saem de verdade quando o domínio de envio estiver verificado. Até lá, ficam registrados como "não enviado".
- O Vitalício nunca vence.
- A rotina também fecha como "perdido" os itens sem ação há 30 dias e apaga os dados de quem não comprou depois de 90 dias.

## 3. Nova aba Recuperação
**De onde vêm os contatos:**
- **Checkout da Applyfy:** pagamento recusado, Pix ou boleto gerado e não pago, e carrinho abandonado, se a Applyfy enviar esse aviso. Só entra o que chegar pela Applyfy, nada é capturado por fora.
- **Cadastro parado:** conta de influenciador criada que não terminou o passo a passo em 48 horas.
- **Assinatura vencida:** vem da rotina diária.

**Lista:**
- **Colunas:** nome, telefone, origem, motivo, plano/valor, quando, status e quem contatou.
- **Status:** novo → contatado → recuperado ou perdido.
- **Filtros:** origem, status e período.
- A mesma pessoa (mesmo e-mail ou telefone) aparece numa linha só, com o histórico de tentativas.

**Botão WhatsApp:**
- Abre o WhatsApp com a mensagem pronta do motivo.
- Os modelos ficam editáveis em Configurações e podem usar {nome}, {plano}, {valor} e {link}. O {link} é o checkout padrão do plano.
- Ao clicar, o item é marcado como contatado, com data e quem clicou.
- O envio é sempre manual, pelo seu próprio WhatsApp.

**Outras regras:**
- **"Não contatar mais":** a pessoa some da lista para sempre.
- **Pagamento aprovado** do mesmo e-mail ou telefone fecha o item como recuperado, guardando quanto tempo levou.
- **Política de Privacidade:** ganha a frase de que o contato pode ser feito por WhatsApp para concluir a compra.

## Ponto em aberto
Ainda não temos exemplos reais dos avisos da Applyfy para pagamento recusado, Pix/boleto pendente e abandono. O sistema vai reconhecer pelos nomes mais comuns (refused, pending, waiting_payment, abandoned). Se a Applyfy usar outros nomes, esses casos não entram até a gente ajustar.

## Detalhes técnicos
- **Migração:**
  - `recuperacao`: id, origem, motivo, nome, email, telefone, plano, valor, forma, member_id, status, responsavel, contatado_em, tentativas jsonb, recuperado_em, criado_em, atualizado_em, com índice único parcial por (email ou telefone) para itens abertos
  - `nao_contatar`: email ou telefone
  - `avisos_vencimento`: member_id, tipo d-3/d0/d+1, vencimento, enviado
  - em `members`: `ultimo_pagamento_em`, `forma_pagamento`
  - em `applyfy_events`: `forma_pagamento`, `telefone`, `nome`, `valor`
  - todas com grants só para `service_role`, RLS ligado e sem acesso pelo navegador
  - SQL `rotina_vencimentos()` (security definer) que marca vencidos, chama `sincronizar_lojas_assinatura`, cria itens de recuperação, marca perdidos em 30 dias e faz o expurgo de 90 dias
- **Webhook:** o parser passa a extrair telefone, nome, valor e forma de pagamento e a classificar os eventos pendente/recusado/abandono como `recovery`. O `finish` registra recuperação e, no grant, grava `ultimo_pagamento_em` e fecha a recuperação como recuperado.
- **Rota `/api/public/jobs/subscriptions-daily`:**
  - usa `authenticateCronRequest`
  - chama a RPC `rotina_vencimentos`
  - cria itens de cadastro parado há 48h
  - envia e-mails de aviso pelo template `subscription-reminder`, com dedupe em `avisos_vencimento`
  - agendamento via `supabase--create_http_schedule` com o cron `0 9 * * *` (06:00 BRT)
- **Server fns (`requireAdmin`):**
  - `getSubscriptionsBoard` com contadores e linhas
  - `extendSubscription({ member_id, dias, motivo })` com auditoria
  - `listRecovery`, `markContacted`, `setRecoveryStatus` e `doNotContact`
- **Configurações:** modelos `recuperacao_*` e `renovacao` no `modelos_whatsapp`.
- **Painel do cliente:** faixa de "assinatura vencida" para quem tem acesso negado por vencimento ou tem loja pausada pelo sistema.
- **Testes puros:**
  - classificação dos dias para vencer e da cor
  - montagem da mensagem com variáveis
  - classificação de evento como recuperação
  - "Vitalício nunca vence"
- Ao final: typecheck, testes, conferência na tela das duas abas e relatório. A Visão geral (item 19) não volta, porque você pediu para tirar.
