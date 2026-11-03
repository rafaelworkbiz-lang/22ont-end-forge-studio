# PATCH-011 (continuação) — Janelas restantes

Objetivo: terminar a conversão das janelas do painel para a casca global com endereço próprio (?janela=...), sem mudar regras de negócio.

## Janelas a converter
1. Meus produtos — "Escolher loja" (hoje é um menu suspenso; vira janela com a lista de lojas e "Nova loja").
2. Fornecedores — conectar/editar Mercado Livre e Shopee.
3. Admin — formulários de usuários, assinaturas e grupos.
4. Scripts de produto e saldo de teste (influenciador).
5. Excluir loja — confirmação vira janela pequena.

"Mensagem e arte" continua como aba da Divulgação (já tem endereço próprio).

## Verificação
- Testes automáticos atuais + testes de abrir/fechar pelo endereço.
- Navegador na conta de teste: cada janela em 1280×720 e 390px; recarregar, voltar, Esc e clique fora; janela sobre janela; foco volta ao botão de origem; arrastar para fechar no celular.
- Nada publicado.

## Detalhes técnicos
- Novos nomes no registro `JANELAS` de `janela.tsx`, conteúdos em `janelas.tsx`, carregados sob demanda.
- Conteúdo extraído dos Dialogs atuais para componentes sem casca, mantendo a lógica e as funções do servidor.
- Parâmetros novos adicionados a `JANELA_KEYS` e ao validador de busca de `/painel`.
