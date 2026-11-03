## Vídeo da página inicial já rodando

O que muda na seção do vídeo:

1. **Vídeo rodando de fundo, mudo, em loop** assim que a seção aparece (prévia automática, sem controles, sem som), no lugar do cartão amarelo atual com mascote e textos.
2. **Só um botão no meio: "Assistir"**, por cima do vídeo, com leve escurecimento atrás para dar contraste.
3. **Ao clicar em Assistir**: o vídeo volta para o **início (0:00)**, liga o som, mostra os controles e toca normalmente. O botão some.
4. Capítulos ao lado continuam funcionando (pulam para o tempo certo, com som).
5. Quem prefere menos movimento no celular/computador vê o vídeo parado no primeiro quadro, com o mesmo botão.

### Detalhes técnicos
- `VideoSection` em `src/components/landing-page.tsx`: um único `<video>` sempre montado com `autoPlay muted loop playsInline preload="metadata"`; estado `playing` controla `controls`, `muted`, `loop`.
- `start(t=0)`: `currentTime = t`, `muted=false`, `loop=false`, `play()`.
- Overlay com botão central `lp2-btn-yellow` "Assistir"; estilos novos `.lp2-player-overlay` em `src/styles.css`.
- Respeita `prefers-reduced-motion` (sem autoplay).
