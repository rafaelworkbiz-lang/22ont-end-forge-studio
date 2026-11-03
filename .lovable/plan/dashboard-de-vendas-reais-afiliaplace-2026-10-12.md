# Dashboard de vendas reais — AfiliaPlace

## Objetivo
Modelar o painel seguindo as duas imagens: vendas e lucro em destaque, gráfico central e produtos vendidos na lateral direita. Usar a identidade da AfiliaPlace, com laranja dourado, cinza muito claro, navbar branca e mascote sem fundo.

**Origem escolhida:** vendas pelos links de afiliado do Mercado Livre. Neste painel, “Lucro” significa comissão do afiliado confirmada no relatório, não o valor total do produto vendido.

## Limite importante dos dados reais
- O painel atual contém vendas, comissões, rankings e gráficos fixos no código; o admin também contém influenciadores e resultados de exemplo.
- A base atual tem conexões do Mercado Livre e cadastros de membros, mas não registros de vendas ou comissões de afiliados.
- A conexão existente identifica a conta do Mercado Livre e salva sua tag. Isso não comprova atribuição de vendas nem libera, por si só, relatórios de comissões.
- Não foi confirmada uma API pública oficial para obter vendas e ganhos de afiliados. A API de pedidos de vendedores não serve como substituta.

**Não prometer sincronização ao vivo nesta entrega.** Enquanto a origem oficial não estiver disponível, mostrar “Dados indisponíveis” ou “Relatório não conectado”, sem inventar valores e sem exibir R$ 0,00 como se fosse um resultado confirmado.

## 1. Novo visual do painel
- Topo com título **Vendas de hoje** e dois destaques: **Vendas atribuídas** e **Lucro · comissões confirmadas**. Comissões pendentes ficam separadas, quando houver dados oficiais.
- Mostrar a data do dia em horário de São Paulo; a última atualização deve refletir uma consulta ou importação real, nunca apenas o relógio da tela.
- Abaixo, três áreas inspiradas na referência:
  - **Esquerda:** quantidade de vendas, unidades vendidas e comissões por status, apenas quando informadas pela origem.
  - **Centro:** evolução das vendas, com comparação Hoje/Ontem e seleção de período. Sem pontos fictícios; dados diários não serão transformados artificialmente em dados por hora.
  - **Direita:** **Produtos vendidos hoje**, com foto, nome, quantidade, valor de vendas e comissão quando disponíveis. Destaque discreto para o primeiro colocado.
- Não copiar estoque, experiência de compra, visitas ou conversão da referência sem dados reais que sustentem essas métricas.
- Preservar ocultar valores, alternância de tema, menu recolhível e rolagem sem barra visível. Em telas menores, organizar as áreas em uma coluna sem sobreposição.

## 2. Retirar dados fictícios do sistema
- Remover vendas, comissões, conversões, status e rankings fixos do painel e dos seus pop-ups.
- Substituir o admin de exemplo pelos cadastros reais já utilizados em **Gerenciar Usuários**. Totais de membros, planos e influenciadores vêm desses cadastros; ganhos não disponíveis ficam sem valor.
- Retirar os 500 grupos gerados do Facebook e seus membros inventados. Preservar grupos adicionados por URL, mas não tratar números informados manualmente como verificados. Sem grupos reais cadastrados, mostrar a lista vazia.
- Preservar os grupos reais pesquisados de WhatsApp, indicando que os membros são contagens da fonte, não uma medição ao vivo.
- Preservar nomes, fotos e preços reais do catálogo do Mercado Livre. Retirar percentuais e ganhos por categoria sem confirmação oficial, incluindo o filtro baseado nessas taxas; não apresentar estimativa fixa como comissão disponível.
- Ajustar mensagens que sugerem comissão garantida: conectar a conta ou colocar parâmetros no link não comprova pagamento nem atribuição.

## 3. Caminho para preencher com vendas reais
1. Confirmar com documentação oficial ou acesso autorizado se há uma integração de relatórios disponível para esta aplicação.
2. Caso exista, integrar somente os campos e permissões comprovados, mantendo vendas de cada usuário isoladas.
3. Caso não exista, manter o painel novo sem resultados inventados. Para uma próxima etapa de importação, será necessário um arquivo real de relatório do programa de afiliados, se o portal oferecer exportação; seu formato e campos precisam ser conferidos antes de criar a importação.

Nesta entrega, a mudança visual e a retirada de dados de exemplo não dependem desse relatório. A sincronização automática de vendas permanece bloqueada até confirmar uma fonte oficial acessível.

## Detalhes técnicos
- Separar o resumo financeiro da estrutura de navegação em um componente focado. Representar carregamento, indisponibilidade, erro e resultado confirmado vazio como estados distintos.
- Usar os controles compartilhados e tokens do tema; manter a proteção existente de Produtos por login e conexão com o Mercado Livre.
- Não criar tabelas de vendas nem endpoints presumidos antes de validar a origem e o contrato dos dados. Não acessar endpoints internos do portal, pedir cookies ou usar pedidos de vendedor para simular vendas de afiliado.
- Atualizar documentação, títulos e descrições das páginas afetadas, regras de arquitetura e roteiro de tarefas. Registrar o novo padrão visual e a regra de não usar métricas fictícias.

## Verificação
- Conferir o painel e a lateral de produtos vendidos com os estados reais disponíveis, inclusive ausência de relatório.
- Testar Hoje/Ontem, período, ocultar valores e navegação, sem gerar valores de demonstração.
- Conferir o admin autenticado contra a lista real de membros e testar que outro usuário não acessa a gestão.
- Conferir computador e celular, temas claro/escuro e ausência de erros.
- Só declarar vendas reais sincronizadas depois de consultar uma fonte oficial e confirmar o mesmo resultado na tela.