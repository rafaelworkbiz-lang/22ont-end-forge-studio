# Ajustes finos da página inicial

## 1. Título do topo
- Trocar por **"Venda direto do seu fornecedor."** (sem a palavra "afiliado").
- Entrada animada: as palavras sobem e aparecem uma a uma ao abrir a página.

## 2. Corrigir o bloco amarelo "bugado" ao recarregar
- O círculo do efeito "pop" não aparece mais no carregamento: só roda quando a cena realmente troca.
- A página não fica mais com rolagem para o lado por causa do amarelo de ponta a ponta.

## 3. Entrada bonita do bloco de Planos
- O bloco começa com bordas arredondadas e um pouco menor; ao rolar até ele, cresce e ocupa a largura toda (cantos se abrem suavemente).

## 4. Animação ao passar o mouse
- A troca automática continua.
- Se a pessoa deixar o mouse **1 segundo** em cima de um plano, ele vira o destaque e as lojas dele acendem em amarelo, uma a uma.
- Ao tirar o mouse, a troca automática volta.

## 5. Alinhar os dois planos
- Nome, preço, quadro de lojas, lista e botão ficam na mesma altura nos dois cartões, lado a lado.

## 6. Remover e centralizar
- Remover a frase "Pagamento seguro pela Applyfy…".
- Perguntas frequentes: título e perguntas centralizados na página, com entrada animada.

## Detalhes técnicos
- `src/components/landing-page.tsx`: título com spans por palavra (`--i` para atraso); `pop` com chave só após a primeira troca; hover com `setTimeout(1000)` definindo `foco`; remover `lp2-note`.
- `src/styles.css`: `overflow-x: clip` no `.lp2`; `.lp2-palco` com `clip-path`/`border-radius` animando ao entrar (`.in`); cartões com `display:grid; grid-template-rows: subgrid` (ou alturas mínimas fixas para preço/lojas) para alinhar; FAQ com `max-width` + `margin-inline:auto`.
- Respeita "menos movimento". Nada será publicado sem autorização.
