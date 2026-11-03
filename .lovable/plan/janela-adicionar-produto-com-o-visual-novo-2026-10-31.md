# Janela "Adicionar produto" com o visual novo

## O que está errado (pela sua foto)
Essa janela é a que abre pelo botão **Adicionar** direto no cartão do produto (fora da janela de detalhes). O visual novo foi aplicado só na versão que abre *dentro* dos detalhes do produto, então esta ficou com o estilo antigo: faixa amarela quadrada e esticada, espaço vazio à direita, conteúdo desalinhado.

## O que vai mudar
- Janela mais estreita e centralizada, sem o espaço vazio à direita.
- Cartão amarelo do produto com cantos bem redondos e foto redonda.
- Opções "Onde adicionar" ocupando toda a largura, com pontas redondas; a escolhida fica marcada em amarelo claro.
- "+ Nova loja" alinhado à esquerda, logo abaixo das opções.
- Linha fina separando o rodapé, com Cancelar e Adicionar à direita.
- Mesmo visual em Produtos validados e em Meus produtos, para qualquer tipo de conta, no computador e no celular.

Depois, conferir com foto da tela nos dois lugares, e publicar se você pedir.

## Detalhes técnicos
- `styles.css`: aplicar as regras de `.lib-view.is-adding` também quando o conteúdo `.lib-add` está dentro da janela `adicionar-produto` (ex.: `.janela:has(.lib-add)`), com largura máx. 520px.
- Sem mudanças de lógica.
