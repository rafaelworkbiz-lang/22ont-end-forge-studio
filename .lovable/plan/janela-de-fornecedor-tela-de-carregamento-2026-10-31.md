# Janela de fornecedor + tela de carregamento

## 1. Janela "Usar esse fornecedor"
- O ícone que "pula" na abertura (quadrado preto com ícone amarelo) passa a ser um círculo perfeito, com bordas totalmente arredondadas.
- As barrinhas de progresso no topo e os cantos da janela ficam com arredondamento total e suave, sem pontas retas.
- A animação de entrada continua a mesma.

## 2. Tela que aparece ao recarregar o site
Hoje, ao recarregar, aparece uma tela escura com só o nome "AfiliaPlace" escrito. Vira uma tela de abertura bonita e clara:
- Fundo cinza bem clarinho (padrão do painel), sem preto.
- No centro: o logotipo da AfiliaPlace dentro de um cartão branco arredondado com sombra leve, o nome "Afilia" + "Place" (Place em amarelo/dourado) abaixo.
- Uma barrinha amarela fina e arredondada deslizando embaixo, indicando que está carregando, e o texto pequeno "Preparando seu painel…".
- Entrada suave (aparece devagar); sem animação para quem prefere movimento reduzido.

## Detalhes técnicos
- `styles.css`: `.sob-ico` com `border-radius: 50%`; revisar `.sob-dots span` e raio da janela.
- `src/routes/painel.tsx`: Splash recebe logo + barra; `.auth-gate` com fundo `--v2-bg` fixo (não depende do tema), cartão e keyframe da barra.
- Conferir no navegador com a conta de teste (recarregar /painel e abrir a janela). Nada é publicado.
