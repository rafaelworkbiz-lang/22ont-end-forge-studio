# Filtro Quentes nos Produtos

## O que vai mudar
- Remover “Comissão não informada” dos cards e substituir o bloco de comissão pelo seletor **Todos / Quentes**, com ícone de chama e destaque laranja dourado.
- Abrir Produtos em **Todos**, conforme sua escolha; ativar **Quentes** para mostrar somente produtos presentes no ranking oficial de mais vendidos do Mercado Livre.
- Preservar fotos, preços, categorias, busca, links e o pop-up de scripts.
- Nos produtos quentes, mostrar “Mais vendido” e a posição quando disponível, sem inventar quantidades vendidas.

## Fonte dos produtos quentes
- O catálogo atual preenche a quantidade vendida com zero; apenas ordenar esse campo não identificaria os mais vendidos.
- Consultar o ranking oficial por categoria do Mercado Livre e verificar se a conexão atual permite acessá-lo.
- Com uma categoria selecionada, mostrar seus mais vendidos na ordem oficial. Em “Todas”, reunir rankings das categorias disponíveis, sem duplicatas e sem apresentar uma posição global inventada.
- A busca em Quentes filtra os produtos dos rankings consultados; não inclui produtos comuns para completar a lista.
- Se o ranking estiver indisponível, mostrar um estado de indisponibilidade com **Tentar novamente** e opção de voltar a **Todos**, sem chamar produtos comuns de quentes.

## Detalhes técnicos
- Adicionar o modo Quentes à consulta protegida existente, mantendo as regras de acesso e as credenciais somente no servidor.
- Usar `/highlights/MLB/category/{categoria}` como fonte e preservar tipo, categoria e posição de cada resultado. Validar a resolução dos diferentes tipos de produto antes de integrá-los aos cards.
- Separar o carregamento e o cache de Todos e Quentes; consultar categorias em lotes limitados e aproveitar os resultados já carregados.
- Ao entrar em Quentes, usar a ordem do ranking por padrão; as opções de preço continuam ordenando apenas os produtos desse conjunto.
- Atualizar a regra de texto anterior para refletir a remoção do campo de comissão, sem permitir porcentagens inventadas.

## Verificação
- Testar troca entre Todos e Quentes, categorias, busca, duplicatas, ordem e indisponibilidade do ranking.
- Conferir o fluxo autenticado no navegador, incluindo o pop-up e os links, e executar os testes relevantes.
- Se o Mercado Livre bloquear o acesso ao ranking, informar essa limitação; a lista de Quentes depende dessa disponibilidade.