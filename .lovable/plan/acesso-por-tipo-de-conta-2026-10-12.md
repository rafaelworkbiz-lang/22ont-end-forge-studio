# Acesso por tipo de conta

## Resultado
- **Administrador:** Produtos liberados após entrar na AfiliaPlace, sem conectar uma conta pessoal do Mercado Livre. Mostrar “Acesso administrativo”, sem fingir uma conexão ou comissões atribuídas.
- **Influenciadores:** acesso automático ao catálogo e ao painel de demonstração, sem autorização do Mercado Livre. Em Integrações, mostrar **doplasti — conexão simulada**. Aplicar tanto aos influenciadores existentes quanto aos novos.
- **Clientes:** precisam conectar sua própria conta do Mercado Livre para liberar Produtos. O painel usa somente resultados reais confirmados; onde não houver relatório real, manter “Dados indisponíveis”, nunca números simulados.

## Alterações
1. Resolver o tipo de conta no servidor, dando prioridade ao administrador e verificando a marca de influenciador no cadastro gerenciado.
2. Separar permissão de acesso ao catálogo de conexão real: admin e influenciador não precisam de OAuth pessoal; clientes continuam precisando.
3. Ajustar Produtos, Integrações e o indicador do painel para distinguir acesso administrativo, demonstração e conta realmente conectada.
4. Remover a exigência de conexão real para gerar a demonstração do influenciador, mantendo o histórico e os eventos persistidos sem duplicação.
5. Manter links comuns do Mercado Livre no acesso administrativo e na demonstração quando não houver tag real verificada. “doplasti” será o nome demonstrativo, não uma tag de afiliado comprovada.
6. Atualizar documentação e regras permanentes de acesso para refletir as três modalidades.

## Detalhes técnicos
- Atualmente, Produtos verifica `connected`, a busca no servidor exige registro em `meli_connections` e a demonstração também exige esse registro; esses três pontos serão ajustados juntos.
- Usar uma resolução compartilhada de acesso autorizada no servidor, sem privilégios derivados do navegador.
- Representar a demonstração separadamente da conexão real: não gravar tokens, IDs ou credenciais fictícias em `meli_connections`; preservar conexões reais existentes.
- Manter os eventos financeiros da demonstração isolados de vendas atribuídas, relatórios reais e pagamentos.
- Invalidar os dados de acesso ao alterar a marca de influenciador, para que a próxima leitura aplique as permissões corretas.

## Verificação
- Admin sem conexão consegue abrir e pesquisar Produtos.
- Influenciador novo ou existente sem conexão vê “doplasti — conexão simulada”, catálogo e demonstração identificada.
- Cliente desconectado continua bloqueado; cliente conectado acessa Produtos com sua própria conta.
- Remover a marca de influenciador restaura as regras de cliente, sem apresentar histórico simulado como real.
- Conferir isolamento entre contas, recarga da página, notificações e ausência de duplicação de eventos.

## Limite
A conexão simulada não cria vínculo com o Mercado Livre nem gera direito a comissão. A sincronização de vendas reais permanece dependente de uma fonte oficial ou relatório real.