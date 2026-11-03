# Editor de loja: exemplos com produtos de verdade e cartões arrumados

## 1. Exemplos iguais aos produtos reais
Tirar as fotos aleatórias e os nomes inventados. Na prévia (etapas 1 a 4), quando a loja ainda não tem produtos, mostrar 8 produtos de verdade da aba **Produtos validados** (foto, nome, preço e fornecedor reais), da categoria mais próxima do nicho da loja, com o mesmo cartão que a loja publicada usa. O selo "Exemplo" fica pequeno, no canto do cartão, sem alterar o nome do produto.

## 2. Arrumar os blocos de produtos dentro do Editar loja
Primeiro abrir o editor no navegador com a conta de teste (no seu tamanho de tela) e fotografar os 12 layouts, para ver exatamente o que está quebrado: cartões esticados, fotos de tamanhos diferentes, textos estourando ou colunas desalinhadas. Depois corrigir para que, em todos os layouts:
- todos os cartões da mesma linha tenham a mesma altura;
- a foto ocupe sempre o mesmo formato (quadrada), sem esticar;
- o nome tenha no máximo 2 linhas, com "…" no fim;
- preço e botão "Comprar" fiquem sempre no pé do cartão;
- no modo Celular da prévia, a grade passe para 2 colunas.
Por fim, conferir de novo com fotos da tela no computador e no celular.

## Detalhes técnicos
- Exemplos: usar `listLibrary` (já protegido por acesso ativo) com limite 8, convertido em `LojaItem`; marcar com `exemplo: true` só para mostrar o selo; nunca salvar nem gerar link de clique.
- Cartões: ajustes só em `styles.css` (regras da loja pública/prévia), sem mudar a lógica de layouts em `store-theme.ts`.
