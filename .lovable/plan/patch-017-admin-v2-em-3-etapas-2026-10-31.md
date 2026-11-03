# PATCH-017 · Admin v2 — em 3 etapas

O patch é grande, então vou entregar uma etapa por vez, com relatório e testes ao fim de cada uma. Não mexe na página inicial nem nas lojas públicas.

## Etapa 1 — Limpeza, Usuários e Influenciadores (esta entrega)
1. **Remover** "adicionar saldo", "vendas no automático", "até 10 mil vendas" e "comissão ilustrativa". Vendas inventadas já gravadas ficam marcadas como fictícias e somem de todos os painéis e relatórios (guardadas só como histórico).
2. **Novo menu do admin:** Visão geral, Usuários, Influenciadores, Gerentes, Assinaturas, Recuperação, Cupons, Histórico, Configurações (Gerentes/Recuperação aparecem com aviso "na próxima etapa" até lá). Bloco amarelo em cada aba; editar/detalhar sempre em janela; busca, filtros e 25 linhas por página.
3. **Usuários:** só clientes. Colunas e filtros do patch; editar nome, e-mail, telefone (+55), plano/validade, conta de teste. Ações: editar, tornar influenciador, bloquear, reenviar convite, WhatsApp. Tudo grava no Histórico.
4. **Configurações do admin:** comissão do influenciador (30%), domínios de checkout aceitos, links padrão Mensal/Vitalício, modelos de WhatsApp.
5. **Influenciadores:** cadastro próprio (código, status, e-mail/id na Applyfy, links Mensal/Vitalício, gerente). Os influenciadores atuais são migrados. Lista com vendas, bruto e comissão do mês; janela com Dados, Cadastro, Vendas, Histórico.
6. **Vendas reais:** só o webhook da Applyfy grava vendas (ninguém pela tela). Comissão = bruto × % gravado na venda; reembolso/chargeback estorna; mesmo evento duas vezes = uma venda. O influenciador vê vendas, bruto e comissão por dia/semana/mês.
7. **Página do influenciador** `afiliaplace.site/{codigo}`: mesma página de vendas com os links de checkout dele (só se ativo); código inválido = página padrão. Código guardado por 30 dias; troca de código redireciona o antigo por 90 dias. A página `/r234` vira o primeiro caso desse modelo.

## Etapa 2 — Cadastro guiado, Gerentes e Meu time
Passo a passo em tela cheia (6 passos, painel bloqueado até ativo), validação dos links, Configurações › Links e convites com QR, tag de gerente, times, aba Meu time, convites `/convite/{codigo}` (única exceção ao cadastro fechado, com limite por IP e anti-robô), aba Gerentes e regras de acesso entre times.

## Etapa 3 — Assinaturas, Recuperação e Visão geral
Contadores de vencimento, ações de renovação/extensão, tarefa diária 06:00 (vencer, pausar lojas, renovar ao pagar), e-mails de aviso, aba Recuperação com botão de WhatsApp manual, "não contatar mais", limpeza após 90 dias, e números da Visão geral.

## Decisões que preciso de você (posso começar sem elas)
1. A comissão de afiliado na Applyfy está em 30%? (o painel só mostra; quem paga é a Applyfy)
2. Qual campo do webhook identifica o afiliado e quais eventos ela envia (recusado, Pix/boleto pendente, abandono)? Até saber, ligo pelo e-mail do afiliado e deixo a venda "sem influenciador" se não bater.
3. Convite de gerente cria influenciador direto (admin aprova no passo 6)? Vou assumir que sim.
4. Bônus AfiliaPlace e conta demonstração: um, os dois ou nenhum? Vou deixar de fora até você decidir.
5. Convite: 50 usos / 90 dias? Vou assumir que sim.

## Detalhes técnicos
- Novas tabelas: `config_admin`, `influenciadores`, `vendas_influenciador` (insert só por service role no webhook, chave única `applyfy_pedido_id`), `codigos_redirect`; coluna `ficticio` nos registros de demonstração atuais (`test_balance_*`, `influencer_demo_*`); `demo_commission_percent` marcada como DEPRECATED, não apagada.
- Migração dos influenciadores a partir de `member_roles`; RLS: influenciador lê só o próprio; admin via `has_role`; escrita só por server functions com `requireAdmin` + `admin_audit_log`.
- Leitura pública da página `/{codigo}` por função security definer que retorna só código e links de quem está ativo; rota `$codigo` checa a lista de reservados antes.
- Webhook Applyfy existente estendido para gravar/estornar vendas de forma idempotente.
- Testes novos para cálculo de comissão, estorno, idempotência e validação de código.
