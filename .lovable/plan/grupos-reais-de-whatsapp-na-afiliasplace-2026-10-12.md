# Grupos reais de WhatsApp na Afiliasplace

## Objetivo
Aplicar na aba **Grupos WhatsApp** a mesma organização visual da aba Facebook, com grupos de vendas, achadinhos, promoções e cupons pesquisados por nós em fontes públicas.

## Lista real, sem dados inventados
- Buscar convites públicos diretos `chat.whatsapp.com`, associando nome, categoria e fonte de cada grupo.
- Trabalhar com a meta de **até 500 grupos distintos**, incluindo somente os encontrados. Se a pesquisa reunir menos, mostrar a quantidade real, sem preencher com exemplos.
- Conferir as páginas públicas de convite quando acessíveis. Um convite publicado não garante que continue ativo, tenha vagas ou permita divulgação.
- Priorizar grupos cuja descrição permita vendas ou divulgação; identificar permissão desconhecida quando não houver confirmação e excluir os que declarem postagem exclusiva de administradores.
- Mostrar quantidade de membros somente quando a fonte realmente informar esse dado, com indicação de que é informado pela fonte. Caso contrário: **“Membros não informados”**. Não confundir acessos da página com membros do grupo.
- Não entrar nos grupos, coletar contatos, enviar mensagens automaticamente ou prometer comissões.

## Tela e controles
- Abrir uma tela completa ao selecionar **Grupos WhatsApp**, em vez do diálogo genérico atualmente usado no menu.
- Manter o dourado com cinza claro, os temas e o padrão visual da lista Facebook.
- Exibir nome, nicho, membros quando conhecidos e situação da permissão de divulgação em cada grupo.
- Incluir **Copiar link** e **Acessar grupo**, apontando para o convite direto.
- Disponibilizar busca por nome, filtros por nicho, ordenação por nome ou membros conhecidos e **Mostrar mais grupos**.
- No topo, incluir **Adicionar grupo por URL**, com convite, nome, nicho e quantidade opcional de membros; validar o domínio e impedir duplicatas.
- As adições manuais ficam disponíveis nesta sessão; salvar entre acessos não faz parte deste patch de apresentação.
- Mostrar o total real de grupos e somar somente membros conhecidos, sem apresentar a soma como pessoas únicas.

## Detalhes técnicos
- A aba Facebook já usa busca, filtros, cartões e botões compartilhados; reutilizar esses estilos sem modificar seus dados nesta tarefa.
- Criar um módulo browser-safe com os grupos pesquisados e suas fontes, separado da tela de WhatsApp.
- Integrar a nova tela no componente do painel, mantendo a arquitetura frontend existente; sem WhatsApp conectado, login ou serviço de envio.
- Usar o Button compartilhado, confirmar a cópia antes de mostrar sucesso e abrir convites em nova aba com proteção adequada.
- Registrar a organização do novo módulo em AGENTS.md e o escopo de WhatsApp na documentação.

## Validação
- Conferir que os registros têm nomes e convites provenientes de fontes públicas, sem links ou números fabricados.
- Testar abertura da aba, busca, filtros, cópia, acesso ao convite, adição válida, rejeição de URL inválida e duplicatas.
- Verificar que grupos sem contagem não aparecem como zero e que a lista continua organizada em telas pequenas.

## Limites
A pesquisa inicial já encontrou convites diretos em uma fonte pública de vendas. A quantidade final, a atividade dos grupos e a permissão de publicar precisam ser verificadas durante a coleta; **500 não é uma quantidade garantida**. A publicação das ofertas será feita pelo próprio usuário no WhatsApp, respeitando as regras de cada grupo.