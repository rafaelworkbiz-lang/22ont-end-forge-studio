# Menu lateral recolhe ao abrir janelas

## O que muda
- Ao abrir qualquer janela no painel (Editar loja, Colocar no ar, Adicionar produto, Fornecedor, Cupons etc.), o menu da esquerda se recolhe com uma animação suave.
- Ao fechar a janela, o menu volta a abrir sozinho, também com animação.
- Se você já tinha deixado o menu recolhido, ele continua recolhido depois de fechar (sua preferência não é alterada).
- Quem prefere menos movimento no aparelho vê a troca sem animação.

## Detalhes técnicos
- `panel-shell.tsx`: ler `?janela=` do endereço; quando houver janela, forçar `collapsed = true` sem gravar no localStorage. Também vale para Dialogs compartilhados via classe no body, se já existir; senão só as janelas do registro.
- `styles.css`: transição de largura/transform na `.v2-sidebar` e no padding da `.v2-main` (~280ms, ease), com `prefers-reduced-motion` desligando.
