# PATCH-008 · Fase 7 — Divulgação v2

Substituir as telas antigas de Grupos (Facebook/WhatsApp) e Scripts por uma nova aba Divulgação, migrando o que já existe. A postagem continua sempre manual: o sistema prepara mensagem, arte e link e abre o app, e o usuário posta.

## O que o usuário vai ver

**Divulgação (/painel/divulgacao)**: cabeçalho com o contador "{n} postagens hoje" e 3 abas em cartões grandes (a ativa fica amarela). A aba escolhida fica no endereço da página (?aba=).

1. **Buscar grupos**: bloco amarelo de busca com pílulas de palavras-chave e filtro de nicho, 3 cartões explicativos (Busque, Salve, Organize) e resultados com 20 por página. Cada resultado tem selo da rede com o nome escrito, membros, regra resumida, "Salvar", "Marcar postado" e um menu ⋯ com "Abrir grupo" e "Denunciar link". Se o usuário marcar postado antes do intervalo do grupo, aparece um aviso pedindo confirmação. Resultado vazio mostra uma mensagem amigável.
2. **Meus grupos**: grupos salvos com a última postagem, "pode postar" ou "aguarde {x}h", e os botões Abrir, Marcar postado e Remover (com Desfazer).
3. **Mensagem e arte**: escolha do que divulgar (loja publicada, categoria ou produto), modelos em pílulas, texto editável com as variáveis já preenchidas, prévia no estilo WhatsApp ou Facebook, link com o canal certo, arte 1:1 e 9:16 para baixar, e os botões "Copiar mensagem", "Abrir no WhatsApp" e "Copiar e abrir grupo do Facebook". Toda ação fica registrada. Uma faixa amarela clara traz dicas contra spam. Quem não tem loja publicada vê um aviso e o botão "Colocar uma loja no ar".

**Integrações**: "Divulgar nos grupos" (Colocar no ar e Minhas lojas) abre direto a aba Mensagem com a loja escolhida. A etapa de grupos no workspace do produto passa a usar os grupos novos. Os endereços antigos de grupos e scripts levam para Divulgação.

**Admin, aba "Grupos"**: listar, buscar, criar, editar, desativar, importar CSV, marcar como verificado e ver denúncias (com a ação "desativar grupo"). Os modelos de mensagem também são gerenciados ali.

## Regras de link
- Loja: `afiliaplace.site/loja/{endereço}?c=whatsapp|facebook`. Categoria: o mesmo endereço com `#categoria`.
- Produto: `/r/{loja}/{meu_produto}?c=…`. Sem loja publicada, usa o link de afiliado direto do produto (só quando a tag estiver confirmada).
- A página pública da loja repassa o `?c=` para os links dos produtos, para o clique chegar com o canal certo. O registro de cliques já lê o `c`.

## Detalhes técnicos
- Migração com as tabelas `grupos`, `grupos_salvos`, `divulgacoes`, `grupo_denuncias` e `modelos_mensagem`, com permissões e RLS: grupos e modelos só podem ser lidos por quem tem acesso ativo (`tem_acesso_ativo`) e editados pelo admin. As outras tabelas ficam visíveis só para o dono, e as denúncias só podem ser criadas pelo dono e lidas pelo admin. Índice GIN de busca em português sobre nome, nichos e palavras-chave.
- Carga inicial: os grupos de `facebook-groups-data.ts` e `whatsapp-groups-data.ts` e os Scripts atuais entram como inserts na migração. As linhas de `grupo_postagens` são copiadas para `divulgacoes`, e a tabela antiga fica marcada como DEPRECATED, sem ser apagada.
- Server functions (`divulgacao.functions.ts`): busca paginada, salvar/remover, marcar postado (devolve as horas desde a última postagem para o aviso), contador do dia, denúncia e registro de divulgação. As funções do admin usam `requireAdmin`.
- A arte é feita em canvas no navegador com banner/logo, cor, nome e frase da loja, e baixada como PNG em 1080×1080 e 1080×1920.
- Interface: abas com tablist e navegação pelas setas do teclado, contador com aria-live, busca com debounce de 300ms e skeleton, e uma única ação amarela por bloco.
- Testes unitários para montar os links com canal, preencher as variáveis e calcular o intervalo. Depois, os 9 testes da especificação na conta de teste, incluindo celular de 390px.
- Limitação: o teste 4 (clique com canal pela loja publicada) depende de a conta de teste ter uma loja publicada, o que exige o Mercado Livre conectado com a tag confirmada.
