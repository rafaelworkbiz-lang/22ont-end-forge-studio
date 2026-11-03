## Criar acesso para brunohenr27@gmail.com

Plano: **Vitalício** (sem vencimento), igual aos acessos anteriores.

Passos:
1. Conferir se o e-mail já tem conta e plano.
2. Se não tiver conta: criar a conta já confirmada, com senha própria e aleatória (nunca uma senha compartilhada).
   Se já tiver conta: trocar a senha antiga por uma nova, só dele.
3. Ativar o plano Vitalício sem data de vencimento (se ele tiver um plano Mensal, ele vira Vitalício).
4. Testar o login com a senha nova.
5. Enviar para você o link de entrada, o e-mail e a senha, com o pedido para ele trocar a senha em Meu Perfil.

### Detalhes técnicos
- Usar a área de administração de contas no servidor, com e-mail em letras minúsculas.
- Fazer upsert em customer_access com plan=lifetime, status=active, expires_at=null.
- Não salvar a senha em código, registros ou memória.
