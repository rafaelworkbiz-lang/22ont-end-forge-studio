Menu flutuante do início e lojas em grade de 3

## 1. Minhas lojas: grade de 3 cartões horizontais
- Voltar para 3 cartões por linha (2 no notebook menor, 1 no celular), em vez de um cartão por linha esticado.
- Cada cartão fica "deitado" (mais largo que alto): a capa da loja em cima, curta e larga, e embaixo o nome, o endereço, o status e os botões, em formato retangular compacto.
- Todos os cartões com a mesma altura; o botão "Nova loja" segue o mesmo tamanho.

## 2. Menu lateral no estilo do começo
- Menu como um cartão solto, com cantos bem arredondados e sombra suave, "flutuando" por cima da borda do conteúdo, como no primeiro desenho do painel.
- Sem lupa no topo; só logo, nome e o botão de recolher.
- Ao recolher, vira uma coluna fina de ícones, ainda flutuando.
- No celular continua a barra de baixo, sem mudança.

## Detalhes técnicos
- Só estilos em styles.css: substituir o bloco "Lojas em formato horizontal" (st-grid 3 colunas, st-card em coluna com banner aspect ~16/6 e corpo compacto) e ajustar o bloco "Menu flutuante sobrepondo o conteúdo" (margem/sobreposição maior, sombra, raio 28px, também no modo compacto).
- Conferir no navegador em 1716x994, 1366x657 e 390px na conta de teste.
