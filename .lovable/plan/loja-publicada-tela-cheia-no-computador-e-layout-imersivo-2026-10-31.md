# Loja publicada: tela cheia no computador e layout Imersivo

## 1. Ocupar a página toda (todas as lojas, no computador)
Hoje a loja fica numa coluna central com faixas cinza dos lados. Vai mudar para:
- loja ocupando a largura inteira da tela, com uma margem confortável nas laterais (sem caixa central);
- banner de ponta a ponta;
- grade de produtos se ajustando à largura: 5 por linha em telas comuns e 6 em telas bem largas. Na sua foto ficaram só 3 cartões e um buraco à direita; isso acaba;
- celular continua como está.

## 2. Novo layout "Imersivo"
Nova opção na etapa Layout do editor, pensada para impressionar:
- **Banner gigante em tela cheia** (quase a altura da tela), com a foto da loja ao fundo e um escurecido suave para o texto ficar legível;
- **Topo transparente por cima do banner**, com logo e busca; ao rolar, ele fica branco e gruda no alto;
- frase grande e o botão "Ver achados" no canto esquerdo; a "Oferta do dia" flutua num cartão à direita;
- **categorias numa barra que gruda no topo** enquanto você rola os produtos;
- produtos em grade larga, cartões sem borda, foto grande, e um leve zoom na foto ao passar o mouse;
- os produtos surgem suavemente ao rolar (quem prefere menos movimento no aparelho não vê animação).

A prévia no editor mostra igual à loja publicada. As lojas atuais continuam com o layout que já têm, só ganham a largura total.

## Detalhes técnicos
- `styles.css`: remover o `max-width` do contêiner `.loja` na página pública acima de 1024px, usar padding lateral com `clamp()`; `.loja-grid` com `repeat(auto-fill, minmax(220px, 1fr))` no computador.
- `store-theme.ts`: novo item `imersivo` em `LAYOUTS`; `stores.functions.ts` aceita o novo preset.
- `loja-publica.tsx`: variante `loja-l-imersivo` com hero 88vh, header sobreposto e sticky (classe ao rolar via IntersectionObserver), barra de categorias sticky, reveal com IntersectionObserver respeitando `prefers-reduced-motion`.
- Conferir com foto da tela em 1716px e 1920px e no celular.
