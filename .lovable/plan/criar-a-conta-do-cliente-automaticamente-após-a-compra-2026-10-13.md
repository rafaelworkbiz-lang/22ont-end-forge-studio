# Criar a conta do cliente automaticamente após a compra

## O que foi conferido
- O aviso da Applyfy chegou e funciona: o e-mail rafael.workbiz@gmail.com foi registrado com plano Mensal ativo (até 12/12/2026).
- Esse cliente NAO tem conta de login. Hoje o aviso só libera o plano; não cria usuário nem senha.
- Não existe senha padrão no sistema. O cliente precisa criar a conta na tela de cadastro com o mesmo e-mail.

## Sobre a senha padrão #Place@123
Não vou usar uma senha igual para todos. Quem soubesse o e-mail de um comprador poderia entrar na conta dele, inclusive na conexão com o Mercado Livre. Em vez disso:

1. Quando a compra for aprovada, o sistema cria a conta do cliente automaticamente (e-mail confirmado, já com o plano liberado), com uma senha aleatória que ninguém conhece.
2. O cliente entra pela opção "Primeiro acesso" na tela de login: digita o e-mail da compra e recebe o link para escolher a própria senha.
3. Quem já tem conta continua entrando normalmente; compras novas só renovam o plano.

## Mudanças
- Aviso da Applyfy (`src/routes/api/public/applyfy-webhook.ts`): após liberar o plano, criar o usuário se ainda não existir (sem duplicar, mesmo com avisos repetidos). Reembolso/cancelamento seguem só bloqueando o plano.
- Tela de login (`src/components/auth-screen.tsx`): botão "Primeiro acesso / criar minha senha" que envia o link de definição de senha para o e-mail da compra, usando a tela de redefinição que já existe.
- Tela "Seu plano expirou" e mensagens: orientar quem comprou a usar "Primeiro acesso".
- Teste automatizado do aviso: compra nova cria usuário e plano; repetição não duplica; reembolso bloqueia.

## Detalhes técnicos
- Criação do usuário via cliente administrativo do backend, dentro do handler, após validar o token do aviso.
- Senha aleatória gerada no servidor, nunca registrada em log nem devolvida na resposta.
- Link de senha usa o envio padrão de recuperação do backend; o e-mail enviado depende da entrega de e-mails da conta.
- O cliente de Rafael pode ser corrigido na hora: criar a conta dele e enviar o primeiro acesso.
