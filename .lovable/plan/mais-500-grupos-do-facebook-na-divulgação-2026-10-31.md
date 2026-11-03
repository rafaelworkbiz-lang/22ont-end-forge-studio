## Mais 500 grupos do Facebook na Divulgação

Hoje a aba tem 274 grupos do Facebook. A ideia é chegar perto de 774.

O que vou fazer:
1. Pesquisar na internet grupos públicos e reais do Facebook para divulgação de vendas: achadinhos, promoções, compra e venda por cidade e estado, nichos (moda, beleza, casa, eletrônicos, pet, infantil, fitness, games, automotivo), Shopee e Mercado Livre.
2. Guardar só grupos com endereço real (facebook.com/groups/...), sem repetir os que já existem (comparação pelo endereço).
3. Separar cada grupo por nicho e palavras-chave, para os filtros da aba funcionarem.
4. Membros ficam "não informado" quando a quantidade não estiver confirmada.
5. Conferir na tela que os grupos novos aparecem e que os filtros funcionam.

Aviso importante: não vou inventar grupos. Se a pesquisa não achar 500 grupos reais e diferentes, eu adiciono quantos achar e te digo o número exato.

### Detalhes técnicos
- Pesquisa feita por subagentes em paralelo, cada um num conjunto de nichos e regiões, gerando CSV com nome, link, nicho e palavras-chave.
- Juntar os resultados, normalizar o ID do grupo e remover os que já estão em grupos.link.
- Inserir em public.grupos (rede='facebook', ativo=true, legado_id 'facebook:fb-N' na sequência), sem mudar a estrutura da tabela.
