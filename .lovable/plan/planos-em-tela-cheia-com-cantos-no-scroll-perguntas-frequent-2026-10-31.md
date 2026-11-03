# Planos em tela cheia com cantos no scroll + Perguntas frequentes centralizadas

## 1. Bloco amarelo de Planos
- Ocupa a largura toda da tela (de ponta a ponta).
- Efeito ligado à rolagem: enquanto o bloco sobe na tela, os cantos de cima e de baixo ficam arredondados e ele vem subindo levemente; quando ele chega ao centro da tela, os cantos ficam retos e ele cobre tudo; ao continuar rolando para sair, os cantos voltam a arredondar.
- Transição suave, acompanhando o dedo/mouse (sem "pulos").
- Quem prefere menos movimento vê o bloco parado, sem efeito.

## 2. Perguntas frequentes no lugar certo
- Etiqueta "DÚVIDAS", título "Perguntas frequentes." e a lista ficam centralizados no meio da página.
- Lista com largura confortável de leitura (cerca de 760px), perguntas alinhadas à esquerda dentro dela, como em sites profissionais.
- Abaixo da lista, uma linha "Ainda com dúvida? Fale com a gente por e-mail".

## Detalhes técnicos
- Causa do FAQ "de lado": `.lp2 h2 { max-width: 22ch }` sem `margin-inline: auto`. Corrigir em `#faq h2`.
- `SecaoPlanos`: listener de scroll com `requestAnimationFrame` calcula o progresso do bloco na tela e define `--raio` (0–48px) e `--sobe` (0–40px) no estilo; CSS usa `border-radius: var(--raio)` e `transform: translateY(var(--sobe))`. Remove o `clip-path` anterior.
- E-mail de suporte: usar o já existente no projeto, se houver; senão, deixo só "Fale com a gente" apontando para Entrar e peço o e-mail real.
- Arquivos: `src/components/landing-page.tsx`, `src/styles.css`. Nada publicado sem autorização.
