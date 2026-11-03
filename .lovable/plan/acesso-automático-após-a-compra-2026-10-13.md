# Acesso automático após a compra

## O que será alterado
- Remover o botão “Primeiro acesso (já comprei)” e os textos específicos desse fluxo, mantendo Entrar, Criar conta e Esqueci minha senha.
- Após a confirmação de uma compra aprovada pela Applyfy, liberar o plano correspondente e enviar ao e-mail da compra uma mensagem AfiliaPlace com o endereço de acesso e o login.
- Para novos compradores, enviar uma senha temporária exclusiva por cliente e exigir sua troca no primeiro login. Não utilizar uma senha compartilhada nem a senha do administrador.
- Para compradores que já possuem conta, preservar a senha existente e enviar a confirmação de acesso com o link para entrar e recuperar a senha, se necessário.
- Não enviar credenciais ou liberar acesso para pagamentos pendentes, recusados, cancelados ou reembolsados.

## Pré-requisito
Não há domínio de envio configurado, conforme a verificação realizada. Configurar o e-mail da AfiliaPlace pelo diálogo de configuração; os envios começam após a verificação do domínio. Não remover o caminho atual de primeiro acesso antes de o novo envio estar operacional.

## Detalhes técnicos
- Integrar o envio gerenciado do Lovable ao processamento da Applyfy, após confirmação da liberação do plano, contemplando também o caminho de compatibilidade existente.
- Verificar a disponibilidade dos registros de processamento e garantir controle durável de reenvios antes de ativar a entrega automática; notificações repetidas não devem redefinir senhas ou estender o plano novamente.
- Usar o serviço gerenciado de e-mail, sem criar fila ou tabelas de e-mail. Tratar falhas de envio sem desfazer o acesso já concedido e respeitar bloqueios de entrega.
- Guardar a exigência de troca de senha em estado controlado pelo servidor e impedir acesso às funções protegidas até concluir a troca; não depender apenas da tela.
- Nunca salvar ou registrar senhas em código, histórico de pagamentos, logs ou memória do projeto.

## Validação
- Testar compra aprovada de cliente novo, compra de conta existente, notificações duplicadas, falha de envio e pagamento recusado.
- Conferir o recebimento em um endereço autorizado e o fluxo completo: e-mail recebido, login, troca da senha temporária e acesso ao plano.
- Confirmar que contas existentes, administrador e influenciadores não têm suas senhas ou permissões alteradas.