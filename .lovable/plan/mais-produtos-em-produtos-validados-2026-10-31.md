## Mais produtos em "Produtos validados"

Hoje a biblioteca pega só 12 campeões de venda por categoria, em 13 categorias, do ranking oficial do Mercado Livre.

O que vou fazer:
1. Pegar todos os campeões que o Mercado Livre devolve por categoria (até 20, o máximo do ranking oficial), em vez de 12.
2. Adicionar subcategorias populares (por exemplo: celulares, fones, notebooks, cozinha, maquiagem, perfumes, tênis, brinquedos, ferramentas, suplementos, pet), chegando a umas 40 listas, o que deve levar a biblioteca para algo perto de 500 a 800 produtos.
3. Manter a regra atual: só entram produtos do ranking oficial de mais vendidos, com a posição preservada. Nada de produto comum disfarçado de campeão.
4. Na aba, mostrar os produtos aos poucos (botão "Carregar mais"/rolagem) para a tela continuar rápida.
5. Rodar a atualização agora para encher a biblioteca e conferir na tela com a conta de teste.

Observação: a atualização diária faz uma lista por vez; com mais listas, ela demora mais para completar o ciclo do dia (continua dentro da janela das 06:00).

### Detalhes técnicos
- library-refresh.server.ts: PER_CATEGORY 12 → 20; LIBRARY_CATEGORIES passa a incluir uma lista extra de subcategorias MLB (ids conferidos via /categories antes de usar).
- Cron: aumentar a frequência dentro da janela para cobrir todas as listas.
- library.tsx: paginação no cliente (ex.: 40 por vez).
