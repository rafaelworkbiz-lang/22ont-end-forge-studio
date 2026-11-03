# Produtos só depois de conectar o Mercado Livre

## Objetivo
A aba Produtos só funciona para quem estiver logado na AfiliaPlace e com a conta do Mercado Livre conectada. Sem isso, o catálogo não aparece nem é carregado.

## O que você vai ver
- **Sem login na AfiliaPlace:** a aba Produtos mostra uma tela de bloqueio com o texto "Entre na sua conta para acessar os produtos" e o botão "Entrar / Criar conta".
- **Logado, mas sem Mercado Livre conectado:** tela de bloqueio com o texto "Conecte sua conta do Mercado Livre para liberar o catálogo" e o botão "Conectar com Mercado Livre", que leva direto para a aba Integrações.
- **Conectado:** o catálogo abre normalmente e todos os links e scripts saem com a tag de afiliado da conta conectada.
- O campo manual "Sua tag de afiliado" sai da aba Produtos. A tag passa a ser definida só na aba Integrações, que já existe.
- Enquanto confere a conexão, aparece um carregamento curto em vez da tela de bloqueio piscando.
- O atalho "Ver catálogo" do Dashboard leva para a mesma tela, então cai no bloqueio quando for o caso.

## Proteção no servidor
Esconder a tela não basta. A busca de produtos também passa a exigir login e conexão com o Mercado Livre. Quem chamar a busca sem estar conectado recebe uma recusa, mesmo fora do site.

## Detalhes técnicos
- `src/lib/meli.functions.ts`: `searchMeliProducts` ganha `.middleware([requireSupabaseAuth])`. No início do handler, confere via admin client (carregado dentro do handler) se existe linha em `meli_connections` para `context.userId`. Sem conexão, retorna erro "Conecte sua conta do Mercado Livre" sem chamar a API do ML.
- `src/components/products-catalog.tsx`: usa `useAccount()` e `useMeliConnection()`. Antes de montar o `useInfiniteQuery`, separa em dois componentes: um portão (`ProductsGate`) com os estados carregando, sem login, sem conexão; e o catálogo atual só renderizado quando conectado. A query fica `enabled` só com conexão. Remove `manualTag`/localStorage e usa `conn.data.tag`.
- Botão "Conectar" do bloqueio recebe um callback `onOpenIntegrations` vindo de `affiliate-dashboard.tsx` (já existe `setView("Integrações")`).
- Confirmar que `src/start.ts` já anexa o token de login nas chamadas de servidor (a busca passa a ser protegida).
- Atualizar `AGENTS.md`/`roadmap.md` e a seção de Produtos em `docs.tsx` com a regra de acesso.
- Memória do projeto: registrar "Produtos exige login e Mercado Livre conectado".

## Observação
O login do Mercado Livre só funciona no site publicado (único endereço cadastrado no app do Mercado Livre). No preview você verá a tela de bloqueio; para testar o catálogo liberado, conecte pelo site publicado ou cadastre o endereço do preview no app do Mercado Livre.
