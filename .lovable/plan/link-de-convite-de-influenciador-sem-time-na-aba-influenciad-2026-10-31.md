# Link de convite de influenciador (sem time) na aba Influenciadores

## O que muda
- **Administração › Influenciadores:** novo botão **"Gerar link de convite"** no topo da aba. Ele abre uma janela com:
  - o link (`afiliaplace.site/convite/...`), botões Copiar e WhatsApp, e o QR Code;
  - quantos usos já teve e até quando vale (padrão: 90 dias e 50 usos, com opção de alterar);
  - os botões Desativar/Ativar e Novo código.
- **Quem abre o link** cai na página de convite que já existe e preenche nome, e-mail e WhatsApp.
  - A conta é criada como influenciador sem time e recebe o e-mail para definir a senha.
  - No primeiro acesso, essa pessoa faz o passo a passo de cadastro normal.
- **Na página de convite:** em vez de "time de Fulano", aparece "Convite da equipe AfiliaPlace".
- **Links de afiliação:** quem entra por esse convite vê os links padrão da plataforma, Mensal e Vitalício.
- **Proteções que continuam valendo:** limite de cadastros por conexão, e-mail repetido recusado, uso registrado no Histórico.

## Detalhes técnicos
- **Migração:**
  - `convites.gerente_id` passa a aceitar nulo, para convites da administração. Esse passo pede sua aprovação.
  - `convite_publico` passa a usar LEFT JOIN e devolve `gerente` nulo quando o convite é da plataforma.
  - novo índice parcial para um convite ativo da administração.
- **`teams.functions.ts`:**
  - `adminGetPlatformInvite` e `adminManagePlatformInvite` (requireAdmin) reaproveitam `inviteAction`, usando o filtro `gerente_id is null` e registrando auditoria.
  - `inviteAction` passa a aceitar `gerenteId` nulo.
- **Fluxo de aceite:** `acceptInvite` já grava `gerente_id: null` nesse caso; ajustar só a mensagem de erro "fale com seu gerente".
- **Página `/convite/$codigo`:** texto alternativo quando `gerente` é nulo.
- **Tela:** botão e janela em `influencers-manager`, reaproveitando `InviteBox`.
