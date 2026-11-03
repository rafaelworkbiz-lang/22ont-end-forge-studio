# Refatoração global e acompanhamento de assinaturas — AfiliaPlace

## Objetivo
Deixar a apresentação pública e o painel mais leves, com imagens confiáveis e movimentos suaves, preservar as funções existentes, ampliar os grupos de Facebook e adicionar acompanhamento de assinaturas no admin.

## O que foi conferido
- O painel importa diretamente as principais abas, inclusive produtos, grupos e gestão de usuários. Separar o carregamento é uma prioridade, mas o ganho precisa ser medido no navegador.
- O mascote transparente tem aproximadamente 1,4 MB. A apresentação utiliza uma cena Three.js e imagens próprias de catálogo.
- Existem **73 grupos de Facebook** cadastrados, com normalização de links e testes contra duplicatas. Foram localizadas fontes públicas candidatas para ampliar a pesquisa; isso não confirma que todos os grupos estejam ativos ou permitam divulgação.
- A conta correspondente ao Cauã é **kawan@gmail.com**, marcada como influenciador e com vendas automáticas ativadas. Em **13/10/2026**, as 50 vendas já ocorridas somam **R$ 17.828,25 de faturamento e R$ 2.423,90 de comissão**. Há também vendas automáticas agendadas para horários posteriores.
- O admin apresenta gestão de usuários. O webhook da Applyfy atualiza o plano, mas não há tabela própria de histórico de pagamentos/processamento. Algumas falhas de criação de conta são apenas registradas em logs e não impedem uma resposta de sucesso.
- Compradores não recebem senha compartilhada: a conta é criada com senha aleatória e o cliente escolhe a sua pelo **Primeiro acesso**.

## 1. Pacote de refatoração aplicado ao projeto
- Medir abertura, navegação, troca de filtros, interação com gráfico, carregamento de fotos e custo das animações antes e depois.
- Refatorar por partes, mantendo identidade, conteúdo, endereços, checkout, integração Mercado Livre, permissões e separação entre dados reais e testes.
- Carregar abas secundárias apenas quando necessárias, com estados de espera discretos e dimensões estáveis. Evitar baixar a gestão do admin para quem não pode acessá-la.
- Revisar cálculos repetidos, atualização de dados e renders desnecessários. Não recalcular o histórico inteiro ao mover o mouse; revisar atualização quando a página fica em segundo plano.
- Remover código, CSS, importações e dependências somente quando o uso tiver sido auditado, incluindo classes montadas dinamicamente. Não apagar arquivos apenas pelo tamanho ou por parecerem antigos.
- Organizar as mudanças como um conjunto completo aplicado no projeto; não criar um ZIP ou arquivo de código separado sem solicitação.

## 2. Imagens e motion leve
- Otimizar o mascote preservando transparência e nitidez, produzir tamanhos apropriados e revisar as fotos efetivamente exibidas.
- Priorizar a imagem principal; carregar fotos abaixo da primeira tela e listas sob demanda, com largura/altura reservadas e substituição discreta se uma foto falhar.
- Padronizar movimentos curtos de entrada, troca de abas e feedback usando principalmente opacidade e transformação, sem animar propriedades que reposicionam a página.
- Manter uma cena Three.js leve: ajustar resolução/custo conforme dispositivo e suspender animação quando fora da tela ou com a página oculta. Não adicionar efeitos pesados nem outra biblioteca de motion por padrão.
- Respeitar a preferência por menos movimento e manter navegação, filtros e botões imediatamente utilizáveis.
- Conferir o gráfico de Hoje: picos e totais apenas de vendas já ocorridas, nunca de horários futuros.

## 3. Mais de 200 novos grupos de Facebook
- Meta: adicionar **pelo menos 201 grupos novos e únicos**, chegando a pelo menos **274 no total**, em achadinhos, brique/brick, compra e venda e troca e venda.
- Pesquisar fontes públicas, extrair candidatos, confirmar que os endereços são de grupos do Facebook e registrar a fonte de cada entrada.
- Normalizar URLs, remover duplicatas entre as novas entradas e os 73 grupos existentes e preservar pesquisa, filtros e cadastro manual.
- Usar paginação ou carregamento progressivo para a ampliação não deixar a lista pesada.
- Não inventar nomes, links, membros ou permissão para divulgar. Se a pesquisa não fornecer 201 grupos verificáveis, adicionar somente os confirmados e informar a quantidade e a pendência real.

