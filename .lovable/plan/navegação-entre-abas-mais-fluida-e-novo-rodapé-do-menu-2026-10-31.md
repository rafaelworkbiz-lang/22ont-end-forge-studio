## Navegação entre abas mais fluida e novo rodapé do menu

### Problema do amarelo
Hoje, ao trocar de aba, dois destaques amarelos aparecem no menu: o item novo fica amarelo forte na hora, enquanto uma faixa amarela clara ainda desliza do item anterior. Isso causa o efeito de "piscar" ou de dois amarelos.

### O que muda
- Fica um único destaque amarelo, que desliza suavemente até a aba escolhida.
- Texto e ícone mudam de cor junto com o destaque, sem piscar.
- Na primeira vez que o menu aparece, o destaque surge direto no lugar certo, sem animação.
- Em telas onde o movimento está reduzido, a troca acontece sem animação.
- Rodapé do menu, de cima para baixo:
  1. Perfil (foto/inicial e nome)
  2. Configurações
  3. Sair da conta
- No celular, o menu "Mais" segue a mesma ordem.

### Detalhes técnicos
- Em `styles.css`, `.v2-nav-pill` passa a usar `var(--v2-yellow)` sólido. Quando a pill existir, `.v2-nav-item.is-active` fica com fundo transparente e `z-index:1`, com transição de `color`. A pill só ganha `transition` depois da primeira medição (classe `is-ready`).
- Em `panel-shell.tsx`, mover o bloco `.v2-user` para antes do `NavLink` de Configurações, no rodapé da barra lateral e no "Mais" do celular.
- Conferir no navegador a troca entre várias abas em 1716px.
