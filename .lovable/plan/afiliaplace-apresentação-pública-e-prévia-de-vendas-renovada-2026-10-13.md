# AfiliaPlace: apresentação pública e prévia de vendas renovada

## 1. Endereços claros
- `/`: apresentação sempre pública, inclusive para quem já está conectado.
- `/painel`: painel do afiliado; sem sessão, encaminha para `/auth`.
- `/auth`: entrar ou criar conta; após entrar, encaminha para `/painel`.
- Preservar `/admin`, `/docs` e `/reset-password`.
- Na apresentação, mostrar **Acessar painel** para quem já estiver conectado.
- Atualizar os retornos de login e conferir os retornos da integração Mercado Livre para que levem ao lugar certo.

**Situação conferida:** atualmente `/` mostra a apresentação apenas sem sessão; com sessão, mostra o painel. Isso pode explicar a diferença percebida, mas a versão publicada ainda precisa ser conferida. Verificar o domínio publicado com e sem sessão, sem assumir que a publicação está atualizada. Depois das mudanças, a versão pública precisa ser atualizada no diálogo de publicação.

## 2. Catálogo na apresentação
- Acrescentar uma seção de produtos com fotos nítidas, nomes, categorias e composição de catálogo de loja: organizada, sem blocos genéricos ou aparência de template.
- Mostrar uma seleção representativa de eletrônicos, casa e acessórios, com ação para acessar os produtos no painel.
- Não expor a busca protegida para visitantes nem inventar rankings, preços atuais ou percentuais oficiais. Identificar a seleção como prévia quando não houver dados atuais verificados.
- Preservar AfiliaPlace escrito junto, o mascote, a navegação arredondada e a identidade dourada sobre fundo escuro.

## 3. Prévia “Vendas de hoje”
- Dar à prévia uma perspectiva levemente deitada no computador, ajustando suavemente a inclinação quando ela entra na tela; no celular, priorizar leitura e estabilidade.
- Animar pedidos, faturamento e comissão juntos, de zero até os totais, uma vez quando o bloco aparecer durante a rolagem. Se já estiver visível ao carregar, iniciar nesse momento.
- Ampliar o exemplo para cerca de **120 pedidos, R$ 38.740,80 de faturamento e R$ 3.486,67 de comissão**. São valores ilustrativos, não promessa de ganho ou saldo de conta.
- Adicionar pelo menos seis produtos vendidos à prévia, com faturamento e comissão separados; manter os exemplos coerentes com os totais.
- Manter **Valores ilustrativos** visível e aplicar a mesma identificação ao exemplo de comissão junto ao mascote.
- Respeitar a preferência por menos movimento, sem animações contínuas nem travadas na rolagem.

## 4. Conteúdo e planos completos
- Destacar uso no **celular e notebook**, com uma apresentação visual dos dois formatos.
- Incluir nos recursos e nos dois planos: catálogo, links com a própria tag quando disponível na integração, scripts e mensagens prontas, grupos de achadinhos e de compra e venda no Facebook e WhatsApp, painel com faturamento e comissão separados e acesso à comunidade.
- A comunidade foi confirmada como existente. Incluir o benefício nos planos, sem inventar endereço de convite; o endereço poderá ser fornecido para conectar o acesso.
- Apresentar o painel atualizado como recurso, mas não prometer rastreamento real “ao vivo” sem uma fonte oficial confirmada. Diferenciar a animação da prévia dos relatórios reais.
- Preservar os preços atuais: **Mensal R$ 179,90** e **Vitalício R$ 259,90**; esta atualização não altera preços nem cria cobrança.
- Atualizar as dúvidas frequentes sobre dispositivos, comunidade, grupos, mensagens e integração.

## Detalhes técnicos
- Extrair o acesso autenticado da página inicial para uma nova rota `/painel`, reutilizando o painel existente e o provedor de sessão.
- Revisar todos os links e redirecionamentos afetados, incluindo confirmação de conta e retorno do Mercado Livre, sem mudar permissões ou regras financeiras.
- Manter alterações visuais restritas à apresentação; não modificar vendas, saldos de influenciadores ou comissões reais.
- Usar os estilos e controles compartilhados, imagens locais e animações por `transform` com contadores acionados por visibilidade. Não acrescentar outra cena pesada apenas para inclinar a prévia.
- Definir títulos e descrições próprios para `/` e `/painel`, preservando os demais endereços e os metadados existentes.
- Registrar a separação entre apresentação e painel nas regras de arquitetura do projeto.

## Validação
- Abrir `/` conectado e desconectado: a apresentação aparece nos dois casos.
- Abrir `/painel` sem sessão: chega a `/auth`; entrar: chega a `/painel` e lê os resultados da conta.
- Conferir os links de apresentação, painel, planos, catálogo e retornos da integração.
- Conferir fotos, inclinação, contadores e leitura em computador e celular, sem sobreposição ou perda de fluidez.
- Validar que os totais animam juntos uma única vez e que a preferência por menos movimento é respeitada.
- Executar os testes relevantes e conferir os avisos da página antes de concluir; verificar novamente o domínio após atualizar a publicação.