# PATCH-001.2 – Workspace do produto (aba Produtos)

Substitui o modal atual por um "workspace" em tela cheia na aba Produtos. Regras do 001 e 001.1 continuam (tag confirmada, elegibilidade em 3 estados, publicação manual, link montado localmente). Dashboard, Admin e pagamentos não são tocados. Ao final, o site é publicado.

## 0. Correção primeiro: link sem tag
- Sem tag confirmada, nenhum link é mostrado, copiado ou aberto: workspace, atalhos do card, mensagem pronta, WhatsApp e "Abrir no ML".
- No lugar: "Confirme sua tag para gerar o link" + botão Confirmar. Ao confirmar, libera na hora, sem recarregar.
- Teste automático garantindo que sem tag não sai link algum.

## 1. Estrutura (computador)
- Topo: "← Catálogo", categoria, "N de T" com ‹ ›, selo da tag (com Confirmar), fechar.
- Esquerda: 5 etapas numeradas (Visão geral, Link, Mensagem, Grupos, Perfil ML), ativa em dourado, concluída com ✓; legenda dos atalhos.
- Centro: conteúdo da etapa + "Próximo passo: …".
- Direita fixa: foto, título, preço, progresso das etapas 2–5, "Copiar link de afiliado", "Próximo produto →".
- Rodapé "Na fila": miniaturas da lista filtrada, atual com borda dourada.

## 2. Etapas
- Visão geral: galeria com zoom, chips Novo/Frete grátis/Quente, 4 métricas (Preço, Frete, Vendidos, Vendedor em 3 estados).
- Link: campo com link com tag, Copiar, Testar link, tag visível e domínio mercadolivre.com.br.
- Mensagem: modelos dos Scripts à esquerda, prévia em balão de WhatsApp, Copiar e Enviar no WhatsApp.
- Grupos: grupos Facebook/WhatsApp da categoria (senão os gerais), Abrir grupo, Marcar postado / ✓ Postado, "X de Y postados hoje".
- Perfil ML: aviso de elegibilidade nos 3 estados, passos 1-2-3, Marcar como publicado / Desfazer, "Ver meu perfil" quando houver endereço. Nenhum sucesso falso.

## 3. Progresso salvo
- ✓ por etapa, por produto e por pessoa: Link = copiou; Mensagem = copiou/enviou; Grupos = 1+ postado; Perfil = publicado.
- Card do catálogo ganha indicador "2/4".

## 4. Navegação
- Endereço guarda produto e etapa; voltar fecha; recarregar mantém.
- Teclado: ←/→ produto, 1–5 etapa, C copia, Esc fecha (ignorado em campos de texto).
- Trocar produto mantém a etapa; carrega vizinhos antes; esqueleto de carregamento; transições curtas.

## 5. Celular (<768px)
Tela cheia de baixo para cima com alça, ‹ N de T › com deslizar, mini-cabeçalho, etapas em pílulas, rodapé fixo com Próximo passo + Copiar link.

## 6. Verificação e publicação
- Testes automáticos das regras (sem tag = sem link, cálculo do progresso, contador de grupos).
- Conferência no navegador em computador e 390px com a conta de teste.
- Publicar o site no final.

## Detalhes técnicos
- Novas tabelas `grupo_postagens` (id, user_id, item_id, grupo_id, postado_em) e `produto_progresso` (user_id, item_id, etapa, concluido_em, único por trio), com GRANT a authenticated/service_role e RLS só do dono.
- Busca com `?produto=&etapa=` via validateSearch + fallback na rota /painel.
- Novo `src/components/product-workspace.tsx` (+ partes por etapa), substituindo `product-modal.tsx`; guarda de link centralizada em `src/lib/product-share.ts` (retorna null sem tag confirmada), usada também por `products-catalog.tsx`.
- Grupos vêm dos módulos de dados existentes de Facebook/WhatsApp, filtrados por categoria.
