# Tirar o campo "ID de afiliado na Applyfy"

## O que muda
- Na janela do influenciador, o campo "ID de afiliado na Applyfy (se souber)" sai.
- O valor que já estiver salvo continua guardado e não se perde.

## Detalhes técnicos
- `influencers-manager.tsx`: remover só o input `applyfy_afiliado_id`. O formulário continua enviando o valor atual, então nada muda no servidor nem no banco.
