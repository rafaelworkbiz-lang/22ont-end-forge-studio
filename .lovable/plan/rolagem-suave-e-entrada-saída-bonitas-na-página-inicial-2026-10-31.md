# Rolagem suave e entrada/saída bonitas na página inicial

## 1. Clique em "Assinar", "Ver planos" e no menu
- Em vez do pulo rápido, a página desliza com calma até a seção (cerca de 1,2s), começando devagar, acelerando e freando no final.
- Para no ponto certo, sem ficar escondido atrás do menu do topo.
- Se a pessoa rolar com o dedo/mouse no meio, a animação para na hora (não "briga" com ela).
- Vale para todos os links internos: Vídeo, Como funciona, Recursos, Planos, Dúvidas, Assinar e Ver planos (topo, menu do celular e rodapé).

## 2. Entrada e saída das seções
- **Entrada:** cada seção sobe, ganha nitidez (sai de um leve desfoque) e aparece; títulos entram primeiro, cartões depois, em sequência.
- **Saída:** ao rolar para longe, a seção que sai fica levemente menor e mais transparente, dando sensação de profundidade.
- Ao voltar rolando para cima, as seções reaparecem de novo (não é só uma vez).
- O bloco amarelo de Planos mantém o efeito de cantos arredondados que já tem.

## 3. Conforto
- Quem configurou o aparelho para "menos movimento" tem rolagem normal, sem desfoque nem escala.
- Efeito leve, sem travar no celular.

## Detalhes técnicos
- `src/components/landing-page.tsx`: handler de clique delegado em `.lp2` para `a[href^="#"]`, animando `window.scrollTo` com `requestAnimationFrame` e easing `easeInOutCubic`, compensando a altura do menu; cancela em `wheel`/`touchstart`/`keydown`; atualiza o `#` da URL com `history.replaceState`.
- `useReveal`: passa a alternar classes `in`/`out` (sem `unobserve`), com IntersectionObserver de vários limiares; saída via `--saida` calculado no scroll (opacity/scale) para seções já passadas.
- `src/styles.css`: transições de `opacity`, `transform`, `filter: blur()` com atrasos por filho; bloco `prefers-reduced-motion` desliga tudo.
- Nada publicado sem autorização.
