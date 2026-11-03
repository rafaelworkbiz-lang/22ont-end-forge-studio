# PATCH-011 (conclusão) — Converter as janelas que faltam

Objetivo: todas as janelas do painel passam a abrir pela mesma casca global, com endereço próprio (?janela=...), funcionando com voltar, recarregar e link compartilhado. Sem mudar regras de negócio.

## Janelas a converter
1. Meus produtos — "Escolher loja" (adicionar produto à loja).
2. Divulgação — "Mensagem e arte" (prévia WhatsApp/Facebook, copiar, baixar artes).
3. Produtos validados — detalhe do produto e "Adicionar aos meus produtos".
4. Fornecedores — conectar/editar Mercado Livre e Shopee.
5. Admin — formulários de usuários, assinaturas, grupos e cupons.
6. Scripts de produto e saldo de teste (influenciador).

## Comportamento comum a conferir
- Fechar com Esc, clique fora e botão; no celular, arrastar para baixo.
- Janela sobre janela (ex.: Escolher loja dentro do detalhe do produto).
- Foco fica preso na janela e volta ao botão de origem ao fechar.
- Página de trás não rola enquanto a janela está aberta.
- Movimento reduzido respeitado.

## Verificação
- Testes automáticos atuais continuam passando + testes de abrir/fechar pelo endereço.
- Navegador na conta de teste: desktop 1280×720 e celular 390px para cada janela; recarregar e voltar.
- Métricas da loja continuam desativadas (não existe tela ainda). Nada é publicado.

## Detalhes técnicos
- Cada janela entra no registro de `janela.tsx` com parâmetros validados; componentes atuais de Dialog são movidos para o conteúdo da janela, mantendo a lógica.
- Abertura via helper `abrirJanela(nome, params)` que atualiza a URL; JanelaHost já montado no PanelShell.
- Pilha de janelas guardada como lista na URL para janelas empilhadas.
