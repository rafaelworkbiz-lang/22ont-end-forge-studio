# "Adicionar a Meus produtos" fluido e bonito

## Primeiro: achar exatamente o bloco feio
Hoje existem dois caminhos que abrem a escolha "Onde adicionar":
- o botão **Adicionar** direto no cartão do produto (abre a janela "Adicionar produto");
- o botão **Adicionar a Meus produtos** dentro da janela de detalhes do produto (troca o conteúdo da janela).

Vou abrir os dois na tela com a conta de teste, em Produtos validados e em Meus produtos, e tirar fotos para ver qual está quebrado. Ainda não confirmei qual dos dois você viu: se puder, manda uma foto.

## Como vai ficar (nos dois caminhos, igual)
- **Sem trocar de janela nem piscar:** ao clicar, a parte de baixo dos detalhes desliza para cima e aparece um painel "Onde adicionar" dentro da mesma janela. A foto e o nome do produto continuam no topo.
- Painel com cantos redondos, opções em pílula ("Só Meus produtos", "Meus produtos + loja …"); a escolhida fica amarela clara com um visto.
- "+ Nova loja" discreto logo abaixo.
- Botões **Voltar** e **Adicionar** no rodapé; Voltar desliza de volta para os detalhes.
- Ao confirmar: o botão vira um visto verde "Adicionado" com uma animação curta, o painel fecha sozinho e o botão do produto passa a mostrar "Em Meus produtos". Um aviso pequeno no canto oferece "Ver Meus produtos".
- A altura da janela muda suave, sem pulos; no celular o painel sobe de baixo como uma gaveta.
- Quem prefere menos movimento no aparelho vê a troca sem animação.

## Detalhes técnicos
- `library.tsx` (ViewDialog) e `janelas.tsx` (AdicionarProdutoJanela) passam a usar um único componente de painel com transição (grid-rows 0fr→1fr / translateY) em vez de substituir o conteúdo.
- Remover as regras duplicadas `.lib-view.is-adding` e `.janela .lib-add*` do `styles.css`, trocando por um único bloco de estilo do painel.
- `AddContent` mantém a mesma lógica de salvar (`useMyProductActions`); só muda a apresentação.
- Conferir com fotos no computador (1716px) e no celular (390px).
