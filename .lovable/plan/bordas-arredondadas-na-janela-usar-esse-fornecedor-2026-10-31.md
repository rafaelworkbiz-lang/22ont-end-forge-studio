## Bordas arredondadas na janela "Usar esse fornecedor"

O que muda (só visual, Mercado Livre e Shopee):
- A janela inteira fica com cantos bem arredondados (cerca de 28px, igual ao menu lateral).
- A área de dentro (com a pergunta e os botões) também ganha cantos arredondados, para não aparecer canto reto por dentro.
- Os botões "Sim, já tenho" / "Ainda não" continuam com as pontas totalmente redondas.
- No celular, os cantos ficam um pouco menores (cerca de 22px) para caber bem.

Nada muda nas perguntas, nos links nem na conexão.

### Detalhes técnicos
- styles.css: aplicar `border-radius: 28px; overflow: hidden` na caixa da janela M usada pelo JanelaHost (janela.tsx, linha ~82) e na seção `.sob-*` de suppliers-onboarding.tsx; regra menor em ≤640px.
- Conferir com Playwright na conta de teste em /painel/fornecedores?janela=fornecedor&f=ml.
