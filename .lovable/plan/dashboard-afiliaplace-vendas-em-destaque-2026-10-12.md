# Dashboard AfiliaPlace — vendas em destaque

## Direção visual
Remodelar o painel seguindo as três imagens: vendas de hoje no centro, métricas à esquerda, gráfico amplo no meio e produtos vendidos à direita. Manter a identidade AfiliaPlace: laranja dourado, cinza muito claro, barra superior branca e mascote sem fundo.

Acabamento sofisticado com tipografia sem serifa, números bem definidos, divisórias finas, sombras discretas e espaço bem distribuído. Sem efeitos neon, enfeites artificiais, degradês decorativos ou excesso de caixas.

## O que será alterado
1. **Destaque central de vendas + lucro**
   - Substituir os dois destaques lado a lado por uma composição central única, inspirada na referência.
   - Título “Vendas de hoje”, data discreta e valor das vendas grande, com lucro/comissões logo abaixo em tamanho menor.
   - Faixa superior dourada com acabamento limpo, mantendo visível o começo das métricas abaixo.
   - O destaque principal será sempre de hoje; a troca de período controlará a análise abaixo, sem trocar silenciosamente o significado do valor principal.

2. **Análise no formato das imagens**
   - Métricas em uma grade de duas colunas à esquerda, com ícones discretos e valores legíveis.
   - Gráfico central ocupando a maior largura, com cabeçalho compacto, período e comparação diária quando houver dados disponíveis.
   - Ranking à direita com posição, foto, nome do produto, unidades e valor vendido; primeiro colocado com destaque dourado suave.
   - Não reproduzir estoque, visitas, conversão ou avaliações das imagens sem dados correspondentes.
   - Na demonstração, manter o histórico abaixo da análise para não disputar espaço com o gráfico e os produtos.

3. **Menu aberto e recolhido**
   - Centralizar vendas na área útil do painel, não na largura total que inclui o menu.
   - Ao recolher o menu, redistribuir as três colunas e ampliar o gráfico sem esticar exageradamente o destaque de vendas.
   - Manter o botão de reabrir o menu acessível, a transição suave e a rolagem funcional sem barras visíveis.
   - Em larguras menores, reorganizar as colunas sem cortar valores, fotos ou controles.

4. **Preservar os dados e acessos**
   - Aplicar a mesma organização visual ao painel de clientes, administrador e influenciadores.
   - Manter valores indisponíveis quando não houver relatório oficial, sem transformar ausência de dados em faturamento zero.
   - Preservar a identificação da demonstração e das comissões ilustrativas; não usar “ao vivo” para resultados simulados.
   - Não alterar conexão Mercado Livre, permissões, geração de vendas ou regras de comissão.

## Detalhes técnicos
- O painel atual usa `SalesOverview` e `DemoSalesOverview`, ambos com dois destaques em `sales-highlights`; a mudança ficará na apresentação desses componentes e nos estilos globais.
- Usar uma apresentação compartilhada para o destaque central, mantendo separadas as fontes de dados reais e demonstrativos.
- Ajustar a grade pela largura disponível do conteúdo, em vez de depender apenas da largura da janela; o menu já possui estado de recolhimento e botão na barra superior.
- Reutilizar os botões e as cores semânticas do projeto, preservando o tema escuro e respeitando a preferência por movimento reduzido.
- As imagens anexadas serão referência visual, não imagens inseridas no painel.

## Validação
- Conferir visualmente o painel com menu aberto e recolhido, incluindo a largura aproximada de 1192 px usada atualmente.
- Testar ocultar/mostrar valores, alternar tema, selecionar períodos e acessar o catálogo.
- Conferir o painel de influenciador autenticado com suas vendas persistidas e os estados sem relatório oficial.
- Verificar que números longos não se sobrepõem e que o destaque continua centralizado após recolher o menu.

## Fora deste ajuste
Não inclui sincronizar relatórios oficiais, novas métricas financeiras, mudanças de autenticação ou copiar o rodapé e o atendimento do Mercado Livre.