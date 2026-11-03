## Arrumar a etapa "Adicionar produto" dentro da janela do produto

O que está feio hoje (pelo print):
- O conteúdo ocupa só a metade esquerda da janela larga, sobrando um vazio enorme à direita.
- O título "Adicionar produto" está colado na borda, sem respiro.
- A faixa amarela do produto encosta nas bordas e não tem cantos arredondados.
- Botões Cancelar/Adicionar ficam soltos no meio.

O que vou fazer:
1. Quando a etapa "Onde adicionar" estiver aberta, a janela fica mais estreita (tamanho médio) e centralizada, sem espaço vazio.
2. Título com o mesmo espaçamento das outras janelas, com botão de voltar para os detalhes.
3. Cartão do produto amarelo com cantos bem arredondados, foto redonda, nome em negrito e preço abaixo, com margem em volta.
4. Opções "Onde adicionar" ocupando a largura toda, cantos arredondados, a escolhida destacada em amarelo claro.
5. "+ Nova loja" e os botões Cancelar/Adicionar alinhados à direita no rodapé, com pontas redondas.
6. Conferir na tela com a conta de teste (computador e celular).

### Detalhes técnicos
- library.tsx (ViewDialog): ao entrar no modo adicionar, trocar a classe de tamanho do DialogContent e renderizar AddContent em contêiner de coluna única com padding.
- library-shared.tsx (AddContent): estilos via classes novas em styles.css (lib-add-*), sem cores fixas nos componentes.
