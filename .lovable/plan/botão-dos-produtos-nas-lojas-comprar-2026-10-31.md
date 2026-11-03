# Botão dos produtos nas lojas: "Comprar"

## O que muda
- Nas lojas (página pública e prévia do editor), o botão de cada produto deixa de dizer "Ver no Mercado Livre" / "Ver na Shopee" e passa a dizer só **Comprar**, para os dois fornecedores.
- O link continua o mesmo (abre o produto em nova aba).

## Detalhes técnicos
- `src/components/loja-publica.tsx` linha 102: trocar o texto condicional por "Comprar".
