# Conta de teste de cliente para validar o PATCH-001.1

## 1. Conta de teste
- Criar o login `teste@afiliaplace.com.br` já confirmado (sem envio de e-mail), com uma senha forte exclusiva que entrego em particular.
- Cadastro de assinante com plano **Mensal** ativo por 30 dias, liberado manualmente. Nada passa pela Applyfy e nenhum pagamento é disparado.
- Novo campo **"é teste"** no cadastro de assinantes (padrão: não). Só essa conta é marcada como teste.
- Nenhuma tag, conexão do Mercado Livre ou publicação é criada. As 7 contas reais não são tocadas.

## 2. Contas de teste fora das métricas
- **Gerenciar Usuários:** a conta continua listada (para você poder renovar ou apagar) com um selo "Teste", mas fica fora dos contadores (Usuários, Mensais, Vitalícios, Assinaturas ativas).
- **Assinaturas:** fica fora da lista de assinantes e da contagem.
- Os outros relatórios do admin que somam assinantes seguem a mesma regra.

## 3. Como você vai entrar
1. Abrir `https://afiliaplace.site/auth` (ou o preview) e entrar com o e-mail de teste e a senha que vou passar.
2. Ir em **Integrações → Conectar com Mercado Livre** e autorizar com a SUA conta.
3. Não mexer na tag e me avisar quando estiver conectado.

## 4. Depois que você conectar (próxima etapa, em sessão separada da sua)
Vou entrar como a conta de teste (com sua autorização no aviso de acesso) e reportar item a item:
- O aviso da tag aparece uma vez; "Confirmar minha tag" libera Copiar e Publicar sem recarregar; fechar o aviso deixa a faixa fina.
- Copiar link no computador e no celular (390px): o link tem a tag e o domínio mercadolivre.com.br.
- "Marcar como publicado": grava, o selo "No perfil" aparece e continua depois de recarregar.
- Isolamento: com as sessões de teste e de admin separadas, o admin não vê as publicações da conta de teste. Confiro pela tela e por consulta direta com a sessão do admin.
- Foto de perfil: enviar, trocar e apagar na conta de teste.

## Detalhes técnicos
- Migração: `ALTER TABLE public.members ADD COLUMN is_test boolean NOT NULL DEFAULT false;`
- Criação do usuário via cliente administrativo do servidor (script único `auth.admin.createUser` com `email_confirm: true`). A linha em `members` (plan monthly, status active, expires_at +30d, is_test true) entra pela ferramenta de dados, sem `user_roles` nem `member_roles`.
- Filtros: `users-manager.tsx` calcula os contadores sobre `members.filter(m => !m.is_test)` e mostra o selo; `subscriptions.functions.ts` adiciona `.eq('is_test', false)` na lista e na contagem de assinantes; `Member` ganha `is_test`.
- Testes: um teste unitário para a regra "contas de teste não contam nos totais" (função pura de contagem extraída para `src/lib/member-stats.ts`).
- Na etapa 4, a sessão de teste é aberta com `lovable auth-session --user <uuid da conta de teste>`, que pede sua aprovação.
