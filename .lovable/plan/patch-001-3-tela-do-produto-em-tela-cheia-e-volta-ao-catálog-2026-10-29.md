# PATCH-001.3 — Tela do produto em tela cheia e volta ao catálogo

## O que muda para você
1. **Tela cheia de verdade:** ao abrir um produto, a tela cobre tudo. O menu lateral (Dashboard, Produtos, Grupos...) some por completo, mas continua guardado do jeito que estava (aberto ou recolhido). A página de trás não rola enquanto o produto está aberto. Sem logo no topo; começa com "← Catálogo".
2. **Voltar igual por 4 caminhos:** "← Catálogo", X, Esc e o voltar do navegador fecham, limpam o endereço e devolvem a aba Produtos com busca, filtros, categoria, ordem e posição de rolagem mantidos; o card do produto recebe o foco.
3. **Ajustes visuais:** bloco "Confirme sua tag" com ícone + texto em cima e botão "Ir para Integrações" largura total embaixo. Fila do rodapé com barra fina (6px) escura e rolagem horizontal pela roda do mouse.
4. **Testes no navegador, item a item:** os 4 caminhos de volta, menu recolhido/expandido preservado, abrir → voltar → abrir 3 vezes, recarregar com produto no endereço, e celular 390px.

## Detalhes técnicos
- `product-workspace.tsx`: portal direto em `document.body`, `position: fixed; inset: 0`, z-index acima do layout; remover o cálculo `left` baseado na sidebar e o logo do topo.
- Travar scroll com `overflow: hidden` em `html/body` enquanto montado, restaurando o valor anterior no unmount; não tocar na chave salva da sidebar.
- Fechar unificado: uma função `close()` que navega removendo `produto`/`etapa` (replace quando aberto por navegação interna, respeitando histórico do botão voltar); guardar `scrollY` antes de abrir e restaurar após fechar; focar o card via `data-id`.
- Fila: handler `wheel` convertendo deltaY em scrollLeft; CSS `scrollbar-width: thin` + `::-webkit-scrollbar` 6px com tokens do tema.
- CSS `.pw-tagcta` em coluna com botão `w-full`.
- Nenhuma alteração em Dashboard, Grupos, Admin, pagamento ou banco.
