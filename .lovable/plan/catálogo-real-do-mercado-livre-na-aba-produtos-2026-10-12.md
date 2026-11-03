# Catálogo real do Mercado Livre na aba Produtos

## Objetivo
Trocar os 70 produtos de exemplo por produtos reais do Mercado Livre, com foto, preço, link verdadeiro e o link de afiliado de cada pessoa.

## O que você vai ver
- A aba Produtos busca produtos ao vivo no Mercado Livre, com foto real, título, preço, frete grátis, vendidos e link oficial do anúncio.
- As categorias usam as categorias oficiais do Mercado Livre Brasil. A busca por palavra-chave e a ordenação (relevância, menor preço e maior preço) são feitas pelo próprio Mercado Livre.
- Botão "Carregar mais" para paginar o catálogo. Assim o catálogo fica praticamente sem fim.
- A comissão estimada usa as taxas por categoria do programa de afiliados. Essas taxas ficam numa tabela que dá para ajustar.
- **Link de afiliado:** "Copiar link" monta o link do anúncio real com a sua identificação de afiliado do Mercado Livre. O campo "Sua tag de afiliado" passa a guardar essa identificação no navegador.
- Enquanto carrega, aparecem cards de carregamento. Se o Mercado Livre não responder, aparece um aviso com o botão "Tentar novamente".

## O que precisamos de você
1. Criar um aplicativo em developers.mercadolivre.com.br (é grátis) e copiar o **App ID** e a **Secret Key**. Eu vou pedir os dois por um formulário seguro, e eles nunca ficam visíveis no site.
2. Sua tag/identificação de afiliado do portal de afiliados do Mercado Livre.

## Limitação importante
O Mercado Livre não oferece uma API pública para gerar links curtos de afiliado (os links "meli.la"). Esses links só saem pelo portal ou pela extensão de afiliados. Por isso o link será o anúncio real com a sua identificação no final. Quando quiser, conferimos juntos no portal se as vendas estão sendo atribuídas a você. Se não estiverem, ajustamos o formato do link.

## Detalhes técnicos
- Ativar o Lovable Cloud e guardar as credenciais como secrets `MELI_APP_ID` e `MELI_CLIENT_SECRET`.
- `src/lib/meli.functions.ts`: um createServerFn `searchMeliProducts` ({ q, category, sort, offset }, validado com zod). Ele pega o token de acesso (client_credentials em `api.mercadolibre.com/oauth/token`, com cache em memória até expirar) e chama `/sites/MLB/search`. Devolve um DTO enxuto (id, title, price, thumbnail em https, permalink, free_shipping, sold_quantity, category_id). Em caso de falha, retorna `{ items: [], error }`.
- `listMeliCategories` usa `/sites/MLB/categories`, com cache.
- `products-catalog.tsx` passa a usar `useInfiniteQuery` com o server fn (via useServerFn). Os dados de exemplo saem do arquivo. O link de afiliado é montado a partir do `permalink` e da tag salva em localStorage (lida no useEffect).
- Mapa de taxa por categoria em um módulo próprio, seguro para o navegador.
- Registrar no AGENTS.md: as chamadas ao Mercado Livre passam só pelo servidor, para proteger as credenciais.
