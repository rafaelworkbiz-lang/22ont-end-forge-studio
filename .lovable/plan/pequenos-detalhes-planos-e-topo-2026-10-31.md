# Pequenos detalhes: Planos e topo

## Planos
- Remover os números grandes "3" e "10" que aparecem atrás dos cartões quando a cena troca.
- Texto "Os dois incluem Mercado Livre e Shopee…" em branco (com leve sombra para continuar legível no amarelo).

## Topo (amarelo)
- Corrigir o título "Venda direto do seu fornecedor.": as palavras estão grudadas por causa da animação; volta o espaço normal entre elas.
- Ajustar o respiro dos textos: distância entre etiqueta, título, subtítulo, botões e "Conecta com" mais equilibrada; subtítulo com largura confortável.
- Remover o letreiro grande "AFILIA" do fundo do bloco amarelo.

## Detalhes técnicos
- `landing-page.tsx`: tirar `lp2-palco-num--3/--10` e o `lp2-bgword` do hero.
- `styles.css`: `.lp2-h1-anim span { margin-right: .22em }` (espaço some em inline-block); `.lp2-palco-head .lp2-lead { color: #fff; text-shadow }`; espaçamentos em `.lp2-hero-copy`.
- Nada publicado sem autorização.
