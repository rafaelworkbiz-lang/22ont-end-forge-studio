# Gerente aprova o próprio time em "Meu time"

## O que muda
Hoje, em "Meu time", o gerente (ex.: Kaoru) só consegue marcar "Afiliação aprovada". A aprovação final dos links ficava só com o admin. Agora o gerente faz tudo do time dele:

- **Afiliação pedida** → botão **Aprovar afiliação** (já existe, só ajusto o texto).
- **Links enviados para revisão** → o gerente vê o link Mensal e o Vitalício do membro, com **Aprovar links** (conta fica ativa) e **Recusar** (pede o motivo; o membro vê o motivo na tela de cadastro dele).
- Aviso no topo de "Meu time": "X pessoas aguardando sua aprovação".
- O admin continua podendo aprovar também, por Influenciadores e Gerentes.
- Cada aprovação/recusa do gerente fica no Histórico, com o nome dele.

## Segurança
- O gerente só aprova membros do **próprio time** (conferido no servidor pela sessão dele).
- Influenciadores sem time continuam sendo aprovados só pelo admin.

## Detalhes técnicos
- Novas server functions em `teams.functions.ts`: `managerApproveLinks` e `managerRejectMember`, reutilizando a regra de etapas já testada da aprovação do admin; verificam `times.gerente_id` = influenciador da sessão e `influenciadores.time_id`.
- `my-team.tsx`: mostrar links e botões por status; contador de pendentes.
- Teste: gerente não pode aprovar membro de outro time; aprovação só na etapa certa.
