# Etapa "Peça afiliação" com cartões e trava

## O que muda (passo 2 do cadastro do influenciador)
1. **Dois cartões lado a lado, um para cada plano:** Mensal e Vitalício. Cada cartão mostra o nome do plano, uma frase curta e o botão "Se afiliar".
   - Ao clicar, o link da Applyfy abre em nova aba e o cartão fica verde com um "✓ Pedido aberto".
   - Se a pessoa entrou pelo time de um gerente, os botões usam os links desse gerente, como já acontece hoje.
2. **Trava do botão:** "Já pedi a afiliação" (agora "Continuar") só fica liberado depois de clicar nos dois cartões. Até lá aparece o aviso "Clique em se afiliar nos dois planos para continuar". Os cliques ficam guardados no navegador, então recarregar a página não zera.
3. **Blocos explicativos abaixo**, no mesmo estilo do convite:
   - "Clique em se afiliar" — abre a página do produto na Applyfy.
   - "Confirme na Applyfy" — clique em pedir afiliação dentro da Applyfy, nos dois.
   - "Aguarde a aprovação" — o gerente ou a administração aprova, e você recebe seus links.
4. **Visual da etapa:** título com ícone, espaçamento maior, cartões arredondados e botão de continuar com largura total no celular.

## Detalhes técnicos
- Somente em `influencer-onboarding.tsx`, no passo 1; os cliques ficam salvos com uma chave por conta e são lidos depois de a página carregar.
- Reaproveita os estilos `.cv-cards`; novos estilos `.onb-aff*` em `styles.css`, usando as cores do tema.
- O servidor não muda: o avanço continua sendo `step.mutate("afiliacao")`.
