# Gerenciar Usuários funcional

## O que você vai ver
Ao clicar em "Gerenciar Usuários" no menu lateral, abre uma tela completa (não mais um aviso) com:

- **Lista de usuários** com: nome, Gmail, número de WhatsApp (com o ícone do WhatsApp — ao clicar abre a conversa direto no WhatsApp), plano (**Mensal** ou **Vitalício**), status da assinatura (**Ativa**, **Vencida**, **Cancelada**), data de vencimento (só no mensal) e um selo **Influenciador** quando marcado.
- **Busca** por nome, e-mail ou número e **filtros** por plano, status e influenciador.
- **Resumo no topo**: total de usuários, mensais, vitalícios, influenciadores, assinaturas ativas.
- **Botão "Criar usuário"**: abre um formulário com nome, Gmail, WhatsApp (com DDD), plano Mensal ou Vitalício, e a opção "Marcar como influenciador". No mensal, o vencimento é calculado automaticamente para 30 dias.
- **Ações por usuário**: editar, renovar mais 30 dias (mensal), mudar plano, marcar/desmarcar influenciador, cancelar assinatura e remover.
- Os dados ficam **salvos de verdade** (não somem ao recarregar), usando o Lovable Cloud.

O papel de influenciador fica guardado separadamente, pronto para as funções extras que você vai explicar depois.

## Observação
Neste passo os usuários são cadastros gerenciados pelo admin; ainda não haverá tela de login para eles. Isso pode ser ligado depois junto com a cobrança.

## Detalhes técnicos
- Ativar Lovable Cloud.
- Tabela `members` (name, email, whatsapp em dígitos, plan `monthly|lifetime`, status `active|expired|cancelled`, expires_at, created_at) e tabela separada `member_roles` (member_id, role `influencer`) — papéis nunca na mesma tabela.
- Migration com GRANTs + RLS; acesso via server functions em `src/lib/members.functions.ts` (listar, criar, atualizar, renovar, alternar influenciador, remover) validadas com zod. Sem login ainda, as funções ficam abertas — quando entrar o login de admin, serão protegidas por papel admin.
- Status "Vencida" calculado quando expires_at < hoje.
- Link do WhatsApp: `https://wa.me/55{digitos}`.
- Novo componente `src/components/users-manager.tsx` renderizado pela view "Gerenciar Usuários" em `affiliate-dashboard.tsx`, com estilo da paleta dourada; TanStack Query para carregar/atualizar.
- Atualizar `/docs`, `roadmap.md` e `AGENTS.md`.
