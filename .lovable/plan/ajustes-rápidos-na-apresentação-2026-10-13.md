# Ajustes rápidos na apresentação

## 1. Preço do Vitalício: R$ 259,90 → R$ 297,00
- Em `src/components/landing-page.tsx`, alterar o preço do plano Vitalício para **297,00**, mantendo o sufixo "à vista ou 12x".
- Nenhuma alteração de cobrança ou backend: é só o texto da apresentação.

## 2. "Ver catálogo" e "Explorar produtos" rolam até os planos
- Na seção de catálogo (`#produtos`), o botão por produto ("Ver catálogo") e o botão do rodapé da seção ("Explorar produtos") deixam de navegar para o painel/auth e passam a rolar a página até a seção **#planos**.
- Os demais botões (hero, planos, CTA final) continuam apontando para o painel ou para a criação de conta, como já estão.

## Validação
- Conferir no navegador: o clique nos dois botões do catálogo rola suavemente até os planos; o Vitalício exibe R$ 297,00; nenhum aviso ou erro de build.
