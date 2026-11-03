# PATCH-016 — Seção de planos viva

Só a seção "Planos" da página inicial muda. Resto da página, painel e banco ficam como estão; links de checkout da Applyfy mantidos.

## O que a pessoa vai ver
- A seção inteira vira um "palco" com cantos bem arredondados que troca de cor sozinho a cada 5s: amarelo cheio (Vitalício, começa nele) e creme (Mensal).
- Os dois planos sempre lado a lado (no celular, Vitalício em cima). O plano da vez sobe um pouco com borda escura; o outro continua totalmente legível.
- Caixa de lojas em cada cartão: 3 lojas acendendo no Mensal (+ espaço "+7 no Vitalício") e 10 lojas acendendo em cascata no Vitalício.
- Número gigante "3"/"10" bem clarinho ao fundo e faixa de texto "MENSAL · 3 LOJAS · VITALÍCIO · 10 LOJAS ·" correndo devagar.
- Dois tracinhos mostram a cena atual e um botão "Pausar animação" (some ao pausar).
- Passar o mouse, tocar ou navegar pelo teclado num cartão troca na hora para aquele plano; ao sair, o ciclo continua.
- Preços: Mensal R$ 179,90/mês; Vitalício "12x de R$ 24,75" com "ou R$ 297,00 à vista · pagamento único". Botões "Assinar mensal" e "Quero o vitalício". Nota de pagamento seguro Applyfy e arrependimento de 7 dias abaixo.
- Com "reduzir movimento" ligado: nada anima, fica no Vitalício.

## Detalhes técnicos
- `landing-page.tsx`: substituir o bloco `#planos` por `SecaoPlanos`, `CartaoPlano`, `GradeLojas`; constante única `PLANOS` usando `PRECO_VITALICIO_PARCELA` e as URLs de checkout atuais.
- Estado `cena/foco/pausado/visivel` + `setInterval` 5000ms só quando visível (IntersectionObserver 0.25), aba visível (visibilitychange), sem pausa e sem reduced-motion; ao entrar na tela volta para Vitalício.
- CSS em `styles.css` (classes `.lp2-palco*`), cores como variáveis `--palco-mensal/--palco-vitalicio`; anima só background-color, transform, opacity; sem gradiente nem bloco preto; sem scale no celular.
- Acessibilidade: `article aria-labelledby`, decorações `aria-hidden`, sem aria-live, foco visível, botões 56px.
- `/r234` usa o mesmo componente com os preços dele (R$ 172 / R$ 297) — manter.
- Verificar no servidor o bloqueio da 4ª loja (Mensal) e 11ª (Vitalício) e relatar.
- Testar no navegador em 1440, 1366×657 e 390: prints das duas cenas, hover, pausa, sem rolagem lateral. Gravação de vídeo não é possível aqui; envio prints.
