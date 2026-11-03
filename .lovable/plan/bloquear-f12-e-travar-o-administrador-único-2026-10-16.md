# Bloquear F12 e travar o administrador único

## O que você vai ver
- **F12 e atalhos de inspeção bloqueados** no site: F12, Ctrl+Shift+I/J/C, Ctrl+U (ver código-fonte) e o clique direito "Inspecionar" deixam de funcionar. Os campos de texto continuam aceitando o clique direito normal (copiar/colar).
- **Administrador único garantido:** já existe hoje uma regra no banco que impede ter dois administradores. Vamos reforçar para que nenhuma tela, função ou usuário (nem influenciador, nem cliente, nem o próprio admin pelo painel) consiga dar ou tirar o acesso de admin. A gestão de usuários continua mexendo só em plano e influenciador.

## Aviso honesto
Bloquear o F12 só atrapalha curiosos: qualquer pessoa com um pouco de conhecimento abre as ferramentas pelo menu do navegador. A proteção de verdade continua sendo do lado do servidor (dados e permissões conferidos lá), que já está ativa.

## Detalhes técnicos
- Novo módulo browser-only montado no `__root` (dentro de `useEffect`, só em produção para não atrapalhar o preview): `keydown` bloqueando F12/Ctrl+Shift+I/J/C/Ctrl+U e `contextmenu` bloqueado fora de inputs/textarea/contenteditable.
- Migration: trigger `BEFORE INSERT OR UPDATE OR DELETE` em `public.user_roles` que recusa qualquer alteração na role `admin` vinda de `authenticated`/`anon` e revoga INSERT/UPDATE/DELETE desses papéis; o índice único `user_roles_single_admin` permanece. Alterações de admin ficam possíveis só por manutenção direta no banco.
- Conferir que nenhuma server function grava em `user_roles`; registrar a regra em `AGENTS.md`.
