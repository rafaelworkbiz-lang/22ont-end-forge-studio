# PATCH-015 — Nova página inicial v2

Trocar só a página pública inicial (`/`) pela nova versão: Mercado Livre + Shopee, produtos validados, lojas com IA, Colocar no ar e Divulgação. Painel, login, lojas públicas e banco não mudam. Links de compra da Applyfy continuam os mesmos.

## O que vai aparecer (nesta ordem)
1. **Menu fixo** claro: logo, Vídeo, Como funciona, Recursos, Planos, Dúvidas, Entrar e Assinar. No celular vira botão "Menu" que abre uma gaveta de baixo.
2. **Topo amarelo** com "AFILIA" ao fundo, título "Sua loja de afiliado no ar em minutos.", botões "Ver planos" e "Assistir vídeo · 80s", selos "Conecta com" Mercado Livre e Shopee e, à direita, a loja de exemplo "Casa Esperta" com 3 produtos e "● No ar".
3. **Vídeo**: capa amarela clara com mascote, "Chega de link solto." e lista dos 6 capítulos. Como o vídeo ainda não existe, o botão fica desativado escrito "Em breve". Já fica pronto para, quando o arquivo chegar, tocar só depois do clique, com legenda e pulo por capítulo.
4. **Como funciona**: 5 cartões (01 amarelo).
5. **Recursos**: grade de cartões, com números do painel modestos e marcados "Dados ilustrativos."
6. **Sozinho x Com o AfiliaPlace**.
7. **Planos**: Mensal R$ 179,90/mês e Vitalício em destaque "12x de R$ 24,75" com "ou R$ 297,00 à vista · pagamento único" logo abaixo. No celular o Vitalício vem primeiro. Texto da Applyfy embaixo.
8. **Dúvidas**: as 8 perguntas, a primeira aberta, funcionando também pelo teclado.
9. **Chamada final amarela** "Sua próxima loja pode estar no ar hoje."
10. **Rodapé** com Termos, Privacidade, Entrar e aviso de marcas.

Sai da página atual: o título só "AfiliaPlace", o "Comissão hoje R$ 3.486,67", o catálogo de 6 produtos, a cena 3D e menções a "scripts" e "Integrações".

## Páginas novas
- `/termos` e `/privacidade` com texto provisório marcado "em revisão" (precisam de texto revisado por você/advogado).

## O que fica igual
- A página do afiliado `/r234` continua usando o mesmo visual com os preços e links dele (R$ 172 e R$ 297).
- O bloqueio de F12 não vale nesta página.

## Pendências suas antes de publicar
1. Valor real da parcela de 12x na Applyfy (uso R$ 24,75 até você confirmar).
2. Formas de pagamento ativas (cartão, Pix, boleto?).
3. Arquivo do vídeo, legenda e tempos dos capítulos.
4. Mascote sem escudo da CBF/Nike (vou usar o mascote/logo atual se não houver outro).
5. Imagem de compartilhamento: vou gerar uma 1200×630 amarela com o título.

## Detalhes técnicos
- Reescrever `src/components/landing-page.tsx` mantendo a prop `partner` usada por `/r234`; remover import de `landing-scene` e `landing-sales-preview` da LP (arquivos ficam se usados em outro lugar).
- Constantes `PRECO_VITALICIO_PARCELA = "24,75"` e `VIDEO_SRC = null` (com `VIDEO_VTT`); player com `preload="none"`, `playsInline`, `controls`, troca capa→`<video>` no clique; eventos video_play/50/complete/chapter_click via função de analytics no-op segura.
- Estilos em `src/styles.css` sob escopo `.lp2` com os tokens do patch; `scroll-margin-top` nas seções; animação de entrada com IntersectionObserver e `prefers-reduced-motion`.
- `head()` de `/` com title, description, og/twitter e JSON-LD FAQPage; `og:image` só se houver URL absoluta (imagem enviada via lovable-assets).
- Rotas `src/routes/termos.tsx` e `src/routes/privacidade.tsx` com head próprio.
- Verificar em 1440, 1366×657 e 390 via navegador; Lighthouse se disponível.
