# Destravar "Enviar para revisão" no cadastro de influenciador

## O que acontece hoje
A tela de cadastro do influenciador não mostra nenhuma mensagem de aviso. Quando o link colado é recusado (por exemplo: link padrão da plataforma, link igual nos dois campos, link de outro influenciador ou código já usado), o botão volta a dizer "Enviar para revisão" e nada aparece. Para a pessoa, parece que travou. A pessoa convidada mais recente está parada justamente nesse passo, sem links salvos.

## O que vou mudar
- Mostrar o motivo do erro em vermelho logo abaixo do botão "Enviar para revisão" (ex.: "Use os seus links de afiliado, não os links padrão.").
- Ativar as mensagens rápidas (aviso de sucesso/erro) também na tela de cadastro, valendo para todos os passos.
- Ao enviar com sucesso, ir direto para o passo "Revisão" com os links já aparecendo.
- Deixar mais claro, no passo 5, que os links precisam ser os **seus** links de afiliado da Applyfy (com o seu código), e não os links padrão.

## Detalhes técnicos
- `src/components/influencer-onboarding.tsx`: renderizar `<Toaster />` (só existe em PanelShell hoje); guardar `links.error` e exibir `<p className="onb-alert">` no formulário; limpar o erro ao editar campos; ajustar texto de ajuda.
- Regras de validação no servidor continuam iguais.
