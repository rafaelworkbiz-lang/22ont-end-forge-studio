## Excluir conta do influenciador (menu ⋯)

### O que muda na tela
- No menu ⋯ de cada influenciador (abas Influenciadores, Membros de time e Gerentes) aparece um novo item vermelho no final: **Excluir conta** — "Apaga o login e todos os dados dele".
- Ao clicar abre uma janela de confirmação (estilo das outras janelas): mostra nome e e-mail, avisa que não dá para desfazer e exige digitar **EXCLUIR** para liberar o botão.
- Depois de excluir, a pessoa some da lista e aparece o aviso "Conta excluída".

### Regras
- Só a administração pode excluir.
- Não é possível excluir a conta do administrador nem a própria conta.
- Se a pessoa for gerente com membros no time, os membros continuam com as contas deles e passam a ficar "sem time" (usando os links padrão da plataforma).
- A exclusão fica registrada no histórico da administração.
- O login some de verdade: o e-mail fica livre para um novo cadastro.

### Detalhes técnicos
- Nova server function `deleteInfluencerAccount` (requireAdmin) em `src/lib/influencers.functions.ts`: verifica que o alvo não tem papel admin em `user_roles` e não é o próprio chamador; grava `admin_audit_log`; desvincula membros do time (times/influenciadores do gerente), apaga `influenciadores`, `member_roles`, `members`, lojas e lotes demonstrativos do usuário, arquivos do bucket `avatars/${userId}`, e por fim `auth.admin.deleteUser`.
- `influencers-manager.tsx`: item no DropdownMenu + AlertDialog com campo de confirmação; invalida a query da lista.
- Teste pequeno da regra "não excluir admin nem a si mesmo" extraída como função pura.
