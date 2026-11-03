# Catálogo com até 1.000 produtos reais do Mercado Livre

## O que você vai ver
- A aba Produtos passa a carregar até 1.000 produtos reais do Mercado Livre (foto, nome, preço, frete grátis, link com sua tag), em lotes de 24 pelo botão "Carregar mais".
- Hoje a aba mostra só uns 48 produtos e o "Carregar mais" não avança sem busca. Isso muda: o botão funciona em todas as categorias e na visão "Todas".
- Cada categoria (Celulares, Informática, Games, Moda etc.) passa a ter vários subtemas de busca (ex.: Celulares = iPhone, Samsung Galaxy, Motorola, Xiaomi...), o que dá volume de verdade sem repetir produtos.
- Um contador mostra "X de até 1.000 produtos carregados".
- Produtos repetidos são removidos automaticamente.

## Limite do Mercado Livre (importante)
A API do Mercado Livre só deixa ler até cerca de 125 resultados por palavra de busca, e só informa a posição até 100. Por isso os 1.000 vêm da soma de várias buscas por subtema, e não de uma única consulta. Quando você digita uma palavra na busca, aparecem até ~125 resultados daquela palavra.

## Ordenação
O Mercado Livre não ordena por preço pelo servidor, então "Menor preço" e "Maior preço" passam a ordenar tudo que já foi carregado na tela.

## Detalhes técnicos
- `src/lib/meli-categories.ts`: adicionar `keywords: string[]` (6 a 8 subtemas) em cada categoria e exportar a lista usada na visão "Todas" (intercalando categorias).
- `src/lib/meli.functions.ts`: trocar o `offset` por um índice de página `page` (0 a 39). Página p -> subtema = `floor(p / 5)`, posição = `(p % 5) * 25` (máximo 100). Uma chamada `/products/search?q=...&limit=24&offset=...` e depois enriquecimento por `/products/{id}/items` (preço mínimo, frete grátis, categoria). Para busca digitada, 5 páginas. `hasMore` baseado em `page < limite`. Manter o token em cache e mensagens de erro amigáveis.
- `src/components/products-catalog.tsx`: `getNextPageParam` por número de página, dedupe por `id`, ordenação por preço no cliente, contador de carregados, remover o limite fixo de 48.
- Tudo continua só no servidor (credenciais nunca vão ao navegador). Se uma página falhar (lote de chamadas bloqueado), ela é pulada e a próxima é tentada, sem quebrar a tela.
- Verificar no preview com Playwright: carregar várias páginas em "Todas" e em uma categoria, confirmar quantidade acumulada e ausência de repetidos.
