# Corrigir contraste do texto "Os dois incluem Mercado Livre e Shopee…"

O texto branco sobre o amarelo ficou difícil de ler. Correção:
- Manter o texto em branco, mas dentro de uma faixa escura arredondada (preto suave), centralizada abaixo do título "Dois planos. Sem letra miúda."
- Assim o branco fica bem legível sobre o amarelo e combina com os botões pretos da página.
- No celular a faixa quebra em linhas sem cortar.

## Detalhes técnicos
- `src/styles.css`: `.lp2-palco-head .lp2-lead` com `background: #16140F`, `color: #fff`, `border-radius: 24px`, `padding: 14px 22px`, `display: inline-block`, sem `text-shadow`.
- Nada publicado sem autorização.
