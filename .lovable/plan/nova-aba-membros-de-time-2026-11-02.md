# Nova aba "Membros de time"

## O que muda
1. **Nova aba "Membros de time"** na Administração, ao lado de Influenciadores.
   - No topo, uma lista para escolher o gerente (opção inicial "Todos os gerentes").
   - Ao escolher, mostra só os membros do time daquele gerente: nome, e-mail, status do cadastro (aguardando, links enviados, ativo, recusado...) e os links Mensal/Vitalício quando enviados.
   - Mantém as mesmas ações de aprovar/recusar e editar que já existem hoje para esses membros.
   - O gerente escolhido fica salvo no endereço, então continua o mesmo se você recarregar a página.
2. **Influenciadores:** quem faz parte de um time deixa de aparecer nessa aba (com o status também). Lá ficam só gerentes e influenciadores sem time.

## Detalhes técnicos
- Reaproveitar `listInfluencers` (já traz `gerente_id`, `is_gerente`); sem mudança no banco.
- `influencers-manager.tsx`: filtrar `!gerente_id`.
- Novo `team-members-manager.tsx` com dropdown de gerentes (`is_gerente`) e lista filtrada por `gerente_id`, reutilizando `ReviewButtons` e a janela de edição (exportados).
- `admin-hub.tsx`: nova aba `?aba=times-membros`; filtro do gerente em `?gerente=`.
