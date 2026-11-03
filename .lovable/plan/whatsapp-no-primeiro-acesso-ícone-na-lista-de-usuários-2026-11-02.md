# WhatsApp no primeiro acesso + ícone na lista de Usuários

## O que muda
1. **Pergunta no primeiro acesso:** ao entrar no painel, se a conta não tiver WhatsApp cadastrado (vazio ou só zeros), abre uma janela pedindo o número (com DDD, formato brasileiro). Não dá para fechar sem preencher; depois de salvo, não aparece mais. O admin não é obrigado.
2. **Aba Usuários:** a bolinha com a letra inicial vira o símbolo do WhatsApp (verde). Ao clicar, abre a conversa no WhatsApp em nova aba. Se a pessoa não tiver número, o símbolo fica cinza e sem clique ("Sem WhatsApp").

## Detalhes técnicos
- Nova server function autenticada `meuWhatsapp` (ler) e `salvarMeuWhatsapp` (gravar) em `members.functions.ts`, atualizando apenas a linha `members` do próprio e-mail da sessão; validação 10–13 dígitos, prefixo 55.
- Componente `WhatsappPrompt` montado no `PanelShell`, usando o estilo de janela existente.
- `users-manager.tsx`: trocar `um-avatar` por link com ícone WhatsApp reaproveitando `waLink`; estilos em `styles.css`.
- Teste da validação do número.
