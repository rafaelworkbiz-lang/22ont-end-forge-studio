# Cadastro do influenciador: botão Voltar e explicação dos links

## O que muda
1. **Botão "← Voltar"** nas etapas 2 a 5, levando à etapa anterior (somente para rever; o que já foi confirmado continua salvo).
2. **Depois de enviar os links para revisão, não é mais possível voltar:**
   - as etapas anteriores ficam com cadeado na barra de cima;
   - sai o botão "Corrigir links" da etapa Revisão.
   - Só é possível mexer de novo se a administração ou o gerente recusar; nesse caso a pessoa volta ao início, com o motivo mostrado, como já acontece hoje.
3. **Etapa 4, "Onde pegar seus links", reescrita** com passos numerados e o que é cada coisa:
   - O que é: "Link de oferta é o seu link de venda pessoal. Quem comprar por ele gera comissão para você."
   - Passo a passo: entrar na Applyfy → menu **Meus produtos** → **Afiliações** → abrir **AfiliaPlace Mensal** → aba **Ofertas** → botão de copiar o link → repetir no **AfiliaPlace Vitalício**.
   - Exemplo de como o link se parece: `https://checkout.applyfy.com.br/checkout/…?offer=…`
   - Aviso: "Não use o link da página inicial do AfiliaPlace; ele precisa ser o seu."
4. **Etapa 5, "Cole os links", com cada campo explicado:**
   - **Seu código** — o final do endereço da sua página. Ex.: `rafa` vira `afiliaplace.site/rafa`. Prévia ao vivo do endereço.
   - **Campo 1: Link Mensal (R$ 172,00)** — cole aqui o link copiado da oferta do **Mensal**.
   - **Campo 2: Link Vitalício (R$ 297,00)** — cole aqui o link copiado da oferta do **Vitalício**.
   - Cada campo ganha botão "Colar" e aviso imediato se o link não for de checkout da Applyfy ou se os dois links forem iguais.
   - Caixa de aviso antes de enviar: "Depois de enviar, não dá para voltar. Confira os dois links."

## Detalhes técnicos
- Somente em `influencer-onboarding.tsx` e `styles.css`; o servidor não muda.
- Trava: quando o status é `links_enviados`, só a etapa 5 (índice 5) fica liberada.
- Os preços vêm das regras atuais da LP (Mensal R$172, Vitalício R$297).
