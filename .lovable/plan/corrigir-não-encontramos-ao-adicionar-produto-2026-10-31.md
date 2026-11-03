# Corrigir "Não encontramos" ao adicionar produto

## O problema
Quando você clica em "Adicionar aos meus produtos", a janela abre sem saber qual produto é. O código do produto (ex.: MLB17336025) é descartado do endereço da página, porque o painel só aceita, nesse campo, códigos no formato de loja. Por isso aparece "Não encontramos o que você queria abrir", mesmo com a conta conectada.

## O que vou fazer
- Fazer o painel aceitar também códigos de produto (Mercado Livre e Shopee) nesse campo, sem afrouxar as outras janelas.
- Conferir no navegador com a conta de teste: abrir Produtos validados, clicar em adicionar e ver a janela com o produto certo.

## Detalhes técnicos
- `src/routes/painel.tsx` validateSearch: `id` passa a aceitar UUID **ou** `^[A-Za-z0-9_-]{2,40}$` (itemId de ML/Shopee).
- As janelas que usam `id` como UUID (escolher-loja etc.) já validam no servidor; nada muda nelas.
