Fornecedores: botão "Usar esse fornecedor" com perguntas em janela

## Como vai ficar
- A aba Fornecedores abre direto com os cartões do Mercado Livre e da Shopee (as perguntas saem do meio da página).
- Em cada cartão, o botão principal passa a ser **"Usar esse fornecedor"** (no lugar de "Conectar com Mercado Livre").
- Ao clicar, abre uma **janela por cima da página** (não muda de aba), com o mesmo visual amarelo e a mesma animação de troca de pergunta que você gostou.
- As perguntas são as mesmas para os dois, só muda o nome e os links de cada um:
  1. Você já tem conta no Mercado Livre / Shopee? (Sim / Ainda não → mostra onde criar)
  2. Você já é afiliado? (Sim / Ainda não → mostra onde se cadastrar)
  3. Pronto → botão "Conectar minha conta" dentro da própria janela.
- Mercado Livre: o botão final faz a conexão normal de hoje.
- Shopee: o caminho aparece igual, mas no final avisa que a ligação ainda está sendo preparada (você vai cadastrar o APP ID e a chave depois).
- Quem já tem a conta conectada vê o cartão normal, com "Reconfirmar tag" e os outros botões, sem perguntas.
- O "Passo a passo" de baixo continua, e "Refazer perguntas" passa a só limpar as respostas guardadas.

## Detalhes técnicos
- Nova janela `fornecedor` no registro de janelas (`?janela=fornecedor&f=ml|shopee`), renderizada pelo JanelaHost, reaproveitando o conteúdo de `SupplierOnboarding` parametrizado por fornecedor (textos/links por fornecedor, passo guardado por conta+fornecedor no navegador).
- Remover o gate `ready` em painel.fornecedores.tsx; cartões sempre visíveis.
- MeliSupplierCard/ShopeeSupplierCard: botão desconectado vira "Usar esse fornecedor" abrindo a janela; passo final chama o `connect` existente (ML) ou mostra aviso (Shopee).
- Reaproveitar as classes `sob-*` e a animação atual dentro da janela.
- Conferir no navegador com a conta de teste (computador e celular).
