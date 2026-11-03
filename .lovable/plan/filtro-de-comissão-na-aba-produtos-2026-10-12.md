# Filtro de comissão (%) na aba Produtos

## O que o usuário vai ver

- Na barra de filtros da aba Produtos, um **controle deslizante com duas pontas** ("Comissão: de 5% a 14%"), que se arrasta com mouse ou dedo.
- Ao arrastar, a lista mostra **só os produtos cuja comissão estimada está dentro da faixa escolhida**, e o contador diz quantos foram carregados nessa faixa (ex.: "37 produtos com comissão de 10% a 14%").
- Abaixo do controle, uma linha curta com as categorias que entram na faixa (ex.: "Moda 14%, Beleza 13%, Ferramentas 12%...").
- Botão "Limpar" volta para 5%–14% (todos os produtos).
- Quando a faixa não tem produtos (ex.: categoria escolhida fora da faixa), aparece "Nenhum produto nessa faixa de comissão" com atalho para limpar.
- O botão "Carregar mais" e o contador de até 1.000 continuam funcionando dentro da faixa.

## Como funciona (e uma ressalva)

A comissão mostrada é uma **estimativa por categoria** (Games 5%, Celulares 6% ... Moda 14%), não um valor por produto. Então filtrar por % equivale a filtrar por categorias. Quando "Todas" está selecionada, o catálogo busca **apenas nas categorias que cabem na faixa**, em vez de buscar tudo e descartar, assim a lista enche mais rápido.

## Detalhes técnicos

- `src/lib/meli-categories.ts`: exportar `MIN_RATE`/`MAX_RATE` (calculados das categorias) e helper `categoriesInRange(min, max)`.
- `src/lib/meli.functions.ts`: `searchMeliProducts` recebe `categories: string[]` (opcional, ids permitidos, validado com zod); `plan()` usa essa lista no lugar de `CATS` no modo "Todas". A faixa completa mantém o comportamento atual.
- `src/components/products-catalog.tsx`: estado `range: [number, number]` (em %), `Slider` de `@/components/ui/slider` com duas pontas (confirmar que o componente renderiza duas pontas; ajustar se necessário), debounce curto antes de entrar na `queryKey` (`["meli", query, category, min, max]`), filtro final no `useMemo` por `rateFor(p.categoryId, category)` dentro da faixa, reset do `target` ao mudar a faixa, textos de contador e estado vazio.
- `src/styles.css`: bloco `.catalog-rate` (rótulo, slider na cor `--brand-highlight`, linha de categorias), responsivo em 390px.
- Verificar com Playwright: arrastar o controle altera a lista, produtos exibidos têm comissão dentro da faixa, "Limpar" restaura, layout mobile e build sem erros.
