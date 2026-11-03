# Botões para aprovar o cadastro do influenciador

Hoje, para liberar quem enviou os links, é preciso abrir "Editar" e trocar a situação na mão. Não existe um botão "Aprovar", e na janela do time do gerente não aparece opção nenhuma.

## O que muda
- **Administração › Influenciadores:** cada pessoa mostra um botão conforme a etapa em que está:
  - "Afiliação pedida": **Aprovar afiliação** (libera o passo de colar os links).
  - "Links enviados": mostra os dois links e o código, com **Aprovar links** (a conta fica Ativa) e **Recusar** (pede o motivo, que aparece para a pessoa na tela de cadastro).
- **Administração › Gerentes:** na janela do time, os membros têm os mesmos botões, para aprovar quem entrou pelo convite do gerente.
- Um filtro rápido "Aguardando aprovação" mostra só quem precisa de ação.
- Toda aprovação ou recusa fica registrada no Histórico.
- Só o admin aprova. O gerente continua vendo a situação do time, mas não aprova.

## Detalhes técnicos
- Nova server function `adminReviewOnboarding({ id, acao: "aprovar_afiliacao" | "aprovar_links" | "recusar", motivo? })` com requireAdmin, validando a etapa atual (afiliacao_pedida → afiliacao_aprovada; links_enviados → ativo; recusar → recusado + motivo_recusa), com auditoria em admin_audit_log.
- Botões em `influencers-manager.tsx` e na lista de membros de `managers-manager.tsx`; filtro de status por "pendentes".
- Teste para a regra de transição (só avança da etapa certa).
