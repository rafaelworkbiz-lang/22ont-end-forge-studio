# Painel — períodos, gráfico ampliado e tema salvo

## Organização do painel
- Remover a seção **Histórico**, sem apagar vendas ou saldos armazenados.
- Ampliar **Evolução das vendas** para ocupar o espaço atual das métricas e do gráfico, mantendo os produtos mais vendidos à direita.
- Mover **Métricas-chave** para uma faixa horizontal abaixo da análise, no lugar do histórico. Em telas menores, reorganizar os itens sem cortar números.
- Preservar o destaque central **Vendas de hoje**: ele continuará mostrando apenas hoje, independentemente do filtro da análise.

## Filtros de período
- Manter **Hoje**, **Ontem**, **7 dias** e **30 dias**.
- Adicionar **Personalizado**, com data inicial e final, ambas incluídas no período. Validar datas e impedir fim anterior ao início.
- Aplicar o período ao gráfico, às métricas da análise e aos produtos vendidos.
- Usar o horário de São Paulo para delimitar dias e meses.

## Mensal — lista de meses
- Adicionar **Mensal** ao seletor. Essa opção mostrará uma lista na área ampliada de análise, em vez de recriar o histórico abaixo.
- Cada linha apresentará **mês e ano**, **faturamento** e **comissões** em colunas separadas, do mês mais recente para o mais antigo.
- Somar cada mês do dia primeiro ao último dia; no mês atual, considerar somente registros já ocorridos.
- Ao selecionar um mês, abrir sua evolução diária, métricas e produtos, com opção de voltar à lista mensal.
- Respeitar a opção de ocultar valores e não apresentar ausência de relatório oficial como faturamento zero.

## Tema preto persistente
- Abrir o painel no tema escuro quando não houver uma preferência salva.
- Manter o botão de alternar tema e salvar a escolha por conta neste navegador, restaurando-a após atualizar a página, sair e entrar novamente.
- Não transferir a preferência de uma conta para outra. Sincronização entre dispositivos não faz parte deste ajuste.
- Preservar a identidade dourada, com contraste legível no tema escuro.

## Detalhes técnicos
- Atualizar a apresentação de `SalesOverview` e `DemoSalesOverview` com controles de período compartilhados e estilos no arquivo global.
- Calcular faturamento e comissões mensais separadamente a partir dos registros de vendas, sem alterar o motor automático, taxas ou saldos.
- Restaurar a preferência de tema após a hidratação e antes de permitir sua gravação, evitando sobrescrever uma escolha já salva.
- Preservar os estados de dados indisponíveis e a separação entre saldo de teste e resultados oficiais.

## Validação
- Conferir todos os períodos, limites de datas, viradas de mês e ano e abertura dos detalhes mensais.
- Verificar que a soma mensal corresponde aos registros e que faturamento não é confundido com comissão.
- Conferir o gráfico ampliado e a faixa de métricas com menu aberto e fechado e em telas menores.
- Testar ocultar valores e restaurar o tema após atualização, nova entrada e troca de conta.