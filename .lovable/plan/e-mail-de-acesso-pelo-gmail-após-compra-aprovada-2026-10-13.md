# E-mail de acesso pelo Gmail após compra aprovada

## O que muda
- Conectar a sua conta Gmail ao projeto; os e-mails de acesso saem dela.
- Quando a Applyfy confirmar uma compra aprovada (Mensal ou Vitalício), o cliente recebe no e-mail da compra uma mensagem AfiliaPlace com:
  - link de entrada (https://afiliaplace.site/auth)
  - login (o e-mail da compra)
  - senha própria, gerada só para ele (fácil de digitar, 12 caracteres, nunca a mesma para dois clientes)
  - aviso para trocar a senha em Meu Perfil
- Cliente que já tinha conta: a senha dele é mantida e o e-mail só avisa que o plano foi liberado, com o link de entrada.
- Pagamento recusado, pendente, cancelado ou reembolsado: nenhum e-mail com senha.
- Avisos repetidos da Applyfy não geram nova senha nem novo e-mail.
- Remover o botão "Primeiro acesso (já comprei)" da tela de login; "Esqueci minha senha" continua.

## Observações
- O Gmail limita cerca de 500 envios por dia e o remetente será o seu endereço pessoal. O domínio notify.afiliaplace.site já configurado é uma alternativa com remetente da marca, se preferir depois.
- Se o envio falhar, o acesso continua liberado e a falha aparece na aba Assinaturas do admin; o cliente pode usar "Esqueci minha senha".

## Detalhes técnicos
- Ligar o conector Gmail (gmail.send) e enviar pelo gateway dentro do webhook `src/routes/api/public/applyfy-webhook.ts` e do caminho de compatibilidade `applyfy-fallback.server.ts`, só quando a conta for criada agora (`created`) ou já existente com plano novo.
- Senha gerada com `crypto.getRandomValues`, usada apenas em `createUser` e no corpo do e-mail; nunca em logs, respostas ou banco.
- Mensagem RFC 2822 em HTML+texto, assunto com codificação UTF-8, base64url.
- Idempotência: só envia quando o recibo do evento é "owned" e a conta foi criada nesse processamento; no fallback, só quando `createUser` criou a conta.
- Remover o fluxo "Primeiro acesso" de `src/components/auth-screen.tsx`.
- Testes: compra aprovada nova envia 1 e-mail com senha individual; conta existente envia sem senha; reembolso não envia; duplicado não envia; falha no Gmail não bloqueia o acesso.
