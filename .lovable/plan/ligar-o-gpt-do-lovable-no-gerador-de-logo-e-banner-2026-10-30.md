# Ligar o GPT do Lovable no gerador de logo e banner

Objetivo: o gerador de imagens das lojas passa a usar o GPT de imagens pelo Lovable, sem chave própria da OpenAI. O custo sai dos créditos de IA do espaço.

## O que muda
- Logo (4 opções, quadrada) e banner (3 opções, larga) gerados pelo GPT de imagens do Lovable.
- Regras atuais mantidas: limite mensal por plano, bloqueio de marcas/pessoas, falhas não contam, opções apagadas após 24h, nome da loja sempre escrito pelo app.
- Mensagens claras quando faltar crédito de IA ("créditos de IA esgotados") ou houver excesso de pedidos (tente em instantes); recusa do modelo vira "bloqueado" e não conta.
- Admin de IA: o aviso "sem chave" deixa de aparecer; mostra o modelo em uso.

## Verificação
- Testes automáticos atuais continuam passando.
- Gerar uma logo e um banner de verdade na conta de teste e conferir contador e prévia.

## Detalhes técnicos
- `store-ai.functions.ts`: trocar a chamada `api.openai.com/v1/images/generations` + `OPENAI_API_KEY` pelo gateway `https://ai.gateway.lovable.dev/v1/images/generations` com `LOVABLE_API_KEY` e modelo `openai/gpt-image-2.5-sunburst` (formato openai), seguindo o guia de geração de imagens.
- Garantir a chave do Lovable no projeto; `DEFAULT_MODEL` e `config_ia.modelo` atualizados para o novo id; tratamento 402/403/429/5xx conforme regras do gateway.