## 4. Ajuste do Cauã, sem pausar vendas
- Alterar somente os eventos de teste já ocorridos hoje na conta **kawan@gmail.com**, para totalizarem exatamente **R$ 1.980,00 de faturamento bruto** e **R$ 787,00 de comissão** no momento do ajuste.
- Preservar as 50 vendas, produtos, horários já ocorridos e o histórico anterior; repartir os centavos para que as somas fechem sem erro de arredondamento.
- **Manter o automático ativado e preservar as vendas futuras de hoje.** Os totais aumentarão quando os respectivos horários chegarem.
- Refletir a correção no Hoje, 7 dias, 30 dias e Mensal sem contar eventos duas vezes. Manter a identificação de modo teste; essa comissão ilustrativa não é uma taxa oficial do Mercado Livre.
- Conferir as somas salvas e o painel autenticado da conta após o ajuste.

## 5. Nova aba Assinaturas no admin
- Acrescentar **Assinaturas** à administração, acessível também pela navegação administrativa do painel, junto da gestão de usuários existente.
- Mostrar resumos e lista pesquisável por cliente/e-mail, com filtros de plano, período e situação: ativo, expirado, cancelado, pagamento recusado e erro de processamento.
- Separar claramente **pagamento**, **liberação do plano** e **criação da conta**. Uma compra aprovada não deve aparecer como conta criada com sucesso se essa etapa falhou; conta já existente é um resultado distinto, não um erro.
- Cada registro mostra o cliente identificado no aviso, plano mensal/vitalício, datas, vencimento, situação informada pela Applyfy, resultado do processamento e motivo seguro da falha. Detalhes exibem a sequência de eventos recebidos.
- Gravar um histórico durável dos próximos avisos verificados da Applyfy, incluindo cancelamentos, reembolsos, recusas, eventos ignorados e falhas de criação/liberação. Não gravar tokens, senhas ou chaves.
- Evitar que avisos repetidos liberem ou renovem o mesmo pagamento duas vezes, inclusive em reenvios e processamento simultâneo. Conferir o identificador real disponível nos payloads antes de fechar a estratégia de deduplicação.
- Exibir membros atuais como situação conhecida, sem inventar transações antigas ou marcar erro de pagamento apenas porque o plano venceu. O histórico detalhado começa com a nova gravação; avisos não enviados pela Applyfy não podem ser mostrados como recebidos.
- Preservar a senha individual escolhida pelo cliente e o fluxo Primeiro acesso; nenhuma senha aparece na administração.

## Detalhes técnicos
- Manter TanStack Start e os componentes/tokens existentes; módulos pequenos para apresentação, views carregadas sob demanda e lógica pura de agregação.
- Usar funções protegidas por `requireAdmin` para consultas administrativas. Criar o histórico de integração por migração com permissões explícitas e RLS, sem acesso público ou de clientes comuns.
- Verificar o remetente do webhook antes de qualquer gravação privilegiada. Validar os campos, tratar todos os erros de gravação e registrar resultados reais, sem responder sucesso quando o processamento necessário falhar.
- Consultar exemplos reais dos eventos para mapear status e identificadores corretamente; não presumir que a API lista compras por e-mail nem prometer consulta que ela não oferece.
- Atualizar `roadmap.md` com todas as tarefas deste plano e as novas solicitações; registrar decisões estruturais em `AGENTS.md` e manter os títulos/metadados próprios das páginas.

## Validação e entrega
- Rodar os testes afetados e acrescentar testes de valores exatos do ajuste, bloqueio de acesso administrativo, processamento repetido, falhas de criação/liberação, planos e deduplicação de grupos.
- Conferir a apresentação, imagens, scroll, abas, filtros e gráfico no navegador, incluindo preferência por menos movimento.
- Verificar o admin autenticado e o painel do Cauã com leitura dos valores corrigidos; testar novos registros de assinatura com casos controlados sem criar cobranças reais.
- Comparar medições antes/depois e relatar ganhos observados, quantidade real de grupos adicionados e qualquer limite de validação externa.
- Não publicar automaticamente. A versão pública e o recebimento dos novos históricos dependem da atualização da publicação.