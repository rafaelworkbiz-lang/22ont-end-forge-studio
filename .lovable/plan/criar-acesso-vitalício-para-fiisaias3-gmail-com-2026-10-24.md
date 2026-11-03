# Criar acesso Vitalício para fiisaias3@gmail.com

- Conferir se já existe login ou cadastro com esse e-mail.
- Se não existir: criar o login com e-mail já confirmado e uma senha própria e aleatória, só dele.
- Se já existir: confirmar o e-mail e trocar a senha por uma nova, só dele.
- Cadastrar ou atualizar o plano como Vitalício ativo, sem vencimento.
- Testar se a nova senha entra na conta.
- Passar para você o link https://afiliaplace.site/auth, o e-mail e a senha, para você enviar a ele.

## Detalhes técnicos
- O login é criado pelo endpoint administrativo do auth, e o plano fica no cadastro de membros: plano lifetime, status active e expires_at nulo.
- Nenhuma senha é salva no código, nos registros ou na memória.
