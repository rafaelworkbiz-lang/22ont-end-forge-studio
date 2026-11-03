# Gerente com dois links de afiliação (Mensal e Vitalício)

## O que muda
- **Meu time (gerente):** o formulário passa a pedir dois links da Applyfy, um para "Afiliação Mensal" e outro para "Afiliação Vitalício".
  - Os dois são obrigatórios e precisam ser diferentes.
  - Os dois aparecem no resumo do time.
  - Enquanto um deles faltar, o convite do time fica escondido.
- **Admin › Gerentes:** a janela de editar o time mostra e permite editar os dois links.
- **Passo a passo do influenciador que entrou pelo convite:** na etapa "Pedir afiliação" aparecem dois botões, "Pedir afiliação Mensal" e "Pedir afiliação Vitalício", com os links do gerente dele.
  - Se o gerente ainda não tiver os dois links, o influenciador vê os links padrão da plataforma.
- **Times que já existem:** o link atual de cada time vira o link Mensal. O link Vitalício fica pendente até o gerente preencher.

## Detalhes técnicos
- **Migração:**
  - adicionar `times.link_afiliacao_mensal` e `times.link_afiliacao_vitalicio`
  - copiar o valor de `link_coproducao` para o campo mensal
  - comentário `DEPRECATED` em `link_coproducao`
- **`teams.functions.ts`:**
  - `TeamData` e `saveMyTeam` passam a usar os dois links
  - o mesmo vale para a função de admin, que valida os dois com `validarLinkGerente` e exige que sejam diferentes
- **`influencer-onboarding.functions.ts`:**
  - o `gerente` passa a retornar `{ nome, mensal, vitalicio }`
  - o passo 2 da tela usa esses dois links, com fallback para `config_admin.link_afiliacao_*`
- **Telas:** atualizar `my-team.tsx` (formulário e resumo), `managers-manager.tsx` e o passo 2 de `influencer-onboarding`.
- **Teste:** validação que recusa links iguais e links de outro domínio.
