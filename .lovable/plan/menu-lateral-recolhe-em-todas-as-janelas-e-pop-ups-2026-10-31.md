# Menu lateral recolhe em TODAS as janelas e pop-ups

## Problema
A mudança anterior só recolhia o menu nas janelas que mudam o endereço da página. Vários pop-ups (confirmações, avisos, detalhes de produto, editores) abrem sem mexer no endereço, então o menu ficava aberto.

## O que muda
- Qualquer janela ou pop-up que abrir no painel recolhe o menu da esquerda com animação suave.
- Ao fechar, o menu volta a abrir. Se você mesmo tinha deixado o menu fechado, ele continua fechado.

## Passos
1. Abrir o painel no navegador com a conta de teste e confirmar quais janelas não recolhem o menu (incluindo "Editar loja").
2. No menu, além do endereço, detectar qualquer janela aberta na tela (todas usam a mesma base de janela, que marca a página enquanto está aberta) e recolher o menu nesse caso.
3. Conferir de novo no navegador: abrir "Editar loja", um produto e uma confirmação; ver o menu recolher e voltar ao fechar.

## Detalhes técnicos
- `panel-shell.tsx`: hook `useAlgumaJanelaAberta()` com MutationObserver em `document.body` procurando `[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]`; `collapsed = janelaAberta || dialogAberto || ...`. Sem gravar preferência.
- Ignorar o próprio menu sobreposto do celular e a caixa do Ctrl+K, se existir.
