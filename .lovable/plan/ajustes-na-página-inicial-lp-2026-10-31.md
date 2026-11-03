# Ajustes na página inicial (LP)

## 1. Nova chamada principal
- Trocar "Sua loja de afiliado no ar em minutos." por **"Venda como afiliado direto do seu fornecedor."**
- Subtítulo: "Mercado Livre e Shopee na palma da sua mão. Torne-se afiliado, escolha produtos validados e comece a divulgar."
- Ajustar título/descrição de compartilhamento da página para combinar.

## 2. Menu do topo
- Menu flutuante com bordas totalmente arredondadas (formato cápsula).
- Mais curto na largura (centralizado, sem ocupar a tela toda).
- Ao rolar, ganha leve sombra e fundo translúcido.

## 3. Efeito de rolagem na página toda
- Cada seção aparece suavemente (sobe e clareia) ao entrar na tela.
- Cartões entram em sequência (um após o outro).
- Respeita quem prefere menos movimento (sem animação nesses casos).

## 4. Nova seção "Conecte com o seu fornecedor"
- Logo após o topo: cartões Mercado Livre e Shopee, texto "Seu fornecedor na palma da sua mão" e "Torne-se afiliado".
- Os "5 passos de cadastro" (Como funciona) passam a entrar com animação de rolagem, um por vez.

## 5. Seção de Planos
- O fundo amarelo passa a cobrir **a seção inteira** de planos (de ponta a ponta), não só o bloco.
- Animação sempre ligada: troca automática entre Vitalício e Mensal sem parar (inclusive ao passar o mouse), com transição "pop" (leve aumento + troca de cor para o amarelo).
- Textos de limite corretos: **Vitalício = até 10 lojas**, **Mensal = até 3 lojas** (o sistema já bloqueia isso de verdade).

## 6. Perguntas frequentes e rodapé
- Título e lista de perguntas centralizados.
- Rodapé centralizado (marca, links Termos/Privacidade/Entrar).
- Acrescentar 3 perguntas novas: "Preciso já ser afiliado?", "Funciona com Shopee?", "Posso cancelar o Mensal?".

## Detalhes técnicos
- Arquivos: `src/components/landing-page.tsx`, `src/styles.css` (classes `.lp2`), `src/routes/index.tsx` (head).
- Rolagem via IntersectionObserver em um hook leve + classes CSS `.lp2-reveal`; `prefers-reduced-motion` desliga.
- Remover pausa por hover no palco de planos; intervalo mantido em 5s.
- Nada será publicado sem sua autorização.
