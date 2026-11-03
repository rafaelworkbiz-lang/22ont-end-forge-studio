# Links de checkout nos planos

## 1. O que muda na apresentação
- O botão **Assinar mensal** passa a abrir, em nova aba, o checkout mensal:
  https://checkout.applyfy.com.br/checkout/cmv5qan5c116601pyslk4840p?offer=OBULDYP
- O botão **Quero o vitalício** passa a abrir, em nova aba, o checkout vitalício:
  https://checkout.applyfy.com.br/checkout/cmv670zs13ndi01ps8gm04bsh?offer=B0QAGV6
- Todos os demais botões continuam como estão: **Entrar**, **Criar conta**, **Acessar painel**, o botão do destaque inicial e o botão da chamada final seguem levando para a conta ou para o painel; **Ver planos** e os botões do catálogo continuam rolando a página.
- Os preços exibidos não mudam: **Mensal R$ 179,90/mês** e **Vitalício R$ 297,00 à vista ou 12x**.
- O visual dos botões fica igual: o do plano mais escolhido continua dourado em largura total, o do mensal continua com contorno.

## 2. Como será feito
- Os dois endereços de checkout entram nos dados dos planos, junto de nome, preço e descrição, em vez de ficarem soltos no meio da página.
- O botão de cada plano deixa de ser um link interno e passa a ser um link externo que abre em nova aba, com proteção de segurança para links externos.
- Nada de cobrança, saldo, permissões ou dados de conta é alterado: é só o destino dos dois botões.
- Os dois endereços são guardados na memória do projeto, para não precisarem ser informados de novo.

## Detalhes técnicos
- Em `src/components/landing-page.tsx`: acrescentar o campo de checkout a cada objeto de `plans` e trocar o `<Link to={destination}>` do botão por `<a href target="_blank" rel="noopener noreferrer">`, mantendo as mesmas classes (`lp-btn lp-btn-block` / `lp-btn-ghost`) e o texto atual.
- `destination` segue usado nos demais botões da página; nenhuma rota, redirecionamento ou regra de sessão muda.
- Gravar os dois links em `mem://features/checkout-links` e registrar a linha em `mem://index.md`.

## Validação
- Conferir no navegador que cada botão abre a aba correta com o endereço certo e que a apresentação continua aberta.
- Conferir que os demais botões seguem levando para conta/painel e que o catálogo ainda rola até os planos.
- Rodar os testes e conferir o painel de erros da página antes de concluir.
- Verificar os links com identidade de navegador (já confirmado: os dois respondem corretamente).
