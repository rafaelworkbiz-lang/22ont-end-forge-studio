# Página do link de convite: cadastro completo + explicação

## O que muda (página que abre ao clicar no link de convite)
1. **Campos obrigatórios, nesta ordem:**
   - Foto de perfil (toque para escolher; aparece a prévia redonda)
   - Nome e Sobrenome lado a lado (ex.: Rafael | Mathias)
   - Gmail (e-mail)
   - WhatsApp (com DDD)
   - Senha e Confirmar senha (mínimo 8 caracteres, com olho para mostrar)
   - Aceite dos termos (continua)
2. **Sem e-mail de confirmação:** remove o aviso "Você vai receber um e-mail…". A conta é criada já com a senha escolhida e a pessoa entra direto no painel, onde segue o passo a passo de influenciador.
3. **Blocos explicativos abaixo do formulário** (3 cartões):
   - "Você divulga" — compartilha seus links de checkout Mensal e Vitalício.
   - "Alguém compra" — a Applyfy registra a venda no seu link.
   - "Você ganha %" — comissão inicial de 50%, podendo ser negociada com a administração; pagamento feito pela Applyfy.

## Observação de segurança
Como não haverá e-mail de confirmação, o endereço digitado não é verificado. Os limites que já existem continuam valendo: validade do convite, número de usos e cinco cadastros por hora por conexão.

## Detalhes técnicos
- `acceptInvite`: novos campos `sobrenome`, `senha` (8–72) e `foto` (data URL, jpg/png/webp, até 2 MB). Troca `inviteUserByEmail` por `auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { avatar_path } })`; envia a foto para o bucket `avatars` em `${userId}/avatar-*.ext`; `members.name` = nome + sobrenome; WhatsApp normalizado com `normalizeWhatsapp`. Se algo falhar depois de criar a conta, a conta é apagada.
- Cliente: após `ok`, `supabase.auth.signInWithPassword` e navega para `/painel`.
- Atualizar a regra do AGENTS.md sobre o e-mail do convite confirmar o endereço.
- Teste: validação do formulário (senhas diferentes, foto ausente).
