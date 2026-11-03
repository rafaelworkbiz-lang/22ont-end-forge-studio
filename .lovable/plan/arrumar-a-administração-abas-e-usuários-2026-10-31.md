# Arrumar a Administração (abas e Usuários)

## O que muda
1. **Sai a aba "Visão geral".** A Administração passa a abrir direto em **Usuários**. Endereços antigos com "Visão geral" também abrem Usuários.
2. **Menu lateral:** sai o item "Assinaturas" de baixo de "Administração", porque ele repete a aba que já existe lá dentro. O endereço antigo leva para a aba Assinaturas.
3. **Lista de usuários alinhada como uma tabela:**
   - Uma linha de títulos fixa em cima: Cliente · WhatsApp · Plano · Ações.
   - Todas as colunas na mesma posição em todas as linhas, com ou sem o botão de renovar.
   - A inicial do nome fica num círculo amarelo, não mais solta.
   - Linhas mais baixas, com espaçamento uniforme. "Criado", "Último acesso" e "Lojas" ficam numa linha menor e mais clara.
   - O telefone falso "+55 (00) 0000-0000" deixa de aparecer. Quem não tem telefone mostra "Sem WhatsApp", sem link.
4. **Topo da aba:**
   - Abas em uma faixa só, com espaço entre elas e o título "Usuários".
   - Título, texto e o botão "Criar usuário" alinhados na mesma linha.
   - Busca, filtros e caixas de marcar em uma barra única, sem quebra torta.
5. **Celular:** cada usuário vira um cartão empilhado, com as ações embaixo.

## Detalhes técnicos
- `admin-hub.tsx`: remover `visao` de `ADMIN_TABS` e o componente `Overview`. A aba padrão passa a ser `usuarios`.
- `panel-shell.tsx`: remover o item de menu Assinaturas. `painel.assinaturas.tsx` vira redirect para `/painel/usuarios?aba=assinaturas`.
- `users-manager.tsx`: cabeçalho da lista, coluna de ações com largura fixa, avatar com a classe `.um-avatar` e ocultar o telefone placeholder (`0000000000`).
- `styles.css`: grid `.um-row` com colunas fixas (`minmax(0,2.4fr) 180px 200px 240px`), `.um-head`, `.um-avatar`, espaçamentos de `.um-filters`, cabeçalho da aba e regras mobile. Tudo restrito a `.um-*`.
- Depois, conferir com captura de tela em 1716px e 390px.
