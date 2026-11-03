# PATCH-017, Etapa 2: cadastro do influenciador, Gerentes e Meu time

Este plano já leva em conta o que você decidiu nas últimas mensagens:
- O AfiliaPlace não conta vendas.
- A comissão é combinada, começando em 50%.
- Não pedimos e-mail nem ID da Applyfy.
- Os links padrão são os novos que você mandou.

## 1. Passo a passo do influenciador (tela cheia)
Abre no login de quem tem a tag de influenciador e ainda não está ativo. Enquanto não terminar, o menu do painel fica com cadeado e a mensagem "Conclua seu cadastro de influenciador para liberar".

1. **Criar conta na Applyfy:** botão "Abrir Applyfy" com o link de cadastro padrão. Depois, "Já criei minha conta".
2. **Pedir afiliação:** botões para o Mensal e para o Vitalício. Se a pessoa veio por convite de gerente, aparece o link do gerente. Depois, "Já pedi a afiliação".
3. **Aguardar aprovação:** tela de espera. O admin, ou o gerente do time, marca "Afiliação aprovada".
4. **Onde pegar os links:** instrução Applyfy › Meus produtos › Afiliações › Ofertas.
5. **Colar os links e escolher o código:** valida o domínio da Applyfy, exige Mensal diferente de Vitalício, não aceita os links padrão nem os de outros influenciadores, e o código precisa ser único.
6. **Revisão:** prévia de afiliaplace.site/{codigo} e "Testar meus links". O admin aprova e a conta é liberada.

A pessoa pode voltar a qualquer passo. Se o admin recusar, o motivo aparece na tela dela.

## 2. Configurações › Links e convites (só influenciadores)
- Mostra o código e o endereço afiliaplace.site/{codigo}, com botão de copiar e QR Code.
- Mostra os links de checkout. Para trocar, a pessoa pede e o admin aprova.
- Gerentes têm um atalho para Meu time.

## 3. Meu time (só gerentes)
- **Primeiro uso:** o gerente configura o link de afiliação dele (obrigatório), o nome do time e uma mensagem de boas-vindas.
- **Depois:**
  - link de convite, com copiar, QR Code e WhatsApp
  - lista do time com nome, código, status do cadastro, último acesso e links (só leitura)
  - botão "Afiliação aprovada" para os membros do time
- "% do gerente" é só um campo de anotação. O sistema não calcula nem paga.

## 4. Convites (afiliaplace.site/convite/{codigo})
- A tela diz "Você foi convidado por {gerente} para o time {time}" e tem um formulário: nome, e-mail, WhatsApp, senha e aceite dos termos.
- O servidor confere:
  - se o convite está ativo, dentro da validade (90 dias) e do limite de usos (50)
  - no máximo 5 cadastros por internet (IP) por hora
- A pessoa precisa confirmar o e-mail antes de entrar.
- A conta nasce como influenciadora, já ligada ao time. Cada uso fica registrado com data, IP e conta, e vai para o Histórico.
- Gerente e admin podem ativar ou desativar o convite, mudar limite e validade e gerar um código novo (o antigo para de funcionar).
- É a **única** forma de criar conta fora da compra. O cadastro continua fechado para todo o resto.
- **Captcha:** o PATCH pede o Cloudflare Turnstile, que precisa de uma chave sua. Fica de fora por agora, com a proteção por IP e a confirmação de e-mail no lugar. Dá para ligar depois.

## 5. Aba Gerentes (admin)
- **Lista:** gerente, nome do time, membros ativos e em cadastro, convite ativo e quantos usos teve.
- **Janela do gerente:** membros, link do gerente, convites e trocar o time de um influenciador. O admin vê e edita tudo.

## Detalhes técnicos
- **Migração:**
  - `times` (gerente_id PK → influenciadores.id, nome, mensagem_boas_vindas, link_coproducao, percentual_gerente_info)
  - `convites` (id, codigo único, gerente_id, ativo, limite_usos 50, usos 0, expira_em +90d)
  - `convite_usos` (convite_id, user_id_criado, ip, criado_em)
  - `cadastro_rate` (ip, janela, contagem)
  - `influenciadores` ganha `user_id`, `pedido_troca_links jsonb` e `passo_concluido` (jsonb, timestamps por passo)
  - Grants e RLS:
    - influenciador lê só a própria linha
    - gerente lê o time e os membros sem e-mail ou telefone, por funções security definer (`meu_time()`, `meu_cadastro_influenciador()`)
    - escritas só pelo servidor
  - Função pública `convite_publico(codigo)`, que devolve só o nome do gerente e do time.
- **`influencer-onboarding.functions.ts`** (requireSupabaseAuth): `getMyOnboarding`, `advanceStep`, `submitLinks` (reaproveita `validarLinks`/`validarCodigo`), `requestLinkChange`.
- **`teams.functions.ts`:**
  - gerente: `getMyTeam`, `saveMyTeam`, `approveMemberAffiliation`, `manageMyInvite`
  - admin: `listManagers`, `moveInfluencerTeam`, mais aprovar ou recusar passo e pedido de troca
- **Rota `/convite/$codigo`** (pública) e server fn `acceptInvite`:
  - zod, limite por IP e convite validado em transação
  - `auth.admin.createUser` com confirmação de e-mail
  - cria `members`, `member_roles` e `influenciadores` com gerente_id e audita
  - `convite` entra nos códigos reservados
- **Gate:** `/painel` lê o status do onboarding (com `ViewSkeleton`), renderiza `InfluencerOnboarding` em tela cheia e trava os itens do menu no `panel-shell`. O admin nunca fica bloqueado.
- **Novas rotas:** `/painel/meu-time`. Configurações ganha a seção "Links e convites".
- **Testes:** regras de convite (expirado, esgotado, inativo) e limite por IP, como funções puras em `influencer-rules.ts`.
- Ao final: typecheck, testes e conferência na tela como admin. Depois disso eu paro e espero seu OK para a Etapa 3.
