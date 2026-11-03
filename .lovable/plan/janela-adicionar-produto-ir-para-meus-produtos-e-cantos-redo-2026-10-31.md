# Janela "Adicionar produto": ir para Meus produtos e cantos redondos

## O que muda
- Ao clicar em **Adicionar** dentro da janela, o produto é salvo, a janela fecha e você vai direto para a aba **Meus produtos**, já vendo o produto lá.
- Se você escolher adicionar também a uma loja, o mesmo acontece (vai para Meus produtos).
- O botão amarelo e os outros botões da janela ficam com as pontas totalmente redondas.
- A janela, a foto do produto e as opções de "Onde adicionar" ganham cantos bem arredondados.

## Detalhes técnicos
- `src/components/library-shared.tsx` AddContent: no `onSuccess` do `addMut`, navegar para `/painel/meus-produtos` (substitui o fechar da janela, limpando `?janela`).
- `src/styles.css`: `.lib-add .lib-add-actions button`, `.lib-add-head img`, `.lib-radio` com border-radius 999px / 18px; janela já arredondada mantém o padrão.
