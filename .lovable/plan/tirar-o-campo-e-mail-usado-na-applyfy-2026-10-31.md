# Tirar o campo "E-mail usado na Applyfy"

## O que muda
- Na janela do influenciador, o campo "E-mail usado na Applyfy" sai.
- O resto continua igual: código da página, comissão combinada, ID de afiliado (opcional), status do cadastro e links.

## Detalhes técnicos
- `influencers-manager.tsx`: remover o input `applyfy_email`, mas continuar enviando o valor atual no save.
- `influencers.functions.ts`: deixar `applyfy_email` opcional no validador e não sobrescrever o valor quando ele não vier.
- A coluna fica no banco sem uso, sem migração destrutiva.
