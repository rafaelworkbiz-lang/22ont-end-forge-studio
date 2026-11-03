# Painel de demonstração para influenciadores

## Limite da proposta
Criar uma experiência de vendas simuladas, não um extrato de ganhos reais. O painel terá uma indicação discreta e permanente de **Demonstração**, e cada notificação indicará **Venda simulada**. Não implementar a apresentação de faturamento inventado como resultado real.

## Experiência
- Ativar a demonstração para contas marcadas como influenciador pelo administrador, sem conceder privilégios administrativos.
- Usar R$ 500.000 de faturamento histórico simulado, distribuído de janeiro de 2025 até a data de ativação em outubro de 2026, sem registrar vendas futuras como ocorridas. Separar esse histórico das novas simulações diárias.
- Sortear de 0 a 100 unidades vendidas por dia, em horários variados no fuso de São Paulo; não garantir 100 vendas todos os dias.
- Preencher os destaques de faturamento e comissão simulada, gráfico por período e lista lateral de produtos com dados da mesma simulação.
- Usar nomes, fotos e preços dos produtos reais disponíveis no catálogo como referência visual, sem afirmar que esses produtos foram efetivamente vendidos.
- Exibir notificações laterais de venda simulada com foto, produto, horário, valor e comissão ilustrativa; evitar notificações em massa ao reabrir o painel.
- Configurar uma taxa ilustrativa na administração, claramente distinta da comissão oficial do Mercado Livre; não inventar taxas oficiais.
- Manter as contas comuns no painel de dados reais, com valores indisponíveis enquanto não houver relatório oficial conectado.

## Detalhes técnicos
- O painel atual usa `SalesOverview`; a marca de influenciador é lida de `member_roles` pela gestão protegida de membros.
- Verificar a vinculação segura entre a conta autenticada e o membro antes de liberar a demonstração; não confiar em marcações no navegador.
- Persistir configuração e eventos simulados em armazenamento separado dos relatórios reais, com acesso restrito à própria conta e ao administrador.
- Gerar eventos de forma idempotente e consistente: atualizar ou abrir duas abas não deve duplicar vendas nem alterar o histórico.
- Mostrar somente eventos cujo horário já ocorreu; se não houver produtos acessíveis, mostrar estado indisponível sem fabricar fotos ou contornar o bloqueio do catálogo.
- Não criar pedidos, comissões pagáveis, saques ou alterações no Mercado Livre.

## Validação
- Testar ativação e desativação do influenciador, isolamento entre contas e bloqueio de alterações não autorizadas.
- Conferir os R$ 500.000 do histórico, teto diário, horários, totais e taxas ilustrativas.
- Verificar notificações, recarga, múltiplas abas e apresentação em computador e celular.
- Confirmar que os dados simulados nunca entram em métricas reais ou registros financeiros.