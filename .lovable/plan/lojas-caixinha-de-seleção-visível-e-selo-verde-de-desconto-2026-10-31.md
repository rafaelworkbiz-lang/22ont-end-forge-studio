# Lojas: caixinha de seleção visível e selo verde de desconto

## 1. Caixinha de seleção dos produtos
Na etapa Produtos do Editar loja, a caixinha marcada some no fundo branco. Ela passa a ficar amarela com o visto preto quando marcada, e com borda cinza escura quando desmarcada, nos dois estados bem visíveis.

## 2. Botão "Selo de desconto" (verde)
Na etapa Layout, em "Mostrar nos cartões", entra a opção **Selo de desconto**. Ao ligar:
- aparece um campo para escrever a frase do selo (ex.: "Oferta", "Promoção", "Achado do dia"), até 20 letras;
- cada cartão de produto ganha um selo verde em cima da foto com essa frase;
- quando o Mercado Livre informa um desconto de verdade, o selo mostra também "-X%" e o preço antigo aparece riscado ao lado do preço atual.

O que **não** vai entrar: inventar um preço antigo maior a partir do preço atual. Mostrar um "de R$ X por R$ Y" que nunca existiu é propaganda enganosa pelo Código do Consumidor e pode fazer o Mercado Livre bloquear a sua conta de afiliado. Por isso o selo fica só com a sua frase quando não há desconto real.

Vale para a prévia e para a loja publicada.

## Detalhes técnicos
- `styles.css`: estilo de `.ed-prods input[type=checkbox]` (accent/appearance com amarelo da marca e borda escura).
- `store-theme.ts`: `mostrar.desconto` (boolean) e `seloTexto` (string ≤20) em `Tema`/`extras()`/`parseTema`; `stores.functions.ts` aceita os campos novos.
- `LojaItem` ganha `precoOriginal` opcional, vindo de `produtos_cache.preco_original` (só quando maior que o preço atual); `ProductCard` mostra selo `.loja-off` verde e preço riscado.
- Toggle e campo no passo Layout em `store-editor.tsx`.
