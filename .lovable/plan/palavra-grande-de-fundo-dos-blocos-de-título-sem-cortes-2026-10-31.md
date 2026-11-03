## Palavra grande de fundo dos blocos de título sem cortes

A palavra decorativa no fundo dos blocos pretos de título (como "LOJAS") está saindo da caixa pela direita e por baixo, por isso aparece cortada em todas as abas.

### O que muda
- A palavra passa a caber inteira dentro do bloco, com uma pequena margem nas bordas.
- O tamanho se ajusta à largura do bloco, para que palavras longas, como "DIVULGAÇÃO" e "FORNECEDORES", também apareçam inteiras.
- Ela continua discreta, no fundo, atrás do texto e dos números.
- Vale para todas as abas, inclusive em telas menores e no celular.

### Detalhes técnicos
- Em `src/styles.css`, mudar `.v2-tabhead-word` de `right:-.06em; bottom:-.22em` para `right:24px; bottom:12px`, com `font-size: clamp(64px, 11vw, 160px)` e `max-width: calc(100% - 48px)`, e ajustar também as regras de modo compacto e celular.
- Conferir no navegador as abas Lojas, Divulgação e Fornecedores em 1716px e 390px.
